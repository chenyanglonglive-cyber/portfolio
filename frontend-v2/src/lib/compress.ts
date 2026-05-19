/**
 * Client-side image compression to WebP.
 * Uses Canvas API with binary search on quality to hit 100-200KB target.
 */

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

/**
 * Compress an image File to WebP targeting 100-200KB.
 * Uses iterative quality adjustment — stops early once within range.
 */
export async function compressImageToWebP(
  file: File,
  targetKB: { min: number; max: number } = { min: 100, max: 200 }
): Promise<CompressResult> {
  const originalSize = file.size;

  // If already WebP and within range, return as-is
  if (
    file.type === 'image/webp' &&
    originalSize >= targetKB.min * 1024 &&
    originalSize <= targetKB.max * 1024
  ) {
    const dims = await getImageDimensions(file);
    return { file, originalSize, compressedSize: originalSize, ...dims };
  }

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(img, 0, 0);

  // Binary search for quality that hits target size
  let lo = 0.1;
  let hi = 1.0;
  let best: { blob: Blob; quality: number } | null = null;

  for (let i = 0; i < 8; i++) {
    const q = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, q);

    if (!blob) break;

    const kb = blob.size / 1024;

    if (kb >= targetKB.min && kb <= targetKB.max) {
      // Perfect — in range
      best = { blob, quality: q };
      break;
    }

    if (kb < targetKB.min) {
      // Too small — increase quality
      lo = q;
      // But if we're already at max quality, keep it
      if (q >= 0.98) {
        best = { blob, quality: q };
        break;
      }
    } else {
      // Too large — decrease quality
      hi = q;
      best = { blob, quality: q }; // keep as fallback
    }
  }

  // If binary search didn't converge perfectly, use best fallback
  if (!best) {
    const blob = await canvasToBlob(canvas, 0.6);
    if (!blob) throw new Error('Failed to compress image');
    best = { blob, quality: 0.6 };
  }

  const ext = getFileExtension(file.name);
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp';

  return {
    file: new File([best.blob], name, { type: 'image/webp' }),
    originalSize,
    compressedSize: best.blob.size,
    width: img.width,
    height: img.height,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
  });
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

function getFileExtension(name: string): string {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : '';
}
