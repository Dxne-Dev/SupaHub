import { z } from "zod";

export const patSchema = z.object({
  pat: z.string().min(10, "Personal Access Token invalide (trop court)"),
});

export const projectTrackSchema = z.object({
  supabaseProjectRef: z.string().min(1, "Project ref requise"),
  projectName: z.string().min(1, "Nom du projet requis"),
  dbPassword: z.string().optional(),
  dbConnectionUri: z.string().optional(),
  organizationId: z.string().optional(),
  region: z.string().optional(),
});

export const freezeProjectSchema = z.object({
  monitoredProjectId: z.string().uuid("ID de projet invalide").optional(),
  supabaseProjectRef: z.string().optional(),
  dbPassword: z.string().optional(),
  region: z.string().optional(),
});

export const restoreProjectSchema = z.object({
  monitoredProjectId: z.string().uuid("ID de projet invalide"),
  organizationId: z.string().min(1, "Organisation requise"),
  dbPassword: z.string().min(8, "Mot de passe de BDD requis (min 8 caractères)"),
});

export const toggleKeepAliveSchema = z.object({
  monitoredProjectId: z.string().uuid("ID de projet invalide"),
  enabled: z.boolean(),
});
