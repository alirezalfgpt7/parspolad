<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Symfony\Component\Process\Exception\ProcessStartFailedException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;
use Throwable;

class MediaOptimizationService
{
    private const IMAGE_VARIANTS = [
        'thumbnail' => 320,
        'content' => 960,
        'hero' => 1600,
    ];

    public function capabilities(): array
    {
        return [
            'images' => [
                'available' => extension_loaded('gd') && function_exists('imagewebp'),
                'format' => 'webp',
            ],
            'videos' => [
                'available' => $this->ffmpegPath() !== null,
                'format' => 'mp4 (H.264)',
            ],
        ];
    }

    public function optimizationCheck(MediaFile $media, PrivateMediaStorageService $storage): array
    {
        abort_if($media->source_media_id !== null, 422, 'نسخه‌های تولیدشده را از فایل اصلی دوباره بهینه کنید.');

        $isImage = in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true);
        $isVideo = in_array($media->mime_type, ['video/mp4', 'video/webm'], true);
        abort_unless($isImage || $isVideo, 422, 'این نوع رسانه برای بهینه‌سازی پشتیبانی نمی‌شود.');

        $storage->setVisibility($media, (bool) $media->requires_auth);
        $media->refresh();

        $requiredVariants = $isImage
            ? ['thumbnail', 'content', 'hero']
            : ['video_720', 'poster'];
        $variants = $media->variants()
            ->whereIn('variant', $requiredVariants)
            ->get(['variant', 'size_bytes'])
            ->keyBy('variant');
        $complete = collect($requiredVariants)->every(fn (string $variant): bool => $variants->has($variant));
        $primaryVariant = $variants->get($isImage ? 'content' : 'video_720');
        $alreadyOptimized = $complete
            && $primaryVariant !== null
            && $primaryVariant->size_bytes < $media->size_bytes;
        $sizeLimit = $isImage ? 300 * 1024 : 5 * 1024 * 1024;
        $smallFile = $media->size_bytes > 0 && $media->size_bytes <= $sizeLimit;

