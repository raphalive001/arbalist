/**
 * compressImage.ts
 *
 * Compresses an image File to ≤ MAX_SIZE_KB using canvas re-encoding with
 * iterative quality reduction plus dimension capping.
 *
 * • PDFs pass through unchanged.
 * • Files already within the limit pass through unchanged.
 * • HEIC / HEIF and any format createImageBitmap cannot decode are uploaded
 *   as-is so the submission never silently fails.
 */

const MAX_SIZE_KB    = 100;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
const MAX_DIMENSION  = 1920; // cap either side before quality reduction

/** MIME types the browser canvas pipeline can reliably handle. */
const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
]);

export async function compressImage(file: File): Promise<File> {
  // Non-image files (PDF) or unsupported image formats (HEIC) → pass through
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;

  // Already small enough
  if (file.size <= MAX_SIZE_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Browser cannot decode this format — upload the original
    return file;
  }

  // Downscale if either dimension exceeds the cap
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width  = Math.round(width  * ratio);
    height = Math.round(height * ratio);
  }

  const canvas  = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx     = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Iteratively reduce JPEG quality until the blob fits
  let quality = 0.85;
  let blob: Blob | null = null;

  while (quality >= 0.05) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_SIZE_BYTES) break;
    quality = +(quality - 0.1).toFixed(2);
  }

  if (!blob) blob = await canvasToBlob(canvas, 'image/jpeg', 0.05);

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
      type,
      quality,
    ),
  );
}
