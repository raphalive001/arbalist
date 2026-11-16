/**
 * compressImage.ts
 *
 * Compresses an image File to a maximum of MAX_SIZE_KB kilobytes using
 * canvas-based JPEG re-encoding with iterative quality reduction.
 *
 * PDFs are returned unchanged (canvas cannot render them).
 * If the original file is already within the limit it is returned as-is.
 */

const MAX_SIZE_KB = 100;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;

/** Maximum dimension (px) for either side before we start quality reduction. */
const MAX_DIMENSION = 1920;

export async function compressImage(file: File): Promise<File> {
  // Pass PDFs through untouched
  if (file.type === 'application/pdf') return file;

  // Already small enough — skip processing
  if (file.size <= MAX_SIZE_BYTES) return file;

  const bitmap = await createImageBitmap(file);

  // Downscale dimensions if the image is very large
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width  = Math.round(width  * ratio);
    height = Math.round(height * ratio);
  }

  const canvas  = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Iteratively reduce quality until the blob fits within the limit
  let quality = 0.85;
  let blob: Blob | null = null;

  while (quality >= 0.05) {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (blob.size <= MAX_SIZE_BYTES) break;
    quality = +(quality - 0.1).toFixed(2);
  }

  // Safety fallback: if still too large after min quality, use the smallest we got
  if (!blob) blob = await canvasToBlob(canvas, 'image/jpeg', 0.05);

  const ext      = file.name.replace(/\.[^.]+$/, '');
  const fileName = `${ext}.jpg`;
  return new File([blob], fileName, { type: 'image/jpeg' });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      type,
      quality,
    ),
  );
}
