<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrivateMediaStorageService
{
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
        $expectedUrl = $requiresAuth
            ? '/api/v1/media/'.$media->id.'/download'
            : '/storage/'.$media->storage_path;
        if (
            $media->requires_auth === $requiresAuth
            && filled($media->storage_path)
            && Storage::disk($requiresAuth ? 'local' : 'public')->exists($media->storage_path)
            && $media->url === $expectedUrl
        ) {
            return;
        }

        $path = $media->storage_path ?: $this->pathFromPublicUrl($media->url);
        $storedPrivately = $media->requires_auth
            && filled($path)
            && Storage::disk('local')->exists($path);
        $currentDisk = $storedPrivately ? 'local' : 'public';
        $targetDisk = $requiresAuth ? 'local' : 'public';
        abort_unless($path && Storage::disk($currentDisk)->exists($path), 422, 'فایل اصلی برای تغییر سطح دسترسی پیدا نشد.');

        if ($currentDisk !== $targetDisk) {
            $content = Storage::disk($currentDisk)->get($path);
            abort_unless(Storage::disk($targetDisk)->put($path, $content), 500, 'انتقال فایل به فضای ذخیره‌سازی امن ناموفق بود.');
            Storage::disk($currentDisk)->delete($path);
        }

        $media->update([
            'storage_path' => $path,
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
        return preg_match('~^/storage/([A-Za-z0-9_/-]+\.[A-Za-z0-9]+)$~', $url, $matches) === 1
            ? $matches[1]
            : null;
    }
}
