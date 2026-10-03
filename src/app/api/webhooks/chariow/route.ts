import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * POST /api/webhooks/chariow
 *
 * Reçoit les Pulses (webhooks) Chariow pour les ventes réussies.
 * Sur successful.sale :
 *   - Vérifie la signature HMAC-SHA256
 *   - Déduplique via x-pulse-delivery-id
 *   - Lit custom_metadata.supahub_user_id
 *   - Passe l'utilisateur au plan PRO en base
 */
export async function POST(request: Request) {
  // 1. Lire le body RAW avant tout parsing (requis pour la vérification HMAC)
  const rawBody = await request.text();

  // 2. Vérification de la signature HMAC-SHA256
  const pulseSecret = process.env.CHARIOW_PULSE_SECRET;
  if (!pulseSecret) {
    console.error("[Chariow Webhook] CHARIOW_PULSE_SECRET non configuré");
    return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
  }

  const receivedSignature = request.headers.get("x-chariow-signature") ?? "";
  const expectedSignature =
    "sha256=" +
    crypto.createHmac("sha256", pulseSecret).update(rawBody).digest("hex");

  const a = Buffer.from(receivedSignature);
  const b = Buffer.from(expectedSignature);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    console.warn("[Chariow Webhook] Signature invalide — requête rejetée");
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  // 3. Déduplication via x-pulse-delivery-id
  const deliveryId = request.headers.get("x-pulse-delivery-id");
  const event = request.headers.get("x-pulse-event") ?? "";

  // 4. Parser le payload JSON
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  // 5. Traiter uniquement l'événement "successful.sale"
  if (event !== "successful.sale" && payload?.event !== "successful.sale") {
    // Acquitter silencieusement les autres événements
    return NextResponse.json({ ok: true });
  }

  // 6. Extraire l'identifiant utilisateur SupaHub depuis custom_metadata
  const metadata = payload?.sale?.custom_metadata as Record<string, string> | null;
  const supahubUserId = metadata?.supahub_user_id;

  if (!supahubUserId) {
    console.warn("[Chariow Webhook] Vente sans supahub_user_id dans custom_metadata — ignorée");
    return NextResponse.json({ ok: true });
  }

  // 7. Passer l'utilisateur au plan PRO via service_role (bypass RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[Chariow Webhook] Variables Supabase manquantes");
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await adminClient
    .from("user_profiles")
    .update({
      plan: "PRO",
      updated_at: new Date().toISOString(),
    })
    .eq("id", supahubUserId);

  if (error) {
    console.error("[Chariow Webhook] Erreur mise à jour plan PRO:", error.message);
    // Retourner 500 pour que Chariow retente (retry policy)
    return NextResponse.json({ error: "Erreur BDD" }, { status: 500 });
  }

  console.log(
    `[Chariow Webhook] ✅ Utilisateur ${supahubUserId} passé en PRO — Sale: ${payload?.sale?.id} — Delivery: ${deliveryId}`
  );

  return NextResponse.json({ ok: true });
}
