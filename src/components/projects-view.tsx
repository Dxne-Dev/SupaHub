"use client";

import * as React from "react";
import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  Info,
  Key,
  Layers,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ConnectOrgButton } from "@/components/connect-org-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  toggleProjectKeepAlive,
  freezeProject,
  restoreProject,
  deleteSupabaseProject,
} from "@/app/actions";
import { UpgradeModal, UpgradeLimitType } from "@/components/upgrade-modal";
import { AddProjectModal } from "@/components/add-project-modal";

interface ProjectItem {
  id: string; // project ref
  name: string;
  organization_id?: string;
  region?: string;
  created_at?: string;
  status?: string;
}

interface OrganizationItem {
  id: string;
  name: string;
}

interface MonitoredProject {
  id: string;
  supabase_project_ref: string;
  project_name: string;
  status: "ACTIVE" | "FROZEN" | "DELETING" | "RESTORED" | "PROCESSING";
  keep_alive_enabled: boolean;
  last_keep_alive_at: string | null;
  last_backup_at: string | null;
}

interface ProjectsViewProps {
  organizations?: OrganizationItem[];
  allProjects?: ProjectItem[];
  monitoredProjects?: MonitoredProject[];
  hasPat?: boolean;
  plan?: "FREE" | "PRO";
}

