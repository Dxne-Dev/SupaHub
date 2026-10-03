import { exec } from "child_process";
import { promisify } from "util";
import zlib from "zlib";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

export interface DumpDatabaseOptions {
  connectionUri: string;
}

/**
 * Exécute pg_dump sur l'URI spécifiée et retourne le buffer compressé .sql.gz
 */
export async function dumpDatabaseToGzip(connectionUri: string): Promise<Buffer> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "supahub-dump-"));
  const dumpFilePath = path.join(tempDir, "dump.sql");

  try {
    // Commande pg_dump: extrait le schéma, les données, les rôles & rls
    // Timeout de 5 minutes (300 000 ms)
    const cmd = `pg_dump "${connectionUri}" --clean --if-exists --no-owner --no-privileges -f "${dumpFilePath}"`;
    
    await execAsync(cmd, {
      timeout: 300000,
      maxBuffer: 1024 * 1024 * 500, // 500 MB
    });

    const dumpContent = await fs.readFile(dumpFilePath);
    const compressed = await gzipAsync(dumpContent);
    return compressed;
  } catch (error: any) {
    // Si pg_dump n'est pas présent dans le système, mode fallback SQL query direct ou message explicite
    if (error?.message?.includes("pg_dump: not found") || error?.message?.includes("'pg_dump' is not recognized")) {
      throw new Error("L'outil pg_dump n'est pas installé sur l'hôte. Veuillez installer PostgreSQL client tools.");
    }
    throw new Error(`Échec de l'exportation de la base de données: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Nettoyage silencieux
    }
  }
}

/**
 * Décompresse un buffer .sql.gz et restaure le contenu via psql sur le nouveau projet
 */
export async function restoreDatabaseFromGzip(connectionUri: string, gzipBuffer: Buffer): Promise<void> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "supahub-restore-"));
  const restoreFilePath = path.join(tempDir, "restore.sql");

  try {
    const uncompressedSql = await gunzipAsync(gzipBuffer);
    await fs.writeFile(restoreFilePath, uncompressedSql);

    // Timeout de 5 minutes (300 000 ms)
    const cmd = `psql "${connectionUri}" -f "${restoreFilePath}"`;
    await execAsync(cmd, {
      timeout: 300000,
      maxBuffer: 1024 * 1024 * 500,
    });
  } catch (error: any) {
    if (error?.message?.includes("psql: not found") || error?.message?.includes("'psql' is not recognized")) {
      throw new Error("L'outil psql n'est pas installé sur l'hôte. Veuillez installer PostgreSQL client tools.");
    }
    throw new Error(`Échec de la restauration de la base de données: ${error.message}`);
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Nettoyage silencieux
    }
  }
}
