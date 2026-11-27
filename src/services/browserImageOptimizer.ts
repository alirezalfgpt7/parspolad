export interface BrowserImageVariant {
  variant: 'thumbnail' | 'content' | 'hero';
  file: File;
}

const IMAGE_VARIANTS = [
  { variant: 'thumbnail', width: 320 },
  { variant: 'content', width: 960 },
  { variant: 'hero', width: 1600 },
] as const;
const MAX_PIXELS = 25_000_000;

export function isBrowserImageOptimizerAvailable(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export async function optimizeImageInBrowser(source: Blob): Promise<BrowserImageVariant[]> {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('مرورگر فعلی از پردازش تصویر پشتیبانی نمی‌کند.');
  }

  const image = await createImageBitmap(source, { imageOrientation: 'from-image' });
  try {
    if (image.width * image.height > MAX_PIXELS) {
      throw new Error('ابعاد تصویر بزرگ‌تر از حد امن پردازش است.');
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('ساخت بوم پردازش تصویر در مرورگر ناموفق بود.');

    const variants: BrowserImageVariant[] = [];
    for (const { variant, width } of IMAGE_VARIANTS) {
      const scale = Math.min(1, width / image.width);
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error('تبدیل تصویر به WebP در مرورگر ناموفق بود.'));
        }, 'image/webp', 0.88);
      });
      if (blob.type !== 'image/webp') {
        throw new Error('مرورگر فعلی از خروجی WebP پشتیبانی نمی‌کند.');
      }

      variants.push({ variant, file: new File([blob], `${variant}.webp`, { type: 'image/webp' }) });
    }

    return variants;
  } finally {
    image.close();
  }
}
