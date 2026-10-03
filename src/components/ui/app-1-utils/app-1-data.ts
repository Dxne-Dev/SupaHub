import { ChartConfig } from "@/components/ui/chart";

export const app1User = {
  name: "Alexandre Dupont",
  email: "alex@supahub.dev",
  initials: "AD",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
};

export const app1ChartConfig = {
  opened: {
    label: "Tâches ouvertes",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Tâches terminées",
    color: "#4e6fff",
  },
} satisfies ChartConfig;

export const app1Chart = [
  { week: "S-7", opened: 18, completed: 12 },
  { week: "S-6", opened: 26, completed: 20 },
  { week: "S-5", opened: 32, completed: 30 },
  { week: "S-4", opened: 45, completed: 38 },
  { week: "S-3", opened: 54, completed: 48 },
  { week: "S-2", opened: 68, completed: 62 },
  { week: "S-1", opened: 82, completed: 78 },
  { week: "Cette sem.", opened: 96, completed: 92 },
];

export const app1Projects = [
  {
    id: "proj-1",
    name: "SupaHub Core API",
    status: "In progress" as const,
    description: "Heartbeat ping cron et intégration R2",
    progress: 85,
    dueDate: "15 Oct",
    team: [
      { name: "Sarah M.", initials: "SM", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
      { name: "David K.", initials: "DK", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    ],
  },
  {
    id: "proj-2",
    name: "Postgres Snapshot Engine",
    status: "In review" as const,
    description: "Compression gzip et upload S3 multipart",
    progress: 100,
    dueDate: "10 Oct",
    team: [
      { name: "Alex D.", initials: "AD", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    ],
  },
  {
    id: "proj-3",
    name: "Dashboard Analytics",
    status: "Planning" as const,
    description: "Graphiques de latence et logs en direct",
    progress: 35,
    dueDate: "28 Oct",
    team: [
      { name: "Elena R.", initials: "ER", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
    ],
  },
];

export const app1Activity = [
  {
    id: "act-1",
    person: {
      name: "Sarah M.",
      initials: "SM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    action: "a validé le snapshot R2 pour SupaHub Core",
    time: "Il y a 10 min",
  },
  {
    id: "act-2",
    person: {
      name: "David K.",
      initials: "DK",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    action: "a configuré la relance 72h sur 4 instances",
    time: "Il y a 1 heure",
  },
  {
    id: "act-3",
    person: {
      name: "Alexandre Dupont",
      initials: "AD",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    action: "a connecté l'organisation Supabase OAuth",
    time: "Hier à 18:30",
  },
];
