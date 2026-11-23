import { FFmpeg } from '@ffmpeg/ffmpeg';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

export interface BrowserVideoVariant {
  variant: 'video_720' | 'poster';
  file: File;
}

const MAX_OUTPUT_BYTES = 25 * 1024 * 1024;
let ffmpeg: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const getFFmpeg = (onStatus: (status: string) => void): Promise<FFmpeg> => {
  if (ffmpeg?.loaded) return Promise.resolve(ffmpeg);
  if (!loadPromise) {
    loadPromise = (async () => {
      onStatus('در حال بارگیری مبدل مرورگر (فقط بار اول)...');
      const instance = new FFmpeg();
      try {
        await instance.load({ coreURL, wasmURL });
      } catch (error) {
        instance.terminate();
        throw error;
      }
      ffmpeg = instance;
      return instance;
    })().catch((error: unknown) => {
      loadPromise = null;
      throw error;
    });
  }

  return loadPromise;
};

const createFile = (data: Uint8Array, name: string, type: string): File => {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);

  return new File([copy.buffer], name, { type });
};

export async function transcodeVideoInBrowser(
  source: Uint8Array,
  extension: string,
  onStatus: (status: string) => void,
): Promise<BrowserVideoVariant[]> {
  if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
    throw new Error('مرورگر فعلی از پردازش ویدئو پشتیبانی نمی‌کند.');
  }

  const processor = await getFFmpeg(onStatus);
  const suffix = crypto.randomUUID();
  const inputPath = `source-${suffix}.${extension === 'webm' ? 'webm' : 'mp4'}`;
  const outputPath = `optimized-${suffix}.mp4`;
  const posterPath = `poster-${suffix}.jpg`;
  let inputCreated = false;
  let outputCreated = false;
  let posterCreated = false;
  let completed = false;

  try {
    onStatus('در حال تبدیل ویدئو روی دستگاه شما...');
    await processor.writeFile(inputPath, source);
    inputCreated = true;

    const videoExitCode = await processor.exec([
      '-i',
      inputPath,
      '-map',
      '0:v:0',
      '-map',
      '0:a?',
      '-vf',
      "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      '-c:v',
      'libx264',
      '-threads',
      '1',
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '96k',
      '-movflags',
      '+faststart',
      outputPath,
    ], 600_000);
    if (videoExitCode !== 0) {
      throw new Error('تبدیل ویدئو در مرورگر ناموفق بود؛ ممکن است کدک فایل پشتیبانی نشود.');
    }
    outputCreated = true;

    const posterExitCode = await processor.exec([
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-vf',
      "scale=w='min(640,iw)':h='min(360,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      '-q:v',
      '4',
      posterPath,
    ], 120_000);
    if (posterExitCode !== 0) {
      throw new Error('ساخت تصویر پیش‌نمایش ویدئو ناموفق بود.');
    }
    posterCreated = true;

    const videoData = await processor.readFile(outputPath);
    const posterData = await processor.readFile(posterPath);
    if (typeof videoData === 'string' || typeof posterData === 'string') {
      throw new Error('خروجی مبدل مرورگر معتبر نیست.');
    }

    const videoFile = createFile(videoData, 'optimized.mp4', 'video/mp4');
    const posterFile = createFile(posterData, 'poster.jpg', 'image/jpeg');
    if (videoFile.size > MAX_OUTPUT_BYTES) {
      throw new Error('حجم ویدئوی خروجی از سقف ۲۵ مگابایت بیشتر است؛ فایل اصلی بدون تغییر باقی ماند.');
    }

    completed = true;
    return [
      { variant: 'video_720', file: videoFile },
      { variant: 'poster', file: posterFile },
    ];
  } finally {
    if (completed && processor.loaded) {
      if (posterCreated) await processor.deleteFile(posterPath);
      if (outputCreated) await processor.deleteFile(outputPath);
      if (inputCreated) await processor.deleteFile(inputPath);
    } else {
      processor.terminate();
      if (ffmpeg === processor) {
        ffmpeg = null;
        loadPromise = null;
      }
    }
  }
}
