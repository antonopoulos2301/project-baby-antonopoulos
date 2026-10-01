import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicUrl = process.env.R2_PUBLIC_URL;

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && bucket && publicUrl,
);

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
  }

  return client;
}

function buildPublicUrl(key: string): string {
  const base = (publicUrl as string).replace(/\/+$/, "");
  return `${base}/${key}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

interface UploadParams {
  buffer: Buffer;
  contentType: string;
  originalName: string;
}

export async function uploadToR2(
  params: UploadParams,
): Promise<{ key: string; url: string }> {
  const { buffer, contentType, originalName } = params;

  const extFromName = originalName.includes(".")
    ? originalName.split(".").pop() ?? ""
    : "";
  const ext = (extFromName.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg");

  const baseName =
    slugify(originalName.replace(/\.[^.]+$/, "")) || "memoria";

  const key = `memorias/${Date.now()}-${baseName}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket as string,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    }),
  );

  return { key, url: buildPublicUrl(key) };
}
