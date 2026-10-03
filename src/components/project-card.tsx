"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toggleKeepAlive, freezeProject, restoreProject, trackProject } from "@/app/actions";
import { Loader2, Activity, Snowflake, RotateCcw, Plus, Clock, Database, CheckCircle, Zap } from "lucide-react";

export interface ProjectCardData {
  id: string;
  supabase_project_ref: string;
  project_name: string;
  status: "ACTIVE" | "PAUSED" | "FROZEN" | "PROCESSING" | string;
  keep_alive_enabled: boolean;
  last_ping_at?: string | null;
  last_ping_status_code?: number | null;
  organization_id?: string;
  region?: string;
}

export function ProjectCard({
  project,
  isMonitored,
  organizations = [],
}: {
  project: ProjectCardData;
  isMonitored: boolean;
  organizations?: Array<{ id: string; name: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [dbPassword, setDbPassword] = useState("");
  const [selectedOrg, setSelectedOrg] = useState(project.organization_id || (organizations[0]?.id ?? ""));
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleToggleKeepAlive() {
    setLoading(true);
    setActionError(null);
    const res = await toggleKeepAlive({
      monitoredProjectId: project.id,
      enabled: !project.keep_alive_enabled,
    });
    setLoading(false);
    if (res?.error) setActionError(res.error);
  }

  async function handleInstantTrack() {
    setLoading(true);
    setActionError(null);
    const res = await trackProject({
      supabaseProjectRef: project.supabase_project_ref,
      projectName: project.project_name,
      organizationId: project.organization_id,
      region: project.region,
    });
    setLoading(false);
    if (res?.error) setActionError(res.error);
  }

  async function handleFreezeSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setActionError(null);
    const res = await freezeProject({
      monitoredProjectId: project.id,
    });
    setLoading(false);
    if (res?.error) {
      setActionError(res.error);
    } else {
      setShowFreezeModal(false);
    }
  }

  async function handleRestore(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setActionError(null);
    const res = await restoreProject({
      monitoredProjectId: project.id,
      organizationId: selectedOrg,
      dbPassword,
    });
    setLoading(false);
    if (res?.error) {
      setActionError(res.error);
    } else {
      setShowRestoreModal(false);
    }
  }

  const getStatusBadge = () => {
    switch (project.status) {
      case "ACTIVE":
      case "ACTIVE_HEALTHY":
        return <Badge variant="default">Actif</Badge>;
      case "FROZEN":
        return <Badge variant="ice">Stocké sur R2</Badge>;
      case "PAUSED":
        return <Badge variant="outline">En pause</Badge>;
      default:
        return <Badge variant="secondary">{project.status}</Badge>;
    }
  };

  const isFrozen = project.status === "FROZEN";

  return (
    <Card className="flex flex-col justify-between hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-900">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Database className="h-3 w-3" />
              <span className="truncate">{project.supabase_project_ref}</span>
            </div>
            <CardTitle className="mt-1 text-base truncate font-semibold">
              {project.project_name}
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isMonitored ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-foreground" />
                Maintien actif (72h)
              </span>
              <span className={project.keep_alive_enabled ? "font-medium text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {project.keep_alive_enabled ? "Actif (72h)" : "En pause"}
              </span>
            </div>

            <Progress
              value={isFrozen ? 0 : project.keep_alive_enabled ? 100 : 20}
              aria-label={`${project.project_name} status`}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {project.last_ping_at
                  ? `Dernier ping: ${new Date(project.last_ping_at).toLocaleDateString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Prêt pour le prochain cycle"}
              </span>
              {project.region && <span>{project.region}</span>}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Base détectée sur votre compte Supabase. Activez la relance 72h en 1 clic.
          </p>
        )}

        {actionError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive">
            {actionError}
          </div>
        )}

        {/* Modal de Restauration R2 */}
        {showRestoreModal && (
          <form onSubmit={handleRestore} className="space-y-3 rounded-lg border bg-muted/40 p-3 text-xs">
            <h4 className="font-semibold text-foreground">Restaurer sur un nouvel emplacement</h4>
            <div>
              <label className="text-muted-foreground text-[11px]">Organisation Supabase</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full h-8 mt-1 rounded-md border bg-background px-2 text-xs focus:outline-none"
                required
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground text-[11px]">Nouveau mot de passe de base de données</label>
              <Input
                type="password"
                placeholder="8 caractères minimum"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                required
                className="h-8 mt-1 text-xs"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="default" size="sm" type="submit" disabled={loading || !dbPassword} className="w-full">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Restaurer"}
              </Button>
              <Button variant="secondary" size="sm" type="button" onClick={() => setShowRestoreModal(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex flex-wrap gap-2">
        {isMonitored ? (
          <>
            {project.status === "ACTIVE" && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleToggleKeepAlive}
                  disabled={loading}
                  className="flex-1 text-xs"
                >
                  <Activity className="h-3.5 w-3.5 mr-1" />
                  {project.keep_alive_enabled ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleFreezeSubmit}
                  disabled={loading}
                  className="flex-1 text-xs"
                  title="Archive la base sur Cloudflare R2 et libère l'emplacement"
                >
                  <Snowflake className="h-3.5 w-3.5 mr-1" />
                  Geler sur R2
                </Button>
              </>
            )}

            {isFrozen && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowRestoreModal(true)}
                disabled={loading || showRestoreModal}
                className="w-full text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Restaurer en 1 clic
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={handleInstantTrack}
            disabled={loading}
            className="w-full text-xs gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Activer le maintien actif (1-clic)
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
