"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Layers,
  LogOut,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PatConfigForm } from "@/components/pat-config-form";
import { ProjectCard, ProjectCardData } from "@/components/project-card";

interface DashboardViewProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
      user_name?: string;
    };
  };
  hasPat: boolean;
  monitoredProjects: any[];
  liveProjectsData: any;
}

const chartConfig = {
  opened: {
    label: "Pings 72h envoyés",
    color: "#4e6fff",
  },
  completed: {
    label: "Bases maintenues éveillées",
    color: "#ee7cff",
  },
} satisfies ChartConfig;

const mockChartData = [
  { week: "S-7", opened: 12, completed: 8 },
  { week: "S-6", opened: 24, completed: 18 },
  { week: "S-5", opened: 36, completed: 28 },
  { week: "S-4", opened: 48, completed: 40 },
  { week: "S-3", opened: 60, completed: 52 },
  { week: "S-2", opened: 75, completed: 68 },
  { week: "S-1", opened: 90, completed: 84 },
  { week: "Cette sem.", opened: 110, completed: 104 },
];

export function DashboardView({
  user,
  hasPat,
  monitoredProjects = [],
  liveProjectsData,
}: DashboardViewProps) {
  const [activeNav, setActiveNav] = React.useState<"overview" | "fleet" | "backups" | "settings">("overview");
  const [searchQuery, setSearchQuery] = React.useState("");

  const email = user?.email || "utilisateur@supahub.dev";
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    email.split("@")[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const monitoredCount = monitoredProjects.length;
  const frozenCount = monitoredProjects.filter((p) => p.status === "FROZEN").length;
  const activeCount = monitoredProjects.filter((p) => p.status === "ACTIVE" || p.status === "ACTIVE_HEALTHY").length;
  const discoveredProjects = liveProjectsData?.projects || [];
  const trackedMap = new Map(monitoredProjects.map((p) => [p.supabase_project_ref, p]));
  const untrackedCount = discoveredProjects.filter((p: any) => !trackedMap.has(p.id)).length;

  const STATS = [
    {
      label: "Bases surveillées",
      value: `${monitoredCount}`,
      hint: `${activeCount} active(s), ${frozenCount} sur R2`,
      icon: Database,
    },
    {
      label: "Maintien actif (72h)",
      value: "100%",
      hint: "Aucune mise en pause détectée",
      icon: Activity,
    },
    {
      label: "Instantanés R2",
      value: `${frozenCount}`,
      hint: "Bases stockées hors quota",
      icon: Snowflake,
    },
    {
      label: "Économies mensuelles",
      value: `${(monitoredCount * 25).toLocaleString("fr-FR")} €`,
      hint: "+25 € par projet Pro évité",
      icon: Zap,
    },
  ];

  const recentActivityList = [
    {
      id: "act-1",
      person: {
        name: "Heartbeat Cron",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        initials: "HC",
      },
      action: "a envoyé avec succès un ping 72h (Code 200 OK)",
      time: "Il y a 14 minutes",
    },
    {
      id: "act-2",
      person: {
        name: "Cloudflare R2",
        avatar: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=60",
        initials: "R2",
      },
      action: "a vérifié l'intégrité des instantanés SQL archivés",
      time: "Il y a 2 heures",
    },
    {
      id: "act-3",
      person: {
        name: "Système SupaHub",
        avatar: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=100&auto=format&fit=crop&q=60",
        initials: "SH",
      },
      action: "a synchronisé les clés et le jeton d'accès Supabase",
      time: "Il y a 1 jour",
    },
    {
      id: "act-4",
      person: {
        name: name,
        avatar: avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
        initials: initials,
      },
      action: "s'est connecté via Supabase OAuth",
      time: "Il y a 2 jours",
    },
  ];

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
    <SidebarProvider>
      {/* Sidebar Navigation */}
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base leading-tight text-foreground tracking-tight">
                  SupaHub
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Database Hub
                </span>
              </div>
            </Link>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              v1.0
            </Badge>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3 space-y-6">
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </div>
            
            <button
              onClick={() => setActiveNav("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === "overview"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Vue d&apos;ensemble</span>
            </button>

            <button
              onClick={() => setActiveNav("fleet")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === "fleet"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span>Flotte Supabase</span>
              </div>
              {monitoredCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeNav === "fleet" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {monitoredCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNav("backups")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === "backups"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4" />
                <span>Sauvegardes R2</span>
              </div>
              {frozenCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeNav === "backups" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-accent-foreground"
                }`}>
                  {frozenCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Clés & Sécurité</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Statut du cluster
            </div>
            <div className="p-3 rounded-lg bg-card border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ECF8E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ECF8E]"></span>
                  </span>
                  Cron Heartbeat
                </span>
                <span className="font-semibold text-foreground">72h actif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stockage R2</span>
                <span className="font-medium text-foreground">Opérationnel</span>
              </div>
              <Progress value={Math.min(100, (monitoredCount / 2) * 100)} className="h-1.5 mt-2" />
              <div className="text-[10px] text-muted-foreground flex justify-between">
                <span>{monitoredCount} / 2 gratuits</span>
                <span>{Math.round((monitoredCount / 2) * 100)}%</span>
              </div>
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border">
            <Avatar className="h-8 w-8">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-none">
                {name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-1">
                {email}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                title="Déconnexion"
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Inset Main Layout */}
      <SidebarInset className="min-w-0">
        {/* Header matching App-1 */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <h1 className="truncate text-base sm:text-lg font-semibold">
            Bienvenue, {name.split(" ")[0]}
          </h1>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-muted/30"
              />
            </div>

            <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>

            <Link href="https://supabase.com/dashboard" target="_blank" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <span>Supabase</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>
            </Link>

            <Avatar className="ml-1 size-8">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {/* Alerte PAT si non configuré */}
          {!hasPat && (
            <div className="rounded-xl border bg-gradient-to-r from-accent/50 to-muted/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shrink-0">
                  <Sparkles className="h-5 w-5 text-[#ee7cff]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Connectez votre jeton PAT Supabase
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permet la détection automatique de vos projets, l&apos;archivage vers Cloudflare R2 et le maintien actif 72h.
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setActiveNav("settings")}
                className="whitespace-nowrap shrink-0 text-xs"
              >
                Configurer le PAT
              </Button>
            </div>
          )}

          {/* 4 Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon
                    aria-hidden
                    className="size-5 text-muted-foreground"
                  />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content by active tab */}
          {activeNav === "overview" && (
            <>
              {/* Throughput AreaChart */}
              <Card>
                <CardHeader>
                  <CardTitle>Activité du maintien actif (Heartbeat)</CardTitle>
                  <CardDescription>
                    Pings 72h exécutés et bases de données maintenues actives sur les huit dernières semaines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-64 w-full">
                    <AreaChart
                      data={mockChartData}
                      margin={{ left: 4, right: 4, top: 8 }}
                      accessibilityLayer
                    >
                      <defs>
                        <linearGradient
                          id="app1Completed"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-completed)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-completed)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="week"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        dataKey="opened"
                        type="monotone"
                        stroke="var(--color-opened)"
                        strokeDasharray="4 4"
                        fill="none"
                        strokeWidth={2}
                      />
                      <Area
                        dataKey="completed"
                        type="monotone"
                        stroke="var(--color-completed)"
                        fill="url(#app1Completed)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* 2-Column Grid: Active Projects & Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Active Projects Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Projets suivis</CardTitle>
                      <CardDescription>État de santé et maintien actif de votre flotte</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveNav("fleet")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Gérer ({monitoredProjects.length})
                    </Button>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    {filteredMonitored.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                        <Database className="h-6 w-6 mx-auto opacity-50" />
                        <p className="font-medium text-foreground">Aucun projet managé</p>
                        <p>Configurez votre jeton PAT ou associez une base détectée pour débuter.</p>
                      </div>
                    ) : (
                      filteredMonitored.slice(0, 3).map((project) => {
                        const isFrozen = project.status === "FROZEN";
                        const isHealthy = project.status === "ACTIVE" || project.status === "ACTIVE_HEALTHY";
                        const progress = isFrozen ? 0 : project.keep_alive_enabled ? 100 : 35;

                        return (
                          <div key={project.id} className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm font-medium text-foreground">
                                  {project.project_name}
                                </h3>
                                <p className="text-xs font-mono text-muted-foreground truncate">
                                  {project.supabase_project_ref}
                                </p>
                              </div>
                              <Badge variant={isHealthy ? "default" : isFrozen ? "secondary" : "outline"}>
                                {isHealthy ? "Actif" : isFrozen ? "Stocké R2" : project.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3">
                              <Progress
                                value={progress}
                                aria-label={`${project.project_name} progress`}
                              />
                              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                {progress}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span>
                                {project.last_ping_at
                                  ? `Ping: ${new Date(project.last_ping_at).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                                  : "Cycle en attente"}
                              </span>
                              <span>{project.region || "eu-west-3"}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Dernières opérations automatisées par SupaHub</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="flex flex-col gap-4">
                      {recentActivityList.map((entry) => (
                        <li key={entry.id} className="flex items-start gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={entry.person.avatar}
                              alt={entry.person.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xs">
                              {entry.person.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug">
                              <span className="font-medium text-foreground">
                                {entry.person.name}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {entry.action}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.time}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Tab Flotte Supabase */}
          {activeNav === "fleet" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Flotte de bases de données ({monitoredProjects.length})
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Surveillez vos instances, configurez les pings 72h et gérez le stockage à froid.
                  </p>
                </div>
              </div>

              {filteredMonitored.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-sm font-medium">Aucun projet géré pour le moment.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Detected Projects */}
              {hasPat && liveProjectsData?.projects && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-base font-semibold text-foreground">
                    Projets détectés sur votre compte Supabase ({untrackedCount})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Tab Sauvegardes R2 */}
          {activeNav === "backups" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Sauvegardes et Archivage Cloudflare R2 ({frozenCount})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Vos instantanés SQL complets compressés et prêts pour une restauration instantanée en 1 clic.
                </p>
              </div>

              {frozenCount === 0 ? (
                <Card className="p-10 text-center border-dashed space-y-3">
                  <Snowflake className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h3 className="text-sm font-semibold">Aucune base stockée sur Cloudflare R2</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Libérez votre quota Supabase sans perdre vos données en gelant un projet inactif.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Tab Paramètres */}
          {activeNav === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Configuration et Clés Supabase
                </h2>
                <p className="text-xs text-muted-foreground">
                  Associez votre Personal Access Token pour orchestrer les sauvegardes et restaurations.
                </p>
              </div>

              <PatConfigForm hasPat={hasPat} />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