        return [
            'requires_confirmation' => $alreadyOptimized || $smallFile,
            'reason' => $alreadyOptimized
                ? 'نسخه‌های بهینهٔ این فایل از قبل وجود دارند؛ اجرای دوباره آن‌ها را جایگزین می‌کند.'
                : ($smallFile
                    ? 'حجم فایل از ابتدا کم است و ممکن است بهینه‌سازی کاهش چشمگیری ایجاد نکند.'
                    : null),
            'source_size_bytes' => $media->size_bytes,
            'optimized_variants' => $variants->map(fn (MediaFile $variant): array => [
                'variant' => $variant->variant,
                'size_bytes' => $variant->size_bytes,
            ])->values(),
        ];
    }

    public function optimize(MediaFile $media, PrivateMediaStorageService $storage): array
    {
        abort_if($media->source_media_id !== null, 422, 'نسخه‌های تولیدشده را از فایل اصلی دوباره بهینه کنید.');
        $storage->setVisibility($media, (bool) $media->requires_auth);
        $media->refresh();

        if (in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true)) {
            return $this->optimizeImage($media);
        }

        if (in_array($media->mime_type, ['video/mp4', 'video/webm'], true)) {
            return $this->optimizeVideo($media);
        }

        abort(422, 'این نوع رسانه برای بهینه‌سازی پشتیبانی نمی‌شود.');
    }

    public function thumbnail(MediaFile $media, PrivateMediaStorageService $storage): string
    {
        $storage->setVisibility($media, (bool) $media->requires_auth);
        $media->refresh();
        $disk = $media->requires_auth ? 'local' : 'public';

        if ($media->source_media_id !== null) {
            if (in_array($media->variant, ['thumbnail', 'poster'], true)) {
                abort_unless(
                    filled($media->storage_path) && Storage::disk($disk)->exists($media->storage_path),
                    404,
                    'فایل بندانگشتی ذخیره‌شده پیدا نشد.',
                );
                $contents = Storage::disk($disk)->get($media->storage_path);
                abort_unless(is_string($contents), 500, 'خواندن تصویر بندانگشتی ذخیره‌شده ناموفق بود.');

                return $contents;
            }

            $source = $media->source;
            abort_unless($source !== null, 404, 'فایل اصلی این نسخه پیدا نشد.');

            return $this->thumbnail($source, $storage);
        }

        if (in_array($media->mime_type, ['video/mp4', 'video/webm'], true)) {
            $poster = $media->variants()->where('variant', 'poster')->first();
            abort_unless(
                $poster !== null
                    && filled($poster->storage_path)
                    && Storage::disk($media->requires_auth ? 'local' : 'public')->exists($poster->storage_path),
                404,
                'تصویر بندانگشتی ویدئو هنوز ساخته نشده است.',
            );

            $contents = Storage::disk($media->requires_auth ? 'local' : 'public')->get($poster->storage_path);
            abort_unless(is_string($contents), 500, 'خواندن تصویر بندانگشتی ویدئو ناموفق بود.');

            return $contents;
        }

        abort_unless(in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true), 422, 'برای این نوع فایل پیش‌نمایش تصویری وجود ندارد.');

        $thumbnail = $media->variants()->where('variant', 'thumbnail')->first();
        if ($thumbnail !== null && filled($thumbnail->storage_path) && Storage::disk($disk)->exists($thumbnail->storage_path)) {
            $contents = Storage::disk($disk)->get($thumbnail->storage_path);
            abort_unless(is_string($contents), 500, 'خواندن تصویر بندانگشتی ناموفق بود.');

            return $contents;
        }

        abort_unless(extension_loaded('gd') && function_exists('imagewebp'), 503, 'ساخت بندانگشتی به GD با پشتیبانی WebP نیاز دارد.');
        $source = $this->readSource($media);
        $dimensions = getimagesizefromstring($source);
        abort_unless($dimensions !== false, 422, 'ساختار تصویر معتبر نیست.');
        abort_if($dimensions[0] * $dimensions[1] > 25_000_000, 422, 'تصویر بزرگ‌تر از حد امن پردازش است.');

        $contents = (new ImageManager(new Driver))
            ->decodeBinary($source)
            ->orient()
            ->scaleDown(width: 320)
            ->encode(new WebpEncoder(quality: 82, strip: true))
            ->toString();
        $stored = $this->persistVariants($media, [
            'thumbnail' => [
                'contents' => $contents,
                'extension' => 'webp',
                'mime_type' => 'image/webp',
            ],
        ])[0];

        $contents = Storage::disk($disk)->get($stored->storage_path);
        abort_unless(is_string($contents), 500, 'خواندن تصویر بندانگشتی ذخیره‌شده ناموفق بود.');

        return $contents;
    }

    public function storeBrowserVideoVariant(MediaFile $source, string $variant, string $contents, string $mimeType): MediaFile
    {
        abort_unless(in_array($source->mime_type, ['video/mp4', 'video/webm'], true), 422, 'نسخهٔ مرورگری فقط برای فایل ویدئویی مجاز است.');

        $extension = match ($variant) {
            'video_720' => 'mp4',
            'poster' => 'jpg',
            default => abort(422, 'نوع نسخهٔ ویدئو معتبر نیست.'),
        };
        $expectedMimeType = $variant === 'poster' ? 'image/jpeg' : 'video/mp4';
        abort_unless($mimeType === $expectedMimeType, 422, 'فرمت نسخهٔ تولیدشده با نوع آن مطابقت ندارد.');

        return $this->persistVariants($source, [
            $variant => [
                'contents' => $contents,
                'extension' => $extension,
                'mime_type' => $expectedMimeType,
            ],
        ])[0];
    }

    private function optimizeImage(MediaFile $media): array
    {
        abort_unless(extension_loaded('gd') && function_exists('imagewebp'), 503, 'پردازش تصویر به افزونه GD با پشتیبانی WebP نیاز دارد.');
        $source = $this->readSource($media);
        $dimensions = getimagesizefromstring($source);
        abort_unless($dimensions !== false, 422, 'ساختار تصویر معتبر نیست.');
        abort_if($dimensions[0] * $dimensions[1] > 25_000_000, 422, 'تصویر بزرگ‌تر از حد امن پردازش است؛ ابتدا ابعاد آن را کاهش دهید.');

        $manager = new ImageManager(new Driver);
        $image = $manager->decodeBinary($source);
        abort_if($image->isAnimated(), 422, 'برای حفظ انیمیشن، تبدیل تصویر متحرک پشتیبانی نمی‌شود.');
        unset($image);

        $variants = [];
        foreach (self::IMAGE_VARIANTS as $name => $width) {
            $encoded = $manager->decodeBinary($source)
                ->orient()
                ->scaleDown(width: $width)
                ->encode(new WebpEncoder(quality: 88, strip: true));

            $variants[$name] = [
                'contents' => $encoded->toString(),
                'extension' => 'webp',
                'mime_type' => 'image/webp',
            ];
        }

        return $this->persistVariants($media, $variants);
    }

    private function optimizeVideo(MediaFile $media): array
    {
        $binary = $this->ffmpegPath();
        abort_if($binary === null, 503, 'برای تبدیل ویدئو، FFmpeg باید روی سرور نصب و در PATH قرار داده شود.');
        $source = $this->readSource($media);
        $workspace = sys_get_temp_dir().DIRECTORY_SEPARATOR.'ppa-media-'.Str::uuid();
        abort_unless(mkdir($workspace, 0700), 500, 'ساخت فضای موقت پردازش ویدئو ناموفق بود.');

        try {
            $inputExtension = $media->mime_type === 'video/webm' ? 'webm' : 'mp4';
            abort_unless(in_array($media->extension, ['mp4', 'webm'], true), 422, 'پسوند فایل ویدئو پشتیبانی نمی‌شود.');
            $input = $workspace.DIRECTORY_SEPARATOR.'source.'.$inputExtension;
            $output = $workspace.DIRECTORY_SEPARATOR.'optimized.mp4';
            $poster = $workspace.DIRECTORY_SEPARATOR.'poster.jpg';
            abort_unless(file_put_contents($input, $source) !== false, 500, 'خواندن فایل ویدئو برای پردازش ناموفق بود.');

            $conversion = new Process([
                $binary,
                '-nostdin',
                '-hide_banner',
                '-loglevel',
                'error',
                '-y',
                '-i',
                $input,
                '-map',
                '0:v:0',
                '-map',
                '0:a?',
                '-vf',
                "scale=w='min(1280,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
                '-c:v',
                'libx264',
                '-preset',
                'medium',
                '-crf',
                '26',
                '-pix_fmt',
                'yuv420p',
                '-c:a',
                'aac',
                '-b:a',
                '128k',
                '-movflags',
                '+faststart',
                $output,
            ]);
            $conversion->setTimeout(600);
            $conversion->run();
            if (! $conversion->isSuccessful()) {
                Log::warning('Media video optimization failed.', [
                    'media_id' => $media->id,
                    'exit_code' => $conversion->getExitCode(),
                    'error' => Str::limit($conversion->getErrorOutput(), 1000),
                ]);
                abort(422, 'تبدیل ویدئو انجام نشد؛ فرمت فایل یا نصب کدک H.264 را بررسی کنید.');
            }

            $thumbnail = new Process([
                $binary,
                '-nostdin',
                '-hide_banner',
                '-loglevel',
                'error',
                '-y',
                '-i',
                $input,
                '-frames:v',
                '1',
                '-vf',
                "scale=w='min(640,iw)':h='min(360,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
                '-q:v',
                '3',
                $poster,
            ]);
            $thumbnail->setTimeout(120);
            $thumbnail->run();
            abort_unless($thumbnail->isSuccessful(), 422, 'ساخت تصویر پیش‌نمایش ویدئو ناموفق بود.');
            abort_unless(is_file($output) && is_file($poster), 422, 'خروجی تبدیل ویدئو ساخته نشد.');

            $variants = [
                'video_720' => [
                    'contents' => file_get_contents($output),
                    'extension' => 'mp4',
                    'mime_type' => 'video/mp4',
                ],
                'poster' => [
                    'contents' => file_get_contents($poster),
                    'extension' => 'jpg',
                    'mime_type' => 'image/jpeg',
                ],
            ];
            abort_unless(is_string($variants['video_720']['contents']) && is_string($variants['poster']['contents']), 500, 'خواندن خروجی تبدیل ویدئو ناموفق بود.');

            return $this->persistVariants($media, $variants);
        } finally {
            foreach (glob($workspace.DIRECTORY_SEPARATOR.'*') ?: [] as $path) {
                if (is_file($path) && ! unlink($path)) {
                    throw new \RuntimeException('پاک‌سازی فایل موقت پردازش ویدئو ناموفق بود.');
                }
            }
            if (! rmdir($workspace)) {
                throw new \RuntimeException('پاک‌سازی فضای موقت پردازش ویدئو ناموفق بود.');
            }
        }
    }

    private function persistVariants(MediaFile $source, array $variants): array
    {
        $disk = $source->requires_auth ? 'local' : 'public';
        $newPaths = [];

        try {
            $created = DB::transaction(function () use ($source, $variants, $disk, &$newPaths): array {
                $results = [];
                foreach ($variants as $variant => $data) {
                    $record = MediaFile::withTrashed()
                        ->where('source_media_id', $source->id)
                        ->where('variant', $variant)
                        ->lockForUpdate()
                        ->first();
                    $path = $record?->storage_path
                        ?: "optimized/{$source->id}/{$variant}/".Str::uuid().'.'.$data['extension'];
                    abort_unless(Storage::disk($disk)->put($path, $data['contents']), 500, 'ذخیره نسخه بهینه‌شده ناموفق بود.');
                    if ($record === null) {
                        $newPaths[] = $path;
                        $record = new MediaFile;
                        $record->source_media_id = $source->id;
                        $record->variant = $variant;
                    } elseif ($record->trashed()) {
                        $record->restore();
                    }

                    $record->fill([
                        'name' => Str::limit($source->name.' - '.$variant, 255, ''),
                        'url' => '/storage/'.$path,
                        'storage_path' => $path,
                        'mime_type' => $data['mime_type'],
                        'extension' => $data['extension'],
                        'size_bytes' => strlen($data['contents']),
                        'folder' => "optimized/{$source->id}",
                        'requires_auth' => $source->requires_auth,
                        'alt_text' => $source->alt_text,
                        'description' => $source->description,
                    ]);
                    $record->save();
                    if ($source->requires_auth) {
                        $record->update(['url' => '/api/v1/media/'.$record->id.'/download']);
                    }
                    $results[] = $record->fresh();
                }

                return $results;
            });
        } catch (Throwable $error) {
            Storage::disk($disk)->delete($newPaths);
            throw $error;
        }

        return $created;
    }

    private function readSource(MediaFile $media): string
    {
        $disk = $media->requires_auth ? 'local' : 'public';
        abort_unless(filled($media->storage_path) && Storage::disk($disk)->exists($media->storage_path), 404, 'فایل اصلی برای بهینه‌سازی پیدا نشد.');
        $contents = Storage::disk($disk)->get($media->storage_path);
        abort_unless(is_string($contents), 500, 'خواندن فایل اصلی ناموفق بود.');

        return $contents;
    }

    private function ffmpegPath(): ?string
    {
        if (! function_exists('proc_open')) {
            return null;
        }

        $binary = (string) config('media.ffmpeg_binary', 'ffmpeg');
        $path = (new ExecutableFinder)->find($binary);
        if ($path === null) {
            return null;
        }

        $probe = new Process([$path, '-hide_banner', '-encoders']);
        $probe->setTimeout(5);
        try {
            $probe->run();
        } catch (ProcessStartFailedException|ProcessTimedOutException $error) {
            Log::notice('Configured FFmpeg binary cannot be used; browser video conversion will be used.', [
                'error' => $error->getMessage(),
            ]);

            return null;
        }

        if (
            ! $probe->isSuccessful()
            || ! str_contains($probe->getOutput(), 'libx264')
            || ! preg_match('/\baac\b/', $probe->getOutput())
        ) {
            return null;
        }

        return $path;
    }
}
