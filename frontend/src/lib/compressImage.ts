// Reduz a foto no próprio navegador antes de enviar: lado maior até 2000px,
// WebP (ou JPEG) em boa qualidade. Mantém a foto bonita e bem abaixo do
// limite de 4,5 MB por requisição da Vercel.

const MAX_SIDE = 2000;
const TARGET_BYTES = 4 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // respeita a orientação EXIF (foto do celular "deitada")
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* cai no <img> abaixo */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    // formato que o navegador não abre (ex.: HEIC no Chrome): envia como está
    return file;
  }

  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  // Safari antigo não gera WebP: nesse caso usamos JPEG
  let type = "image/webp";
  let blob = await toBlob(canvas, type, 0.85);
  if (!blob || blob.type !== "image/webp") {
    type = "image/jpeg";
    blob = await toBlob(canvas, type, 0.85);
  }
  for (const q of [0.75, 0.65]) {
    if (!blob || blob.size <= TARGET_BYTES) break;
    blob = await toBlob(canvas, type, q);
  }
  if (!blob) return file;

  // se o original já era menor (e cabe no limite), fica com ele
  if (file.size <= blob.size && file.size <= TARGET_BYTES) return file;

  const ext = type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type, lastModified: file.lastModified });
}
