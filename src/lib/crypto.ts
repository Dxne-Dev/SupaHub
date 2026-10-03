import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes pour GCM

function getKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;
  if (!keyEnv) {
    throw new Error("ENCRYPTION_KEY is missing from environment variables.");
  }
  // Si la clé est en hexadécimal de 64 caractères (32 bytes)
  if (keyEnv.length === 64 && /^[0-9a-fA-F]+$/.test(keyEnv)) {
    return Buffer.from(keyEnv, "hex");
  }
  // Sinon on utilise sha256 pour dériver une clé de 32 bytes sécurisée
  return crypto.createHash("sha256").update(keyEnv).digest();
}

/**
 * Chiffre un texte clair en utilisant AES-256-GCM
 * Format de sortie: `iv:authTag:encryptedData` (hex)
 */
export function encryptText(plainText: string): string {
  if (!plainText) return "";
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Déchiffre un texte chiffré au format `iv:authTag:encryptedData`
 */
export function decryptText(cipherText: string): string {
  if (!cipherText) return "";
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid cipher text format. Expected iv:authTag:data");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
