import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserSupabaseProjects } from "@/app/actions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectsView } from "@/components/projects-view";

export default async function ProjectsPage() {
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Projets en direct via Supabase Management API
  let liveProjects: any[] = [];
  let liveOrgs: any[] = [];
  if (hasPat) {
    const liveProjectsData = await fetchUserSupabaseProjects();
    if (liveProjectsData && !liveProjectsData.error) {
      liveProjects = liveProjectsData.projects || [];
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
      <ProjectsView
        organizations={liveOrgs}
        allProjects={liveProjects}
        monitoredProjects={monitoredProjects || []}
        hasPat={hasPat}
        plan={plan}
      />
    </DashboardLayout>
  );
}
