"use client";

import * as React from "react";
import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Layers,
  Plus,
  ShieldCheck,
  Snowflake,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ConnectOrgButton } from "@/components/connect-org-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardOverviewProps {
  organizations?: any[];
  allProjects?: any[];
  monitoredProjects?: any[];
  hasPat?: boolean;
}

export function DashboardOverview({
  organizations = [],
  allProjects = [],
  monitoredProjects = [],
  hasPat = false,
}: DashboardOverviewProps) {
  const trackedMap = new Map((monitoredProjects || []).map((p) => [p.supabase_project_ref, p]));

  // 1. Calcul des 5 statistiques 100% réelles
  const orgCount = organizations.length || (allProjects.length > 0 ? 1 : 0);
  const totalProjectsCount = allProjects.length;
  const protectedCount = (monitoredProjects || []).filter((p) => p.keep_alive_enabled).length;
  const frozenCount = (monitoredProjects || []).filter((p) => p.status === "FROZEN").length;
  const monthlySavings = protectedCount * 25; // 25€ / base Pro évitée

  // 2. Les 2 projets les plus récents
  const recentTwoProjects = allProjects.slice(0, 2);

  const stats = [
    {
      label: "Organisations",
      value: `${orgCount}`,
      hint: orgCount > 1 ? `${orgCount} organisations Supabase` : "1 organisation liée",
      icon: Layers,
      color: "blue",
    },
    {
      label: "Total Projets",
      value: `${totalProjectsCount}`,
      hint: `${totalProjectsCount} bases détectées`,
      icon: Database,
      color: "indigo",
    },
    {
      label: "Projets Protégés",
      value: `${protectedCount}`,
      hint: `${protectedCount} avec relance 72h active`,
      icon: Activity,
      color: "green",
    },
    {
      label: "Stockage R2 (À froid)",
      value: `${frozenCount}`,
      hint: `${frozenCount} instantané(s) SQL archivé(s)`,
      icon: Snowflake,
      color: "purple",
    },
    {
      label: "Économies Estimées",
      value: `${monthlySavings.toLocaleString("fr-FR")} €/m`,
      hint: `+${monthlySavings} €/mois de plan Pro évité`,
      icon: Zap,
      color: "orange",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Entête avec bouton lier une organisation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Vue d'ensemble
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Suivi en temps réel de vos bases de données et relance d'activité Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ConnectOrgButton className="rounded-xl text-xs h-9 font-medium shadow-xs" />
        </div>
      </div>

      {/* Alerte PAT si manquant */}
      {!hasPat && (
        <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Jeton d&apos;accès Supabase (PAT)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Renseignez votre jeton PAT pour lister l&apos;ensemble de vos projets et activer la relance 72h en 1 clic.
              </p>
            </div>
          </div>
          <Link href="/dashboard/parametres">
            <Button variant="default" size="sm" className="whitespace-nowrap text-xs">
              Configurer dans Paramètres
            </Button>
          </Link>
        </div>
      )}

      {/* 5 Cartes Statistiques Réelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-xl ${
                  stat.color === "blue"
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                    : stat.color === "indigo"
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : stat.color === "green"
                    ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                    : stat.color === "purple"
                    ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                    : "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
                }`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.label}
            </h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 tabular-nums">
              {stat.value}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              {stat.hint}
            </p>
          </div>
        ))}
      </div>

      {/* Section Principale : Aperçu Projets + Flux d'activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche (2/3) : Les 2 projets récents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Aperçu de vos bases Supabase
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vos projets les plus récents et leur statut de maintien actif
              </p>
            </div>
            <Link
              href="/dashboard/projets"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Voir tous les projets ({totalProjectsCount})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentTwoProjects.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center space-y-3">
              <Database className="h-8 w-8 text-gray-400 mx-auto opacity-60" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Aucun projet Supabase détecté
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Connectez votre jeton PAT dans les paramètres pour découvrir automatiquement tous vos projets.
              </p>
              <Link href="/dashboard/parametres">
                <Button variant="default" size="sm" className="mt-2 text-xs">
                  Configurer le PAT
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentTwoProjects.map((p: any) => {
                const tracked = trackedMap.get(p.id);
                const isKeepAliveActive = tracked?.keep_alive_enabled === true;
                const isFrozen = tracked?.status === "FROZEN";

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-mono text-gray-400 truncate block">
                            {p.id}
                          </span>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate mt-0.5">
                            {p.name}
                          </h3>
                        </div>
                        <Badge
                          variant={
                            isFrozen
                              ? "ice"
                              : isKeepAliveActive
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {isFrozen
                            ? "Stocké R2"
                            : isKeepAliveActive
                            ? "Protégé (72h)"
                            : "Non protégé"}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                        <span className="truncate">
                          Région : {p.region || "eu-west-1"}
                        </span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tracked?.last_ping_at
                          ? `Ping: ${new Date(tracked.last_ping_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                          : "En attente"}
                      </span>

                      <Link
                        href="/dashboard/projets"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Gérer</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite (1/3) : Journal d'activité */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Journal de bord
          </h2>

          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-3.5">
            {[
              {
                icon: Activity,
                title: "Cycle Keep-Alive 72h",
                desc: `${protectedCount} base(s) maintenue(s) éveillée(s)`,
                time: "Automatisé",
                color: "green",
              },
              {
                icon: ShieldCheck,
                title: "Connexion Supabase OAuth",
                desc: "Jeton synchronisé avec succès",
                time: "Actif",
                color: "blue",
              },
              {
                icon: Snowflake,
                title: "Stockage Cloudflare R2",
                desc: `${frozenCount} instantané(s) disponible(s)`,
                time: "Prêt",
                color: "purple",
              },
            ].map((entry, i) => (
              <div key={i} className="flex items-start space-x-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    entry.color === "green"
                      ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                      : entry.color === "blue"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  <entry.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {entry.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {entry.desc}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
