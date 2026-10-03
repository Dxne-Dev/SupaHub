"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptText, decryptText } from "@/lib/crypto";
import { SupabaseManagementApi } from "@/lib/supabase-api";
import { uploadSnapshotToR2, downloadSnapshotFromR2 } from "@/lib/r2-storage";
import { dumpDatabaseToGzip, restoreDatabaseFromGzip } from "@/lib/db-engine";
import {
  patSchema,
  projectTrackSchema,
  freezeProjectSchema,
  restoreProjectSchema,
  toggleKeepAliveSchema,
} from "@/lib/validations";
import { revalidatePath } from "next/cache";

/**
 * Génère l'URL d'autorisation officielle Supabase OAuth
 */
export async function getSupabaseOAuthUrl(origin?: string) {
  const clientId =
    process.env.SUPABASE_OAUTH_CLIENT_ID ||
    process.env.NEXT_PUBLIC_SUPABASE_OAUTH_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "Identifiant SUPABASE_OAUTH_CLIENT_ID manquant dans le fichier .env"
    );
  }

  const baseOrigin = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${baseOrigin}/auth/callback`;

  const url = new URL("https://api.supabase.com/v1/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);

  return { url: url.toString() };
}

/**
 * Sauvegarde le Supabase Personal Access Token (PAT) chiffré
 */
export async function saveSupabasePat(formData: { pat: string }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Non autorisé. Veuillez vous connecter." };
  }

  const parsed = patSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  try {
    const rawPat = parsed.data.pat.trim();

    // 1. Vérification de la validité du PAT en appelant l'API Supabase
    const api = new SupabaseManagementApi(rawPat);
    await api.listProjects();

    // 2. Récupération des tokens existants pour fusionner
    let tokensList: string[] = [];
    try {
      tokensList = await getUserTokens(user.id, supabase);
    } catch {
      tokensList = [];
    }

    if (!tokensList.includes(rawPat)) {
      tokensList.push(rawPat);
    }

    const encryptedTokens = encryptText(JSON.stringify(tokensList));

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: upsertErr } = await adminClient.from("user_profiles").upsert(
        {
          id: user.id,
          supabase_pat_encrypted: encryptedTokens,
          plan: "FREE", // valeur par défaut pour les nouvelles lignes (ignorée si la ligne existe)
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
      if (upsertErr) throw new Error(upsertErr.message);
    } else {
      const { error } = await supabase.from("user_profiles").upsert(
        {
          id: user.id,
          supabase_pat_encrypted: encryptedTokens,
          plan: "FREE",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id", ignoreDuplicates: false }
      );
      if (error) throw error;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projets");
    revalidatePath("/dashboard/parametres");
    return { success: true };
  } catch (err: any) {
    return { error: `Échec de vérification du Token : ${err.message}` };
  }
}

/**
 * Sauvegarde le profil et le PAT lors de l'onboarding initial
 */
export async function saveOnboardingProfile(formData: {
  fullName?: string;
  contactEmail?: string;
  pat?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // 1. Mise à jour des métadonnées de l'utilisateur
    const updatedMetadata = {
      ...user.user_metadata,
      full_name: formData.fullName || user.user_metadata?.full_name,
      name: formData.fullName || user.user_metadata?.name,
      username: formData.fullName || user.user_metadata?.username,
      contact_email: formData.contactEmail || user.user_metadata?.contact_email,
      onboarding_completed: true,
    };

    if (serviceRoleKey && supabaseUrl) {
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const updatePayload: any = {
        user_metadata: updatedMetadata,
      };

      if (formData.contactEmail && formData.contactEmail.includes("@")) {
        updatePayload.email = formData.contactEmail.trim();
        updatePayload.email_confirm = true;
      }

      await adminClient.auth.admin.updateUserById(user.id, updatePayload);
    }

    // 2. Si un PAT est renseigné, validation et enregistrement chiffré
    if (formData.pat && formData.pat.trim().length > 0) {
      const pat = formData.pat.trim();
      const api = new SupabaseManagementApi(pat);
      await api.listProjects();

      let tokensList: string[] = [];
      try {
        tokensList = await getUserTokens(user.id, supabase);
      } catch {
        tokensList = [];
      }

      if (!tokensList.includes(pat)) {
        tokensList.push(pat);
      }

      const encryptedTokens = encryptText(JSON.stringify(tokensList));

      if (serviceRoleKey && supabaseUrl) {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { error: profileErr } = await adminClient.from("user_profiles").upsert(
          {
            id: user.id,
            supabase_pat_encrypted: encryptedTokens,
            plan: "FREE",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id", ignoreDuplicates: false }
        );
        if (profileErr) throw new Error(profileErr.message);
      } else {
        const { error: profileErr } = await supabase.from("user_profiles").upsert(
          {
            id: user.id,
            supabase_pat_encrypted: encryptedTokens,
            plan: "FREE",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id", ignoreDuplicates: false }
        );
        if (profileErr) throw profileErr;
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projets");
    revalidatePath("/dashboard/parametres");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erreur lors de l'enregistrement du profil" };
  }
}

/**
 * Récupère l'ensemble des tokens déchiffrés (PAT et/ou OAuth multi-organisations) pour l'utilisateur.
 * Utilise TOUJOURS le client service_role pour bypasser RLS et garantir la lecture
 * même si la session utilisateur n'est pas encore pleinement établie (post-OAuth).
 */
export async function getUserTokens(userId: string, _supabaseClientUnused?: any): Promise<string[]> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    throw new Error("Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY).");
  }

  const { createClient: createAdminClient } = await import("@supabase/supabase-js");
  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile, error } = await adminClient
    .from("user_profiles")
    .select("supabase_pat_encrypted")
    .eq("id", userId)
    .single();

  if (error || !profile?.supabase_pat_encrypted) {
    throw new Error("Aucun jeton d'accès Supabase configuré.");
  }

  const decrypted = decryptText(profile.supabase_pat_encrypted);
  try {
    const parsed = JSON.parse(decrypted);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Token stocké comme string simple (ancienne version)
  }
  return [decrypted];
}

/**
 * Récupère le premier PAT/Token disponible
 */
async function getUserPat(userId: string, supabase: any): Promise<string> {
  const tokens = await getUserTokens(userId, supabase);
  if (!tokens || tokens.length === 0) {
    throw new Error("Aucun Personal Access Token Supabase configuré.");
  }
  return tokens[0];
}

/**
 * Récupère la liste consolidée de tous les projets et organisations de l'utilisateur
 * à travers toutes les organisations OAuth liées et son éventuel PAT.
 */
export async function fetchUserSupabaseProjects() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Non autorisé" };
  }

  try {
    const tokens = await getUserTokens(user.id, supabase);
    const allProjects: any[] = [];
    const allOrgs: any[] = [];
    const seenProjectIds = new Set<string>();
    const seenOrgIds = new Set<string>();

    for (const token of tokens) {
      try {
        const api = new SupabaseManagementApi(token);
        const [projects, orgs] = await Promise.all([
          api.listProjects().catch(() => []),
          api.listOrganizations().catch(() => []),
        ]);

        for (const p of projects || []) {
          if (!seenProjectIds.has(p.id)) {
            seenProjectIds.add(p.id);
            allProjects.push(p);
          }
        }
        for (const o of orgs || []) {
          if (!seenOrgIds.has(o.id)) {
            seenOrgIds.add(o.id);
            allOrgs.push(o);
          }
        }
      } catch (e) {
        console.warn("Échec de synchronisation pour un token :", e);
      }
    }

    return { projects: allProjects, organizations: allOrgs };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Importe/suit un projet Supabase dans SupaHub
 */
export async function trackProject(input: {
  supabaseProjectRef: string;
  projectName: string;
  dbPassword?: string;
  organizationId?: string;
  region?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const parsed = projectTrackSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { supabaseProjectRef, projectName, dbPassword, organizationId, region } = parsed.data;

  // Si un mot de passe DB est fourni, on construit l'URI Postgres par défaut Supabase
  let dbEncrypted: string | null = null;
  if (dbPassword) {
    const dbUri = `postgresql://postgres.${supabaseProjectRef}:${encodeURIComponent(dbPassword)}@aws-0-${region || "eu-west-1"}.pooler.supabase.com:6543/postgres`;
    dbEncrypted = encryptText(dbUri);
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  let insertError: any = null;

  if (serviceRoleKey && supabaseUrl) {
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await adminClient.from("monitored_projects").upsert(
      {
        user_id: user.id,
        supabase_project_ref: supabaseProjectRef,
        project_name: projectName,
        db_connection_uri_encrypted: dbEncrypted,
        organization_id: organizationId || "manual",
        region: region || "eu-west-1",
        status: "ACTIVE",
        keep_alive_enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,supabase_project_ref" }
    );
    insertError = error;
  } else {
    const { error } = await supabase.from("monitored_projects").upsert(
      {
        user_id: user.id,
        supabase_project_ref: supabaseProjectRef,
        project_name: projectName,
        db_connection_uri_encrypted: dbEncrypted,
        organization_id: organizationId || "manual",
        region: region || "eu-west-1",
        status: "ACTIVE",
        keep_alive_enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,supabase_project_ref" }
    );
    insertError = error;
  }

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projets");
  return { success: true };
}

/**
 * Active ou désactive la relance Keep-Alive 72h pour un projet
 */
export async function toggleProjectKeepAlive(input: {
  supabaseProjectRef: string;
  projectName: string;
  organizationId?: string;
  region?: string;
  enabled: boolean;
  anonKey?: string;
  serviceRoleKey?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  let keysEncrypted: string | null = null;
  if (input.anonKey || input.serviceRoleKey) {
    keysEncrypted = encryptText(
      JSON.stringify({
        anon_key: input.anonKey || null,
        service_role_key: input.serviceRoleKey || null,
      })
    );
  }

  const { error } = await supabase.from("monitored_projects").upsert(
    {
      user_id: user.id,
      supabase_project_ref: input.supabaseProjectRef,
      project_name: input.projectName,
      organization_id: input.organizationId || null,
      region: input.region || "eu-west-1",
      status: "ACTIVE",
      keep_alive_enabled: input.enabled,
      db_connection_uri_encrypted: keysEncrypted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,supabase_project_ref" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projets");
  return { success: true };
}

/**
 * Active ou désactive le Keep-Alive pour un projet (par id)
 */
export async function toggleKeepAlive(input: { monitoredProjectId: string; enabled: boolean }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const parsed = toggleKeepAliveSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("monitored_projects")
    .update({ keep_alive_enabled: parsed.data.enabled, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.monitoredProjectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Crée une session de paiement Chariow pour passer au plan PRO.
 * Intègre l'identifiant utilisateur dans custom_metadata pour la liaison webhook.
 */
export async function createChariowCheckout(origin?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const apiKey = process.env.CHARIOW_API_KEY;
  const productId = process.env.CHARIOW_PRODUCT_ID;
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!apiKey || !productId) {
    return { error: "Configuration Chariow manquante (CHARIOW_API_KEY / CHARIOW_PRODUCT_ID)" };
  }

  const email = user.email || user.user_metadata?.contact_email || "";
  const fullName: string =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    "Membre";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "Membre";
  const lastName = nameParts.slice(1).join(" ") || "SupaHub";

  try {
    const res = await fetch("https://api.chariow.com/v1/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: { number: "0000000000", country_code: "FR" },
        redirect_url: `${siteUrl}/dashboard/projets?upgrade=success`,
        custom_metadata: {
          supahub_user_id: user.id,   // clé pour le webhook Pulse
          supahub_plan_target: "PRO",
        },
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Erreur Chariow checkout:", json);
      return { error: json.message || "Erreur lors de la création du checkout" };
    }

    const step = json?.data?.step;

    if (step === "payment") {
      return { checkoutUrl: json.data.payment.checkout_url as string };
    }

    if (step === "already_purchased") {
      // L'user a déjà acheté — on passe directement en PRO
      const { createClient: createAdminClient } = await import("@supabase/supabase-js");
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await adminClient
        .from("user_profiles")
        .update({ plan: "PRO", updated_at: new Date().toISOString() })
        .eq("id", user.id);
      revalidatePath("/dashboard");
      return { alreadyPro: true };
    }

    return { error: "Réponse inattendue du service de paiement" };
  } catch (err: any) {
    return { error: `Erreur réseau : ${err.message}` };
  }
}

/**
 * Récupère le plan actuel de l'utilisateur (FREE ou PRO)
 */
export async function getUserPlan(userId: string, supabaseClient?: any): Promise<"FREE" | "PRO"> {
  const supabase = supabaseClient || (await createClient());
  const { data } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  return (data?.plan as "FREE" | "PRO") || "FREE";
}

/**
 * Met à niveau l'utilisateur vers le plan PRO (9,99$/mois)
 */
export async function upgradeUserToPro() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("user_profiles")
    .update({ plan: "PRO", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projets");
  revalidatePath("/dashboard/sauvegardes");
  return { success: true };
}

/**
 * MODULE FREEZE (F4): Dump DB -> Upload Cloudflare R2 -> Delete Supabase Project -> Update Status
 */
export async function freezeProject(input: {
  monitoredProjectId?: string;
  supabaseProjectRef?: string;
  dbPassword?: string;
  region?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const parsed = freezeProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 1. Vérification des limites du Plan FREE
  const plan = await getUserPlan(user.id, supabase);

  let project: any = null;

  if (parsed.data.monitoredProjectId) {
    const { data: p, error: pError } = await supabase
      .from("monitored_projects")
      .select("*")
      .eq("id", parsed.data.monitoredProjectId)
      .eq("user_id", user.id)
      .single();

    if (pError || !p) return { error: "Projet introuvable." };
    project = p;
  } else if (parsed.data.supabaseProjectRef) {
    const { data: p } = await supabase
      .from("monitored_projects")
      .select("*")
      .eq("supabase_project_ref", parsed.data.supabaseProjectRef)
      .eq("user_id", user.id)
      .single();

    if (p) {
      project = p;
    } else {
      // Création automatique de l'entrée monitorée
      const dbUri = parsed.data.dbPassword
        ? `postgresql://postgres.${parsed.data.supabaseProjectRef}:${encodeURIComponent(parsed.data.dbPassword)}@aws-0-${parsed.data.region || "eu-west-1"}.pooler.supabase.com:6543/postgres`
        : null;

      const { data: newP, error: createErr } = await supabase
        .from("monitored_projects")
        .insert({
          user_id: user.id,
          supabase_project_ref: parsed.data.supabaseProjectRef,
          project_name: parsed.data.supabaseProjectRef,
          db_connection_uri_encrypted: dbUri ? encryptText(dbUri) : null,
          region: parsed.data.region || "eu-west-1",
          status: "ACTIVE",
          keep_alive_enabled: false,
        })
        .select()
        .single();

      if (createErr || !newP) {
        return { error: createErr?.message || "Impossible d'initialiser le projet" };
      }
      project = newP;
    }
  }

  if (!project) return { error: "Projet introuvable." };

  // Vérification de la limite de Snapshots Freeze (1 max en FREE)
  if (plan === "FREE") {
    const { count: frozenCount } = await supabase
      .from("monitored_projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "FROZEN");

    if ((frozenCount || 0) >= 1 && project.status !== "FROZEN") {
      return {
        error: "LIMIT_REACHED:FREEZE_SLOT",
        limitType: "FREEZE_SLOT",
        message:
          "Sur le plan FREE : Vous êtes limité à 1 seul projet congelé/archivé à la fois dans votre réserve. Passez au plan PRO (9,99$/mois) pour stocker des snapshots illimités.",
      };
    }
  }

  let dbUri = "";
  if (parsed.data.dbPassword && parsed.data.supabaseProjectRef) {
    dbUri = `postgresql://postgres.${parsed.data.supabaseProjectRef}:${encodeURIComponent(parsed.data.dbPassword)}@aws-0-${parsed.data.region || project.region || "eu-west-1"}.pooler.supabase.com:6543/postgres`;
  } else if (project.db_connection_uri_encrypted) {
    dbUri = decryptText(project.db_connection_uri_encrypted);
  } else {
    return { error: "Mot de passe de base de données requis pour effectuer le dump." };
  }

  const pat = await getUserPat(user.id, supabase);

  // Marquer comme PROCESSING
  await supabase
    .from("monitored_projects")
    .update({ status: "PROCESSING" })
    .eq("id", project.id);

  try {
    // 2. Dump & Compression
    const gzipBuffer = await dumpDatabaseToGzip(dbUri);

    // Vérification de la limite de taille (500 Mo en FREE)
    if (plan === "FREE" && gzipBuffer.length > 500 * 1024 * 1024) {
      await supabase
        .from("monitored_projects")
        .update({ status: "ACTIVE" })
        .eq("id", project.id);

      return {
        error: "LIMIT_REACHED:SIZE_EXCEEDED",
        limitType: "SIZE_EXCEEDED",
        message: `Sur le plan FREE : Le dump de votre base (${(gzipBuffer.length / (1024 * 1024)).toFixed(1)} Mo) dépasse la limite de 500 Mo. Passez au plan PRO (9,99$/mois) pour sauvegarder jusqu'à 10 Go.`,
      };
    }

    // 3. Upload R2
    const timestamp = Date.now();
    const r2Key = `snapshots/${user.id}/${project.supabase_project_ref}_${timestamp}.sql.gz`;
    const uploadRes = await uploadSnapshotToR2(r2Key, gzipBuffer);

    // Rétention 60 jours en FREE, illimité en PRO
    const expiresAt =
      plan === "FREE"
        ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    // 4. Enregistrement du snapshot dans la BDD
    await supabase.from("project_snapshots").insert({
      project_id: project.id,
      user_id: user.id,
      supabase_project_ref: project.supabase_project_ref,
      r2_file_key: r2Key,
      file_size_bytes: uploadRes.size,
      expires_at: expiresAt,
    });

    // 5. Suppression sur Supabase (Uniquement si le dump et l'upload ont réussi !)
    const api = new SupabaseManagementApi(pat);
    await api.deleteProject(project.supabase_project_ref);

    // 6. Mise à jour de l'état
    await supabase
      .from("monitored_projects")
      .update({
        status: "FROZEN",
        keep_alive_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projets");
    revalidatePath("/dashboard/sauvegardes");
    return { success: true };
  } catch (err: any) {
    // Rétablir le statut ACTIVE en cas d'échec
    await supabase
      .from("monitored_projects")
      .update({ status: "ACTIVE" })
      .eq("id", project.id);

    return { error: `Échec du Freeze : ${err.message}` };
  }
}

/**
 * MODULE RESTORE (F5): Create Project -> Polling status -> Download R2 -> Gunzip & Restore PSQL -> Activate
 */
export async function restoreProject(input: {
  monitoredProjectId: string;
  organizationId: string;
  dbPassword: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const parsed = restoreProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { monitoredProjectId, organizationId, dbPassword } = parsed.data;

  // 1. Récupération du projet et du dernier snapshot
  const { data: project } = await supabase
    .from("monitored_projects")
    .select("*")
    .eq("id", monitoredProjectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "Projet introuvable" };

  const { data: latestSnapshot } = await supabase
    .from("project_snapshots")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestSnapshot) {
    return { error: "Aucun snapshot disponible pour restaurer ce projet." };
  }

  const pat = await getUserPat(user.id, supabase);
  const api = new SupabaseManagementApi(pat);

  // Marquer comme PROCESSING
  await supabase
    .from("monitored_projects")
    .update({ status: "PROCESSING" })
    .eq("id", project.id);

  try {
    // 2. Création du nouveau projet Supabase
    const newProject = await api.createProject({
      name: project.project_name,
      organization_id: organizationId,
      db_pass: dbPassword,
      region: project.region || "eu-west-1",
    });

    // 3. Polling jusqu'à ce que le projet soit prêt (ACTIVE_HEALTHY / STARTED)
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 x 5s = 150s (2.5 mins)

    while (!isReady && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;
      const current = await api.getProject(newProject.id);
      if (current.status === "ACTIVE_HEALTHY" || current.status === "STARTED") {
        isReady = true;
      }
    }

    if (!isReady) {
      throw new Error("Le provisionnement du projet a pris trop de temps.");
    }

    // 4. Télécharger le snapshot depuis R2
    const gzipBuffer = await downloadSnapshotFromR2(latestSnapshot.r2_file_key);

    // 5. Restaurer le dump via PSQL sur la nouvelle DB
    const newDbUri = `postgresql://postgres.${newProject.id}:${encodeURIComponent(dbPassword)}@aws-0-${project.region || "eu-west-1"}.pooler.supabase.com:6543/postgres`;
    await restoreDatabaseFromGzip(newDbUri, gzipBuffer);

    // 6. Mise à jour de SupaHub avec le nouveau ref de projet
    await supabase
      .from("monitored_projects")
      .update({
        supabase_project_ref: newProject.id,
        db_connection_uri_encrypted: encryptText(newDbUri),
        status: "ACTIVE",
        keep_alive_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    revalidatePath("/dashboard");
    return { success: true, newProjectRef: newProject.id };
  } catch (err: any) {
    await supabase
      .from("monitored_projects")
      .update({ status: "FROZEN" })
      .eq("id", project.id);

    return { error: `Échec de la restauration : ${err.message}` };
  }
}

/**
 * Supprime définitivement un projet sur Supabase pour libérer un slot d'organisation
 */
export async function deleteSupabaseProject(input: { supabaseProjectRef: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  if (!input.supabaseProjectRef) {
    return { error: "Identifiant de projet manquant" };
  }

  try {
    const tokens = await getUserTokens(user.id, supabase);
    let deleted = false;
    let lastError: any = null;

    for (const token of tokens) {
      try {
        const api = new SupabaseManagementApi(token);
        await api.deleteProject(input.supabaseProjectRef);
        deleted = true;
        break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!deleted && lastError) {
      return { error: `Impossible de supprimer le projet sur Supabase : ${lastError.message}` };
    }

    // Suppression dans les projets surveillés
    await supabase
      .from("monitored_projects")
      .delete()
      .eq("supabase_project_ref", input.supabaseProjectRef)
      .eq("user_id", user.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projets");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression du projet" };
  }
}