export function ProjectsView({
  organizations = [],
  allProjects = [],
  monitoredProjects = [],
  hasPat = false,
  plan = "FREE",
}: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOrg, setFilterOrg] = React.useState<string>("all");
  
  // Modal state pour Upgrade PRO
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = React.useState<UpgradeLimitType>("GENERAL");
  const [upgradeCustomDetail, setUpgradeCustomDetail] = React.useState<string | undefined>(undefined);

  // Modal state pour configurer le Keep-Alive
  const [selectedProjectForKeepAlive, setSelectedProjectForKeepAlive] =
    React.useState<ProjectItem | null>(null);
  const [anonKey, setAnonKey] = React.useState("");
  const [serviceRoleKey, setServiceRoleKey] = React.useState("");
  const [isActivatingKeepAlive, setIsActivatingKeepAlive] = React.useState(false);
  const [keepAliveError, setKeepAliveError] = React.useState<string | null>(null);

  // Modal state pour Geler / Sauvegarder vers R2
  const [selectedProjectForFreeze, setSelectedProjectForFreeze] =
    React.useState<ProjectItem | null>(null);
  const [dbPassword, setDbPassword] = React.useState("");
  const [isFreezing, setIsFreezing] = React.useState(false);
  const [freezeError, setFreezeError] = React.useState<string | null>(null);

  // Modal state pour Suppression directe (libération de slot)
  const [selectedProjectForDelete, setSelectedProjectForDelete] =
    React.useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Custom Dropdown state pour le filtre d'organisation
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false);
  const orgDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map des projets monitorés par ref
  const monitoredMap = new Map(
    monitoredProjects.map((p) => [p.supabase_project_ref, p])
  );

  // Consolidation des projets (Live via PAT/OAuth + Manuellement ajoutés)
  const combinedProjects: ProjectItem[] = [...allProjects];
  const liveProjectRefs = new Set(allProjects.map((p) => p.id));

  for (const mp of monitoredProjects) {
    if (!liveProjectRefs.has(mp.supabase_project_ref)) {
      combinedProjects.push({
        id: mp.supabase_project_ref,
        name: mp.project_name,
        organization_id: "manual",
        status: mp.status,
      });
    }
  }

  // Filtrage des projets
  const filteredProjects = combinedProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg =
      filterOrg === "all" || project.organization_id === filterOrg;
    return matchesSearch && matchesOrg;
  });

  // Groupement par organisation
  const orgMap = new Map(organizations.map((org) => [org.id, org.name]));
  orgMap.set("manual", "Projets ajoutés manuellement");
  orgMap.set("default", "Organisation principale");

  const groupedProjects = filteredProjects.reduce((acc, project) => {
    const orgId = project.organization_id || "default";
    const orgName = orgMap.get(orgId) || "Organisation principale";
    if (!acc[orgId]) {
      acc[orgId] = { name: orgName, projects: [] };
    }
    acc[orgId].projects.push(project);
    return acc;
  }, {} as Record<string, { name: string; projects: ProjectItem[] }>);

  // Gestion du toggle Keep-Alive
  const handleToggleKeepAlive = async (project: ProjectItem, currentEnabled: boolean) => {
    if (!currentEnabled) {
      // S'il était désactivé, on ouvre la modal pour renseigner la clé anon
      setSelectedProjectForKeepAlive(project);
      setAnonKey("");
      setServiceRoleKey("");
      setKeepAliveError(null);
    } else {
      // S'il était activé, on le désactive directement
      try {
        const res = await toggleProjectKeepAlive({
          supabaseProjectRef: project.id,
          projectName: project.name,
          organizationId: project.organization_id,
          region: project.region,
          enabled: false,
        });
        if (res?.error) {
          alert(res.error);
        }
      } catch (err: any) {
        alert(err.message || "Erreur lors de la désactivation");
      }
    }
  };

  const submitKeepAliveActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForKeepAlive) return;
    setIsActivatingKeepAlive(true);
    setKeepAliveError(null);

    try {
      const res = await toggleProjectKeepAlive({
        supabaseProjectRef: selectedProjectForKeepAlive.id,
        projectName: selectedProjectForKeepAlive.name,
        organizationId: selectedProjectForKeepAlive.organization_id,
        region: selectedProjectForKeepAlive.region,
        enabled: true,
        anonKey: anonKey.trim() || undefined,
        serviceRoleKey: serviceRoleKey.trim() || undefined,
      });

      if (res?.error) {
        setKeepAliveError(res.error);
      } else {
        setSelectedProjectForKeepAlive(null);
      }
    } catch (err: any) {
      setKeepAliveError(err.message || "Une erreur est survenue");
    } finally {
      setIsActivatingKeepAlive(false);
    }
  };

  const submitFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForFreeze) return;
    setIsFreezing(true);
    setFreezeError(null);

    try {
      const res = await freezeProject({
        supabaseProjectRef: selectedProjectForFreeze.id,
        dbPassword: dbPassword.trim(),
        region: selectedProjectForFreeze.region || "eu-west-1",
      });

      if (res?.error) {
        if (
          res.error.includes("FREEZE_SLOT") ||
          (res as any).limitType === "FREEZE_SLOT"
        ) {
          setSelectedProjectForFreeze(null);
          setUpgradeModalOpen(true);
          setUpgradeLimitType("FREEZE_SLOT");
          setUpgradeCustomDetail((res as any).message || res.error);
        } else if (
          res.error.includes("SIZE_EXCEEDED") ||
          (res as any).limitType === "SIZE_EXCEEDED"
        ) {
          setSelectedProjectForFreeze(null);
          setUpgradeModalOpen(true);
          setUpgradeLimitType("SIZE_EXCEEDED");
          setUpgradeCustomDetail((res as any).message || res.error);
        } else {
          setFreezeError((res as any).message || res.error);
        }
      } else {
        setSelectedProjectForFreeze(null);
        setDbPassword("");
      }
    } catch (err: any) {
      setFreezeError(err.message || "Une erreur est survenue");
    } finally {
      setIsFreezing(false);
    }
  };

  const submitDeleteProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteSupabaseProject({
        supabaseProjectRef: selectedProjectForDelete.id,
      });

      if (res?.error) {
        setDeleteError(res.error);
      } else {
        setSelectedProjectForDelete(null);
      }
    } catch (err: any) {
      setDeleteError(err.message || "Une erreur est survenue lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Entête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-7 h-7 text-emerald-500" />
            Tous vos Projets Supabase
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Gérez le maintien d'activité (Keep-Alive 72h) et l'archivage Cloudflare R2 en un clic.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AddProjectModal />
          <ConnectOrgButton className="rounded-xl text-xs h-9 font-medium" />
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Rechercher par nom ou identifiant (ref)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-sm h-10 rounded-xl"
          />
        </div>

        {organizations.length > 1 && (
          <div ref={orgDropdownRef} className="relative w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="w-full sm:w-auto h-10 px-3.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-between gap-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                <Layers className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {filterOrg === "all"
                    ? "Toutes les organisations"
                    : organizations.find((o) => o.id === filterOrg)?.name || "Organisation"}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 shrink-0 ${
                  isOrgDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-full sm:w-60 max-h-52 overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-1.5 z-30 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in-0 zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setFilterOrg("all");
                    setIsOrgDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                    filterOrg === "all"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span>Toutes les organisations</span>
                  {filterOrg === "all" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </button>

                {organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setFilterOrg(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors ${
                      filterOrg === org.id
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span className="truncate pr-2">{org.name}</span>
                    {filterOrg === org.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aucun projet ou non connecté PAT */}
      {!hasPat && (
        <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-500/5 dark:bg-amber-500/10 flex items-start gap-4">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-1 text-sm">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">
              Synchronisation Supabase requise
            </h4>
            <p className="text-amber-700 dark:text-amber-300/80">
              Pour détecter automatiquement l'ensemble de vos projets et organisations, associez votre jeton d'accès Supabase (PAT) dans les paramètres.
            </p>
            <Link
              href="/dashboard/parametres"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-1"
            >
              <span>Configurer mon PAT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Liste des projets groupés */}
      {Object.keys(groupedProjects).length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 space-y-3">
          <Database className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Aucun projet trouvé
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? "Aucun résultat ne correspond à votre recherche."
              : "Vos projets Supabase apparaîtront ici dès la synchronisation."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProjects).map(([orgId, group]) => (
            <div key={orgId} className="space-y-4">
              <div className="flex items-center gap-2.5 px-1">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-500 dark:text-neutral-400">
                  {group.name} ({group.projects.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.projects.map((project) => {
                  const monitored = monitoredMap.get(project.id);
                  const isKeepAliveActive = monitored?.keep_alive_enabled ?? false;
                  const isFrozen = monitored?.status === "FROZEN";

                  return (
                    <div
                      key={project.id}
                      className="group bg-white dark:bg-neutral-900/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-5"
                    >
                      {/* Header carte */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                              {project.name}
                            </h4>
                            <span className="font-mono text-[11px] text-neutral-400 truncate block">
                              ref: {project.id}
                            </span>
                          </div>

                          {isFrozen ? (
                            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px] shrink-0 flex items-center gap-1 font-medium">
                              <Snowflake className="w-3 h-3" /> Gelé R2
                            </Badge>
                          ) : isKeepAliveActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] shrink-0 flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Protégé
                            </Badge>
                          ) : (
                            <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20 text-[10px] shrink-0 font-medium">
                              Non protégé
                            </Badge>
                          )}
                        </div>

                        {/* Région & Infos */}
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono">
                            {project.region || "eu-west-1"}
                          </span>
                          <span>•</span>
                          <span>
                            {isKeepAliveActive
                              ? "Ping auto toutes les 72h"
                              : "Risque de mise en pause"}
                          </span>
                        </div>
                      </div>

                      {/* Contrôles d'actions */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-3">
                        {/* Toggle switch Keep Alive */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Zap
                              className={`w-4 h-4 ${
                                isKeepAliveActive
                                  ? "text-amber-500"
                                  : "text-neutral-400"
                              }`}
                            />
                            <Label
                              htmlFor={`switch-${project.id}`}
                              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                            >
                              Maintien d'activité
                            </Label>
                          </div>
                          <Switch
                            id={`switch-${project.id}`}
                            checked={isKeepAliveActive}
                            onCheckedChange={() =>
                              handleToggleKeepAlive(project, isKeepAliveActive)
                            }
                          />
                        </div>

                        {/* Actions secondaires */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const frozenCount = monitoredProjects.filter(
                                  (p) => p.status === "FROZEN"
                                ).length;
                                if (plan === "FREE" && frozenCount >= 1) {
                                  setUpgradeModalOpen(true);
                                  setUpgradeLimitType("FREEZE_SLOT");
                                  setUpgradeCustomDetail(
                                    "Sur le plan FREE : Vous êtes limité à 1 seul projet au congélateur à la fois dans votre réserve. Vous avez déjà 1 projet archivé."
                                  );
                                  return;
                                }
                                setSelectedProjectForFreeze(project);
                                setDbPassword("");
                                setFreezeError(null);
                              }}
                              className="text-xs h-7 px-2 text-neutral-500 hover:text-sky-500 hover:bg-sky-500/10 rounded-lg flex items-center gap-1"
                              title="Sauvegarder et geler sur Cloudflare R2"
                            >
                              <Snowflake className="w-3.5 h-3.5" />
                              <span>Geler R2</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProjectForDelete(project);
                                setDeleteError(null);
                              }}
                              className="text-xs h-7 px-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-1 transition-colors"
                              title="Supprimer définitivement le projet pour libérer un slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer</span>
                            </Button>
                          </div>

                          <Link
                            href={`https://supabase.com/dashboard/project/${project.id}`}
                            target="_blank"
                            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors p-1"
                            title="Ouvrir sur Supabase"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL : Configuration Keep-Alive (Anon Key) */}
      <Dialog
        open={!!selectedProjectForKeepAlive}
        onOpenChange={(open: boolean) => !open && setSelectedProjectForKeepAlive(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
              Activer le maintien d'activité 72h
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Pour exécuter un ping léger automatisé et empêcher la mise en pause de{" "}
              <strong className="text-neutral-700 dark:text-neutral-200">
                {selectedProjectForKeepAlive?.name}
              </strong>
              , renseignez la clé Anon publique de votre projet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitKeepAliveActivation} className="space-y-4 py-2">
            {keepAliveError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                {keepAliveError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="anonKey" className="text-xs font-semibold">
                Supabase Anon Key (Public Key)
              </Label>
              <Input
                id="anonKey"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                required
                className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-xs"
              />
              <p className="text-[11px] text-neutral-400 flex items-center gap-1 pt-0.5">
                <Key className="w-3 h-3" />
                Trouvable dans Supabase : <em>Settings &gt; API &gt; anon / public</em>
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label
                htmlFor="serviceRoleKey"
                className="text-xs font-semibold text-neutral-500 flex items-center justify-between"
              >
                <span>Service Role Key (Optionnel)</span>
                <span className="text-[10px] text-neutral-400">Pour diagnostics avancés</span>
              </Label>
              <Input
                id="serviceRoleKey"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl border border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Vos clés sont chiffrées en AES-256 et sécurisées.</span>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedProjectForKeepAlive(null)}
                className="rounded-xl text-xs h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isActivatingKeepAlive}
                className="rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                {isActivatingKeepAlive ? "Activation..." : "Activer la protection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL : Geler / Sauvegarder vers R2 */}
      <Dialog
        open={!!selectedProjectForFreeze}
        onOpenChange={(open: boolean) => !open && setSelectedProjectForFreeze(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
              <Snowflake className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
              Geler vers Cloudflare R2
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Effectue un snapshot complet compressé de la base de données{" "}
              <strong className="text-neutral-700 dark:text-neutral-200">
                {selectedProjectForFreeze?.name}
              </strong>{" "}
              vers votre stockage froid R2 à 0,00$/mois.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitFreeze} className="space-y-4 py-2">
            {freezeError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                {freezeError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="dbPassword" className="text-xs font-semibold">
                Mot de passe de la base PostgreSQL
              </Label>
              <Input
                id="dbPassword"
                type="password"
                placeholder="Mot de passe défini lors de la création du projet"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                required
                className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl text-xs"
              />
              <p className="text-[11px] text-neutral-400">
                Nécessaire uniquement pour exécuter <code className="text-neutral-600 dark:text-neutral-300 font-mono">pg_dump</code> sécurisé.
              </p>
            </div>

            {/* Note explicative sur le Plan FREE & passerelle PRO */}
            {plan === "FREE" && (
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-neutral-800 dark:text-neutral-200">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    Périmètre du Plan FREE
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">1 slot de réserve</span>
                </div>
                <p className="leading-relaxed">
                  ✓ Base SQL complète (schémas, données, règles RLS) jusqu'à 500 Mo.
                  <br />
                  ✓ Rétention 60 jours en Cold Storage Cloudflare R2.
                </p>
                <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-400">Médias/Buckets Storage & Stockage illimité ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectForFreeze(null);
                      setUpgradeModalOpen(true);
                      setUpgradeLimitType("MEDIA_STORAGE");
                    }}
                    className="text-sky-500 hover:text-sky-600 font-bold underline cursor-pointer"
                  >
                    Découvrir PRO (9,99$) →
                  </button>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedProjectForFreeze(null)}
                className="rounded-xl text-xs h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isFreezing}
                className="rounded-xl text-xs h-9 bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-md shadow-sky-500/20"
              >
                {isFreezing ? "Sauvegarde en cours..." : "Sauvegarder et Geler"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL : Suppression Définitive (Libération de Slot) */}
      <Dialog
        open={!!selectedProjectForDelete}
        onOpenChange={(open: boolean) => !open && setSelectedProjectForDelete(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-red-200 dark:border-red-900/40 rounded-3xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
              Supprimer définitivement le projet
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Êtes-vous sûr de vouloir supprimer définitivement le projet{" "}
              <strong className="text-red-600 dark:text-red-400">
                {selectedProjectForDelete?.name}
              </strong>{" "}
              (<code className="font-mono text-neutral-700 dark:text-neutral-300">{selectedProjectForDelete?.id}</code>) sur Supabase ?
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitDeleteProject} className="space-y-4 py-2">
            {deleteError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                {deleteError}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/15 text-xs text-red-700 dark:text-red-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                Action irréversible
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Cette opération détruit la base de données sur Supabase et <strong>libère immédiatement 1 slot gratuit</strong> dans votre organisation. Aucune archive R2 ne sera conservée.
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedProjectForDelete(null)}
                className="rounded-xl text-xs h-9"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isDeleting}
                className="rounded-xl text-xs h-9 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-500/20"
              >
                {isDeleting ? "Suppression en cours..." : "Confirmer la suppression"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL : Mise à niveau Plan PRO (9,99$/mois) */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        limitType={upgradeLimitType}
        customDetail={upgradeCustomDetail}
      />
    </div>
  );
}
