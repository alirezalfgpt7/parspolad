<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrivateMediaStorageService
{
    public function isAvailable(MediaFile $media): bool
    {
        foreach ($this->candidatePaths($media) as $path) {
            if (Storage::disk('public')->exists($path) || Storage::disk('local')->exists($path)) {
                return true;
            }
        }

        return false;
    }

    public function isAvailableOnPublicDisk(MediaFile $media): bool
    {
        foreach ($this->candidatePaths($media) as $path) {
            if (Storage::disk('public')->exists($path)) {
                return true;
            }
        }

        return false;
    }

    public function protectUrl(?string $url, bool $requiresAuth): ?string
    {
        if (! $url) {
            return null;
        }

        $media = MediaFile::query()->where('url', $url)->first();
        if (! $media && preg_match('~^/storage/([A-Za-z0-9_/-]+\.[A-Za-z0-9]+)$~', $url, $matches) === 1) {
            $sourcePath = $matches[1];
            $media = MediaFile::query()->where('storage_path', $sourcePath)->first();
            if (! $media) {
                abort_unless(Storage::disk('public')->exists($sourcePath), 422, 'فایل محلی برای محافظت پیدا نشد.');
                $media = MediaFile::query()->create([
                    'name' => basename($sourcePath),
                    'url' => $url,
                    'storage_path' => $sourcePath,
                    'mime_type' => Storage::disk('public')->mimeType($sourcePath) ?: 'application/octet-stream',
                    'extension' => strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION)),
                    'size_bytes' => Storage::disk('public')->size($sourcePath),
                    'folder' => dirname($sourcePath),
                    'requires_auth' => false,
                ]);
            }
        }

        abort_unless($media !== null, 422, 'برای سند محافظت‌شده باید فایل را از کتابخانه رسانه بارگذاری کنید.');
        $this->setVisibility($media, $requiresAuth);

        return $media->fresh()->url;
    }

    public function setVisibility(MediaFile $media, bool $requiresAuth): void
    {
        $targetDisk = $requiresAuth ? 'local' : 'public';
        $diskPriority = $media->requires_auth
            ? ['local', 'public']
            : ['public', 'local'];
        $source = null;
        foreach ($this->candidatePaths($media) as $path) {
            foreach ($diskPriority as $disk) {
                if (Storage::disk($disk)->exists($path)) {
                    $source = ['path' => $path, 'disk' => $disk];
                    break 2;
                }
            }
        }
        abort_unless($source !== null, 404, 'فایل اصلی در فضای ذخیره‌سازی پیدا نشد؛ آن را بازیابی یا دوباره بارگذاری کنید.');

        $path = $source['path'];
        $currentDisk = $source['disk'];
        if ($currentDisk !== $targetDisk) {
            $content = Storage::disk($currentDisk)->get($path);
            abort_unless(Storage::disk($targetDisk)->put($path, $content), 500, 'انتقال فایل به فضای ذخیره‌سازی امن ناموفق بود.');
            Storage::disk($currentDisk)->delete($path);
        }

        $media->update([
            'storage_path' => $path,
            'size_bytes' => Storage::disk($targetDisk)->size($path),
            'requires_auth' => $requiresAuth,
            'url' => $requiresAuth ? '/api/v1/media/'.$media->id.'/download' : '/storage/'.$path,
        ]);
    }

    public function store(string $folder, string $filename, string $content, string $mimeType, bool $requiresAuth): MediaFile
    {
        $safeFolder = trim(preg_replace('/[^A-Za-z0-9_-]/', '', $folder) ?: 'uploads', '/');
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $path = $safeFolder.'/'.Str::uuid().'.'.$extension;
        $disk = $requiresAuth ? 'local' : 'public';
        abort_unless(Storage::disk($disk)->put($path, $content), 500, 'ذخیره فایل انجام نشد.');

        $media = MediaFile::query()->create([
            'name' => $filename,
            'url' => $requiresAuth ? '' : '/storage/'.$path,
            'storage_path' => $path,
            'mime_type' => $mimeType,
            'extension' => $extension,
            'size_bytes' => strlen($content),
            'folder' => $safeFolder,
            'requires_auth' => $requiresAuth,
        ]);

        if ($requiresAuth) {
            $media->update(['url' => '/api/v1/media/'.$media->id.'/download']);
        }

        return $media->fresh();
    }

    private function pathFromPublicUrl(string $url): ?string
    {
        $urlPath = parse_url($url, PHP_URL_PATH);
        if (! is_string($urlPath) || ! str_starts_with($urlPath, '/storage/')) {
            return null;
        }

        $path = rawurldecode(substr($urlPath, strlen('/storage/')));
        $segments = explode('/', $path);
        if (
            $path === ''
            || str_contains($path, '\\')
            || str_contains($path, "\0")
            || collect($segments)->contains(fn (string $segment): bool => in_array($segment, ['', '.', '..'], true))
        ) {
            return null;
        }

        return $path;
    }

    /**
     * The storage_path on older records can be stale while the public URL still points
     * to the correct file. Prefer that URL-derived path, then fall back to metadata.
     *
     * @return list<string>
     */
    private function candidatePaths(MediaFile $media): array
    {
        return array_values(array_unique(array_filter([
            $this->pathFromPublicUrl((string) $media->url),
            $media->storage_path,
        ], fn (?string $path): bool => filled($path))));
    }
}
