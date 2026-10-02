import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

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
      // O Cloudflare R2 não suporta os checksums que as versões novas do
      // AWS SDK enviam por padrão — desativar evita falha no upload.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
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
  prefix?: string;
}

export async function uploadToR2(
  params: UploadParams,
): Promise<{ key: string; url: string }> {
  const { buffer, contentType, originalName, prefix = "memorias" } = params;

  const originalExt =
    (originalName.includes(".")
      ? originalName.split(".").pop() ?? ""
      : ""
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";

  const baseName =
    slugify(originalName.replace(/\.[^.]+$/, "")) || "foto";

  // Otimiza imagens: converte para WebP (ótima qualidade, bem mais leve),
  // reorienta pelo EXIF e limita o maior lado a 2000px.
  let body: Buffer = buffer;
  let ext = originalExt;
  let finalContentType = contentType || "application/octet-stream";

  if ((contentType || "").startsWith("image/")) {
    try {
      body = await sharp(buffer, { animated: true })
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      ext = "webp";
      finalContentType = "image/webp";
    } catch (err) {
      console.error("Falha ao otimizar imagem, enviando original:", err);
      body = buffer;
      ext = originalExt;
      finalContentType = contentType || "application/octet-stream";
    }
  }

  const key = `${prefix}/${Date.now()}-${baseName}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket as string,
      Key: key,
      Body: body,
      ContentType: finalContentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { key, url: buildPublicUrl(key) };
}
