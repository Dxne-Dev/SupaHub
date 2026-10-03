import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserSupabaseProjects } from "@/app/actions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ConnectOrgButton } from "@/components/connect-org-button";
import { PatConfigForm } from "@/components/pat-config-form";
import { Card } from "@/components/ui/card";
import { ShieldCheck, User, KeyRound, Bell, Building2, CheckCircle2 } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Profil PAT & Plan
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("supabase_pat_encrypted, plan")
    .eq("id", user.id)
    .single();

  const hasPat = !!profile?.supabase_pat_encrypted;
  const plan = (profile?.plan as "FREE" | "PRO") || "FREE";

  // 2. Projets enregistrés dans SupaHub
  const { data: monitoredProjects } = await supabase
    .from("monitored_projects")
    .select("*")
    .eq("user_id", user.id);

  let liveOrgs: any[] = [];
  if (hasPat) {
    const liveProjectsData = await fetchUserSupabaseProjects();
    if (liveProjectsData && !liveProjectsData.error) {
      liveOrgs = liveProjectsData.organizations || [];
    }
  }

  const protectedCount = (monitoredProjects || []).filter((p) => p.keep_alive_enabled).length;
  const frozenCount = (monitoredProjects || []).filter((p) => p.status === "FROZEN").length;
  const orgName = liveOrgs[0]?.name;

  return (
    <DashboardLayout
      user={user}
      hasPat={hasPat}
      orgName={orgName}
      protectedCount={protectedCount}
      frozenCount={frozenCount}
      plan={plan}
    >
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Paramètres du compte
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gérez vos clés d'accès Supabase, vos notifications et la sécurité de votre espace.
          </p>
        </div>

        {/* Profil */}
        <Card variant="card" className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Informations du compte
              </h2>
              <p className="text-xs text-neutral-500">
                Profil synchronisé lors de l'onboarding
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-400 block mb-1">Nom complet</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {user.user_metadata?.full_name || user.user_metadata?.name || "Non défini"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-400 block mb-1">Email de notification</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {user.user_metadata?.contact_email || user.email || "Non défini"}
              </span>
            </div>
          </div>
        </Card>

        {/* Organisations Supabase Liées */}
        <Card variant="card" className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Organisations Supabase connectées
                </h2>
                <p className="text-xs text-neutral-500">
                  Ajoutez d'autres organisations via Supabase OAuth en un clic
                </p>
              </div>
            </div>

            <ConnectOrgButton className="rounded-xl text-xs h-9 font-medium" />
          </div>

          {liveOrgs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {liveOrgs.map((org: any) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 block truncate">
                      {org.name}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 truncate block">
                      id: {org.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium shrink-0 ml-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Liée</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-2">
              Aucune organisation liée. Cliquez sur le bouton ci-dessus pour autoriser une organisation.
            </p>
          )}
        </Card>

        {/* Formulaire PAT Supabase */}
        <PatConfigForm hasPat={hasPat} />

        {/* Chiffrement et Sécurité */}
        <Card variant="card" className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Sécurité & Chiffrement AES-256
              </h2>
              <p className="text-xs text-neutral-500">
                Toutes les clés et secrets stockés sont chiffrés au repos
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Vos identifiants Supabase (Personal Access Token, Anon Key, URI de base de données) ne sont jamais stockés en clair. Ils sont chiffrés avec l'algorithme AES-256-GCM via votre clé secrète serveur <code className="font-mono text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">ENCRYPTION_SECRET</code>.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
