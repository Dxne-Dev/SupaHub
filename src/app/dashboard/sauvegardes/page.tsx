import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserSupabaseProjects } from "@/app/actions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BackupsView } from "@/components/backups-view";

export default async function BackupsPage() {
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

  // 3. Snapshots R2
  const { data: snapshots } = await supabase
    .from("project_snapshots")
    .select(`
      id,
      snapshot_type,
      file_size_bytes,
      created_at,
      expires_at,
      r2_object_key,
      r2_file_key,
      monitored_projects!inner(
        id,
        supabase_project_ref,
        project_name,
        user_id
      )
    `)
    .eq("monitored_projects.user_id", user.id)
    .order("created_at", { ascending: false });

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
      <BackupsView
        snapshots={snapshots || []}
        organizations={liveOrgs}
        hasPat={hasPat}
        plan={plan}
      />
    </DashboardLayout>
  );
}

