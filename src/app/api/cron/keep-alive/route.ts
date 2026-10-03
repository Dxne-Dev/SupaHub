import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptText } from "@/lib/crypto";
import { Client } from "pg";

export const maxDuration = 300; // 5 minutes max runtime

export async function GET(request: Request) {
  // 1. Vérification de la clé secrète du Cron (CRON_SECRET)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 2. Sélection des projets avec keep_alive_enabled = true et status = 'ACTIVE'
  const { data: projects, error } = await supabase
    .from("monitored_projects")
    .select("id, supabase_project_ref, db_connection_uri_encrypted, last_ping_at, project_name")
    .eq("keep_alive_enabled", true)
    .eq("status", "ACTIVE");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{
    projectId: string;
    projectName?: string;
    ref: string;
    status: "success" | "failed";
    statusCode: number;
    method: "REST_API" | "POSTGRESQL_DIRECT" | "AUTH_HEALTH";
    error?: string;
  }> = [];

  for (const project of projects || []) {
    let statusCode = 200;
    let isSuccess = false;
    let pingMethod: "REST_API" | "POSTGRESQL_DIRECT" | "AUTH_HEALTH" = "REST_API";
    let pingError: string | undefined;

    try {
      let anonKey: string | null = null;
      let serviceKey: string | null = null;
      let postgresUri: string | null = null;

      if (project.db_connection_uri_encrypted) {
        try {
          const decrypted = decryptText(project.db_connection_uri_encrypted);
          if (decrypted.startsWith("postgresql://") || decrypted.startsWith("postgres://")) {
            postgresUri = decrypted;
          } else {
            try {
              const parsed = JSON.parse(decrypted);
              anonKey = parsed.anon_key || null;
              serviceKey = parsed.service_role_key || null;
            } catch {
              anonKey = decrypted;
            }
          }
        } catch (e: any) {
          console.warn(`Erreur déchiffrement pour projet ${project.supabase_project_ref}:`, e);
        }
      }

      // Méthode A : Si une URI PostgreSQL directe est disponible
      if (postgresUri) {
        pingMethod = "POSTGRESQL_DIRECT";
        const client = new Client({
          connectionString: postgresUri,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        });

        await client.connect();
        await client.query("SELECT 1;");
        await client.end();
        isSuccess = true;
        statusCode = 200;
      }
      // Méthode B : Ping REST API via l'Anon Key / Service Key
      else if (anonKey || serviceKey) {
        pingMethod = "REST_API";
        const keyToUse = serviceKey || anonKey || "";
        const res = await fetch(`https://${project.supabase_project_ref}.supabase.co/rest/v1/`, {
          method: "GET",
          headers: {
            apikey: keyToUse,
            Authorization: `Bearer ${keyToUse}`,
          },
          signal: AbortSignal.timeout(10000),
        });

        statusCode = res.status;
        // Toute réponse de l'API (200, 404 table vide, etc.) prouve que l'instance est réveillée
        isSuccess = res.status < 500;
      }
      // Méthode C : Ping Auth Health public
      else {
        pingMethod = "AUTH_HEALTH";
        const res = await fetch(`https://${project.supabase_project_ref}.supabase.co/auth/v1/health`, {
          method: "GET",
          signal: AbortSignal.timeout(10000),
        });

        statusCode = res.status;
        isSuccess = res.status < 500;
      }
    } catch (err: any) {
      statusCode = 500;
      isSuccess = false;
      pingError = err.message || "Erreur lors du ping";
    }

    // Mise à jour de l'état du ping dans SupaHub
    await supabase
      .from("monitored_projects")
      .update({
        last_ping_at: new Date().toISOString(),
        last_ping_status_code: statusCode,
      })
      .eq("id", project.id);

    results.push({
      projectId: project.id,
      projectName: project.project_name,
      ref: project.supabase_project_ref,
      status: isSuccess ? "success" : "failed",
      statusCode,
      method: pingMethod,
      error: pingError,
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalPinged: results.length,
    results,
  });
}
