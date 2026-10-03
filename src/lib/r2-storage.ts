import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 credentials in environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getBucketName(): string {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not defined in environment variables.");
  }
  return bucketName;
}

/**
 * Upload un buffer compressé (.sql.gz) sur Cloudflare R2
 */
export async function uploadSnapshotToR2(
  fileKey: string,
  buffer: Buffer,
  contentType: string = "application/gzip"
): Promise<{ key: string; size: number }> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return {
    key: fileKey,
    size: buffer.length,
  };
}

/**
 * Télécharge un snapshot depuis Cloudflare R2 et retourne le Buffer
 */
export async function downloadSnapshotFromR2(fileKey: string): Promise<Buffer> {
  const client = getR2Client();
  const bucket = getBucketName();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })
  );

  if (!response.Body) {
    throw new Error(`Failed to retrieve file ${fileKey} from R2 storage.`);
  }

  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Supprime un snapshot de Cloudflare R2
 */
export async function deleteSnapshotFromR2(fileKey: string): Promise<void> {
  const client = getR2Client();
  const bucket = getBucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    })
  );
}
