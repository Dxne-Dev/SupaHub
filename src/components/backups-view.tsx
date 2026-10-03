"use client";

import * as React from "react";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Database,
  ExternalLink,
  HardDrive,
  Layers,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { restoreProject } from "@/app/actions";
import { UpgradeModal, UpgradeLimitType } from "@/components/upgrade-modal";

interface OrganizationItem {
  id: string;
  name: string;
}

interface MonitoredProjectInfo {
  id: string;
  supabase_project_ref: string;
  project_name: string;
  user_id: string;
}

interface SnapshotItem {
  id: string;
  snapshot_type?: string;
  file_size_bytes: number;
  created_at: string;
  expires_at?: string | null;
  r2_object_key?: string;
  r2_file_key?: string;
  monitored_projects?: MonitoredProjectInfo | MonitoredProjectInfo[];
}

interface BackupsViewProps {
  snapshots?: SnapshotItem[];
  organizations?: OrganizationItem[];
  hasPat?: boolean;
  plan?: "FREE" | "PRO";
}

export function BackupsView({
  snapshots = [],
  organizations = [],
  hasPat = false,
  plan = "FREE",
}: BackupsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Modal Upgrade PRO
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = React.useState<UpgradeLimitType>("GENERAL");

  // Modal de restauration
  const [selectedSnapshotForRestore, setSelectedSnapshotForRestore] =
    React.useState<SnapshotItem | null>(null);
  const [selectedOrgId, setSelectedOrgId] = React.useState<string>(
    organizations[0]?.id || ""
  );
  const [dbPassword, setDbPassword] = React.useState("");
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [restoreStep, setRestoreStep] = React.useState<string>("");
  const [restoreError, setRestoreError] = React.useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const getMonitoredProject = (snap: SnapshotItem): MonitoredProjectInfo | undefined => {
    if (!snap.monitored_projects) return undefined;
    if (Array.isArray(snap.monitored_projects)) {
      return snap.monitored_projects[0];
    }
    return snap.monitored_projects;
  };

  const filteredSnapshots = snapshots.filter((snap) => {
    const project = getMonitoredProject(snap);
    const name = project?.project_name || "";
    const ref = project?.supabase_project_ref || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartRestore = (snap: SnapshotItem) => {
    setSelectedSnapshotForRestore(snap);
    setDbPassword("");
    setRestoreError(null);
    setRestoreSuccess(null);
    setRestoreStep("");
    if (organizations.length > 0) {
      setSelectedOrgId(organizations[0].id);
    }
  };

  const submitRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProject = selectedSnapshotForRestore
      ? getMonitoredProject(selectedSnapshotForRestore)
      : undefined;
    if (!targetProject?.id) return;
    if (!selectedOrgId) {
      setRestoreError("Veuillez sélectionner une organisation Supabase cible.");
      return;
    }
    if (dbPassword.length < 8) {
      setRestoreError("Le mot de passe de base doit comporter au moins 8 caractères.");
      return;
    }

    setIsRestoring(true);
    setRestoreError(null);
    setRestoreStep("1. Création de la nouvelle instance Supabase...");

    try {
      // Déclenchement de la restauration serveur
      const res = await restoreProject({
        monitoredProjectId: targetProject.id,
        organizationId: selectedOrgId,
        dbPassword: dbPassword.trim(),
      });

      if (res?.error) {
        setRestoreError(res.error);
        setIsRestoring(false);
      } else {
        setRestoreSuccess(
          `Projet restauré avec succès ! Nouveau ref : ${res.newProjectRef}`
        );
        setIsRestoring(false);
      }
    } catch (err: any) {
      setRestoreError(err.message || "Une erreur est survenue lors de la restauration.");
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-8 font-figtree">
      {/* Entête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Archive className="w-7 h-7 text-sky-500" />
            Sauvegardes & Archivage R2
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Snapshots complets compressés (pg_dump) stockés sur Cloudflare R2 à 0,00$/mois. Restaurez-les en 1 clic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projets"
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Voir mes projets</span>
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-3 bg-white dark:bg-neutral-900/60 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Rechercher une sauvegarde par nom ou ref de projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-sm h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Liste des Snapshots */}
      {filteredSnapshots.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900/40 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 space-y-3">
          <Snowflake className="w-10 h-10 text-sky-400 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            {searchQuery ? "Aucune sauvegarde trouvée" : "Aucune archive enregistrée"}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {searchQuery
              ? "Aucun snapshot ne correspond à votre recherche."
              : "Pour geler une base inactive et libérer votre slot Supabase, allez dans l'onglet Projets et cliquez sur « Geler vers R2 »."}
          </p>
          {!searchQuery && (
            <div className="pt-2">
              <Link href="/dashboard/projets">
                <Button className="rounded-xl text-xs h-9 bg-sky-500 hover:bg-sky-600 text-white font-semibold">
                  Geler un projet
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSnapshots.map((snap) => {
            const project = getMonitoredProject(snap);
            const sizeMb = snap.file_size_bytes
              ? (snap.file_size_bytes / (1024 * 1024)).toFixed(2)
              : "0";

            return (
              <Card
                key={snap.id}
                variant="card"
                className="p-5 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-sky-500/30 transition-all flex flex-col justify-between gap-4 rounded-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                        {project?.project_name || "Projet archivé"}
                      </h3>
                      <span className="font-mono text-[11px] text-neutral-400 block truncate">
                        ref initiale: {project?.supabase_project_ref}
                      </span>
                    </div>
                    <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px] shrink-0 font-medium flex items-center gap-1">
                      <Snowflake className="w-3 h-3" />
                      <span>{snap.snapshot_type || "FREEZE R2"}</span>
                    </Badge>
                  </div>

                  {/* Métadonnées */}
                  <div className="space-y-1.5 text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800/80 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Taille compressée :</span>
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {sizeMb} MB
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Date du snapshot :</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {new Date(snap.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Rétention Cold Storage :</span>
                      {snap.expires_at ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                          Expire le{" "}
                          {new Date(snap.expires_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                          Illimitée (PRO ✨)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton de Restauration 1-clic */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartRestore(snap)}
                    className="w-full h-9 rounded-xl text-xs font-semibold gap-1.5 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 border-neutral-200 dark:border-neutral-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
                    <span>Restaurer vers Supabase</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL : Restauration 1-Clic vers une nouvelle instance Supabase */}
      <Dialog
        open={!!selectedSnapshotForRestore}
        onOpenChange={(open: boolean) => !open && setSelectedSnapshotForRestore(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
              Restaurer le snapshot sur Supabase
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Cette action va provisionner un nouveau projet Supabase et y réinjecter automatiquement l'intégralité de vos schémas, tables et données.
            </DialogDescription>
          </DialogHeader>

          {restoreSuccess ? (
            <div className="space-y-4 py-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Restauration terminée avec succès !</span>
                </div>
                <p className="leading-relaxed">
                  Votre nouvelle base Supabase est opérationnelle et le maintien d'activité Keep-Alive 72h a été automatiquement réactivé.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Link href="/dashboard/projets" className="w-full">
                  <Button className="w-full rounded-xl text-xs h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                    Voir mes projets actifs
                  </Button>
                </Link>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={submitRestore} className="space-y-4 py-2">
              {restoreError && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                  {restoreError}
                </div>
              )}

              {/* Organisation cible */}
              <div className="space-y-1.5">
                <Label htmlFor="targetOrg" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  Organisation Supabase cible
                </Label>
                {organizations.length > 0 ? (
                  <select
                    id="targetOrg"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    required
                    className="w-full h-10 px-3 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 outline-none"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="targetOrg"
                    placeholder="ID d'organisation Supabase"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    required
                    className="h-10 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950"
                  />
                )}
              </div>

              {/* Nouveau mot de passe de base */}
              <div className="space-y-1.5">
                <Label htmlFor="newDbPass" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-500" />
                  Mot de passe de la nouvelle BDD (min 8 car.)
                </Label>
                <Input
                  id="newDbPass"
                  type="password"
                  placeholder="Définissez un mot de passe sécurisé"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-10 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                />
              </div>

              {/* Indicateur de chargement multi-étapes */}
              {isRestoring && (
                <div className="p-3.5 rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sky-600 dark:text-sky-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Restauration en cours... (~1-2 min)</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Provisionnement Supabase, injection du schéma SQL et réactivation du Keep-Alive.
                  </p>
                </div>
              )}

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRestoring}
                  onClick={() => setSelectedSnapshotForRestore(null)}
                  className="rounded-xl text-xs h-9"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isRestoring || dbPassword.length < 8}
                  className="rounded-xl text-xs h-9 bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-md shadow-sky-500/20"
                >
                  {isRestoring ? "Restauration en cours..." : "Lancer la Restauration"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal Dédiée */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        limitType={upgradeLimitType}
      />
    </div>
  );
}
