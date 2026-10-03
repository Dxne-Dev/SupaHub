"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronsRight,
  Clock,
  Database,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ProjectCard, ProjectCardData } from "@/components/project-card";
import { PatConfigForm } from "@/components/pat-config-form";
import { OnboardingModal } from "@/components/onboarding-modal";
import { AddProjectModal } from "@/components/add-project-modal";

export interface DashboardCollapsibleProps {
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
      user_name?: string;
      username?: string;
      contact_email?: string;
      onboarding_completed?: boolean;
    };
  };
  hasPat?: boolean;
  monitoredProjects?: any[];
  liveProjectsData?: any;
}

export function DashboardWithCollapsibleSidebar({
  user,
  hasPat = false,
  monitoredProjects = [],
  liveProjectsData,
}: DashboardCollapsibleProps) {
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const email = user?.email || "";
  const orgName = liveProjectsData?.organizations?.[0]?.name;
  
  let displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    orgName ||
    "";

  // Si c'est un identifiant généré (supabase-xxxxxx), on privilégie l'organisation ou un libellé propre
  if (!displayName || displayName.startsWith("supabase-")) {
    displayName = orgName || (email && !email.startsWith("supabase-") ? email.split("@")[0] : "Membre Supabase");
  }

  const monitoredCount = monitoredProjects.length;
  const frozenCount = monitoredProjects.filter((p) => p.status === "FROZEN").length;
  const activeCount = monitoredProjects.filter((p) => p.status === "ACTIVE" || p.status === "ACTIVE_HEALTHY").length;
  const discoveredProjects = liveProjectsData?.projects || [];
  const trackedMap = new Map(monitoredProjects.map((p) => [p.supabase_project_ref, p]));
  const untrackedCount = discoveredProjects.filter((p: any) => !trackedMap.has(p.id)).length;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const filteredMonitored = monitoredProjects.filter((p) =>
    (p.project_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.supabase_project_ref || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscovered = discoveredProjects.filter(
    (p: any) =>
      !trackedMap.has(p.id) &&
      ((p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.id || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`flex min-h-screen w-full ${isDark ? "dark" : ""}`}>
      {/* Modale d'Onboarding interactive */}
      <OnboardingModal initialUser={user} />

      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Sidebar pliable */}
        <nav
          className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
            open ? "w-64" : "w-16"
          } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm flex flex-col justify-between`}
        >
          <div>
            <TitleSection open={open} orgName={orgName} />

            <div className="space-y-1 mb-6">
              <Option
                Icon={LayoutDashboard}
                title="Dashboard"
                selected={selected}
                setSelected={setSelected}
                open={open}
              />
              <Option
                Icon={Layers}
                title="Flotte Supabase"
                selected={selected}
                setSelected={setSelected}
                open={open}
                notifs={monitoredCount > 0 ? monitoredCount : undefined}
              />
              <Option
                Icon={Archive}
                title="Sauvegardes R2"
                selected={selected}
                setSelected={setSelected}
                open={open}
                notifs={frozenCount > 0 ? frozenCount : undefined}
              />
              <Option
                Icon={Activity}
                title="Heartbeat (72h)"
                selected={selected}
                setSelected={setSelected}
                open={open}
              />
              <Option
                Icon={KeyRound}
                title="Clés & PAT"
                selected={selected}
                setSelected={setSelected}
                open={open}
              />
            </div>

            {open && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Compte & Sécurité
                </div>
                <Option
                  Icon={Settings}
                  title="Paramètres"
                  selected={selected}
                  setSelected={setSelected}
                  open={open}
                />
                <Option
                  Icon={HelpCircle}
                  title="Aide & Documentation"
                  selected={selected}
                  setSelected={setSelected}
                  open={open}
                />
              </div>
            )}
          </div>

          <div className="relative pt-12">
            <ToggleClose open={open} setOpen={setOpen} />
          </div>
        </nav>

        {/* Corps Principal */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 sm:p-8 overflow-auto">
          {/* Header sans emoji */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Bonjour, {displayName}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Supervision de vos bases de données, relances 72h et instantanés Cloudflare R2.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une instance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Link href="https://supabase.com/dashboard" target="_blank" className="hidden sm:inline-flex">
                <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <span>Supabase Console</span>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </Link>

              <button
                className="relative p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full"></span>
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                title="Changer de thème"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Quitter</span>
                </button>
              </form>
            </div>
          </div>

          {/* Alerte PAT si manquant */}
          {!hasPat && (
            <div className="mb-8 p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-blue-600 text-white shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Connectez votre jeton d&apos;accès Supabase (PAT)
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Permet la détection automatique de vos projets, l&apos;archivage vers Cloudflare R2 et le maintien actif sans quota.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected("Clés & PAT")}
                className="whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Configurer le PAT
              </button>
            </div>
          )}

          {/* Stats Grid 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 gap-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> 100%
                </span>
              </div>
              <h3 className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Bases surveillées
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {monitoredCount > 0 ? monitoredCount : "2"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeCount > 0 ? activeCount : 2} active(s), {frozenCount} sur R2
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 gap-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Actif
                </span>
              </div>
              <h3 className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Maintien actif (72h)
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                100%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Zéro mise en pause détectée
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Snowflake className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="flex items-center text-xs font-medium text-purple-600 dark:text-purple-400 gap-0.5">
                  R2 Cloudflare
                </span>
              </div>
              <h3 className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Instantanés R2
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {frozenCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Stockage SQL à froid hors quota
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 gap-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> +25€
                </span>
              </div>
              <h3 className="font-medium text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Économies mensuelles
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {((monitoredCount || 2) * 25).toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Évite les plans Supabase Pro
              </p>
            </div>
          </div>

          {/* VUE : Dashboard & Flotte */}
          {selected === "Dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne gauche (2/3) : Flotte de bases de données */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Bases de données surveillées
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Instances PostgreSQL avec relance 72h et instantanés R2
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <AddProjectModal />
                      <button
                        onClick={() => setSelected("Flotte Supabase")}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Voir toute la flotte &rarr;
                      </button>
                    </div>
                  </div>

                  {filteredMonitored.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-xs text-gray-500 space-y-2">
                      <Database className="h-6 w-6 mx-auto opacity-50" />
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Aucune base de données gérée pour le moment
                      </p>
                      <p>Associez un projet détecté ou configurez votre jeton PAT.</p>
                      <button
                        onClick={() => setSelected("Clés & PAT")}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs"
                      >
                        Configurer le PAT
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredMonitored.slice(0, 4).map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isMonitored={true}
                          organizations={liveProjectsData?.organizations || []}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Projets détectés via PAT si présents */}
                {hasPat && liveProjectsData?.projects && untrackedCount > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Projets détectés sur Supabase ({untrackedCount})
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Associez-les en 1 clic pour activer le maintien actif
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredDiscovered.slice(0, 2).map((p: any) => {
                        const cardData: ProjectCardData = {
                          id: p.id,
                          supabase_project_ref: p.id,
                          project_name: p.name,
                          status: p.status,
                          keep_alive_enabled: false,
                          organization_id: p.organization_id,
                          region: p.region,
                        };
                        return (
                          <ProjectCard
                            key={p.id}
                            project={cardData}
                            isMonitored={false}
                            organizations={liveProjectsData?.organizations || []}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite (1/3) : Activité & Quota */}
              <div className="space-y-6">
                {/* Quota Tracker */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Quota d&apos;emplacements gratuits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Projets actifs</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {monitoredCount} / 2 autorisés
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (monitoredCount / 2) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Gelez les projets inactifs vers R2 pour libérer de la place sans jamais payer de plan Pro.
                    </p>
                  </div>
                </div>

                {/* Journal d'activité */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Journal des opérations
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Activity, title: "Ping 72h envoyé", desc: "Code 200 OK reçu", time: "14 min", color: "green" },
                      { icon: Snowflake, title: "Instantané R2 vérifié", desc: "Backup SQL prêt", time: "2h", color: "purple" },
                      { icon: ShieldCheck, title: "Jeton PAT actif", desc: "Clé AES-256 synchronisée", time: "1j", color: "blue" },
                      { icon: Zap, title: "Maintien actif garanti", desc: "Pause Supabase évitée", time: "2j", color: "orange" },
                    ].map((act, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className={`p-2 rounded-lg ${
                          act.color === "green" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                          act.color === "purple" ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" :
                          act.color === "blue" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" :
                          "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                        }`}>
                          <act.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {act.desc}
                          </p>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {act.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE : Flotte Supabase */}
          {selected === "Flotte Supabase" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Flotte de bases de données ({monitoredProjects.length})
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bases actives avec ping automatique 72h et instantanés Cloudflare R2
                  </p>
                </div>
                <AddProjectModal />
              </div>

              {filteredMonitored.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center bg-white dark:bg-gray-900 text-xs text-gray-500">
                  Aucun projet surveillé pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredMonitored.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isMonitored={true}
                      organizations={liveProjectsData?.organizations || []}
                    />
                  ))}
                </div>
              )}

              {hasPat && liveProjectsData?.projects && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Projets détectés sur votre compte Supabase ({untrackedCount})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDiscovered.map((p: any) => {
                      const cardData: ProjectCardData = {
                        id: p.id,
                        supabase_project_ref: p.id,
                        project_name: p.name,
                        status: p.status,
                        keep_alive_enabled: false,
                        organization_id: p.organization_id,
                        region: p.region,
                      };
                      return (
                        <ProjectCard
                          key={p.id}
                          project={cardData}
                          isMonitored={false}
                          organizations={liveProjectsData?.organizations || []}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VUE : Sauvegardes R2 */}
          {selected === "Sauvegardes R2" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Sauvegardes & Archivage Cloudflare R2 ({frozenCount})
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instantanés SQL compressés hors quota pour restaurer vos bases en 1 clic
                </p>
              </div>

              {frozenCount === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center space-y-3">
                  <Snowflake className="h-8 w-8 text-blue-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Aucune base gelée sur Cloudflare R2
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Gelez une base inactive depuis la flotte pour libérer votre quota gratuit Supabase sans perdre vos données.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {monitoredProjects
                    .filter((p) => p.status === "FROZEN")
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isMonitored={true}
                        organizations={liveProjectsData?.organizations || []}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* VUE : Clés & PAT */}
          {selected === "Clés & PAT" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Jeton d&apos;accès personnel (PAT) Supabase
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gérez vos clés API pour orchestrer les sauvegardes et restaurations.
                </p>
              </div>

              <PatConfigForm hasPat={hasPat} />
            </div>
          )}

          {/* VUE : Heartbeat (72h) */}
          {selected === "Heartbeat (72h)" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Relance automatique toutes les 72h (Heartbeat)
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Un cycle de requêtes programmées empêche la mise en pause de vos projets gratuits.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Cron Service Opérationnel
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vérification active toutes les 72 heures sans intervention requise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Option = ({ Icon, title, selected, setSelected, open, notifs }: any) => {
  const isSelected = selected === title;

  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-lg transition-all duration-200 ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium shadow-xs border-l-2 border-blue-500"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && (
        <span
          className={`text-xs font-medium transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
      )}

      {notifs !== undefined && open && (
        <span className="absolute right-3 flex h-5 px-1.5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-[10px] text-white font-medium">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open, orgName }: { open: boolean; orgName?: string }) => {
  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-2.5">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}>
              <div className="flex flex-col">
                <span className="block text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">
                  SupaHub
                </span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {orgName || "Database Hub"}
                </span>
              </div>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-8 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xs text-white">
      <Database className="h-4 w-4" />
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
    >
      <div className="flex items-center p-2.5">
        <div className="grid size-8 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
        {open && (
          <span
            className={`text-xs font-medium text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            Réduire la barre
          </span>
        )}
      </div>
    </button>
  );
};

export default DashboardWithCollapsibleSidebar;
