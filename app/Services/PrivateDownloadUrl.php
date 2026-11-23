<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class PrivateDownloadUrl
{
    public function resolve(?string $storedUrl, bool $requiresAuth, Request $request): ?string
    {
        if (! $requiresAuth) {
            return $storedUrl;
        }

        $user = $request->user('sanctum');
        if (! $user?->is_active || ! $storedUrl || preg_match('~^/api/v1/media/(\d+)/download$~', $storedUrl, $matches) !== 1) {
            return null;
        }

        $media = MediaFile::query()->find((int) $matches[1]);
        if (! $media?->requires_auth) {
            return null;
        }

        return URL::temporarySignedRoute(
            'media.download',
            now()->addMinutes($request->is('api/v1/admin/*') ? 60 : 5),
            ['media' => $media->id],
        );
    }

    public function preview(MediaFile $media, Request $request): ?string
    {
        if ($media->requires_auth) {
            if (! $request->user('sanctum')?->is_active) {
                return null;
            }

            return URL::temporarySignedRoute(
                'media.preview',
                $this->previewExpiration($request),
                ['media' => $media->id],
            );
        }

        return route('media.preview', ['media' => $media->id], false);
    }

    public function resolvePreloaderMediaSettings(array $settings): array
    {
        foreach (['initial', 'internal'] as $mode) {
            if (! is_array($settings[$mode] ?? null)) {
                continue;
            }

            foreach (['logo_url', 'background_image'] as $field) {
                $storedUrl = $settings[$mode][$field] ?? null;
                if (! is_string($storedUrl) || ! str_starts_with($storedUrl, '/storage/')) {
                    continue;
                }

                $media = MediaFile::query()
                    ->with('variants')
                    ->where('url', $storedUrl)
                    ->where('requires_auth', false)
                    ->first();

                if (! $media) {
                    continue;
                }

                $isVideo = str_starts_with($media->mime_type, 'video/');
                $playbackMedia = $isVideo
                    ? $media->variants->firstWhere('variant', 'video_720') ?? $media
                    : $media;
                $previewUrl = route('media.preview', ['media' => $playbackMedia->id], false);

                $settings[$mode][$field] = $isVideo ? "{$previewUrl}#video" : $previewUrl;
            }
        }

        return $settings;
    }

    public function thumbnail(MediaFile $media, Request $request): ?string
    {
        if ($media->requires_auth) {
            if (! $request->user('sanctum')?->is_active) {
                return null;
            }

            return URL::temporarySignedRoute(
                'media.thumbnail',
                $this->previewExpiration($request),
                ['media' => $media->id],
            );
        }

        return route('media.thumbnail', ['media' => $media->id], false);
    }

    private function previewExpiration(Request $request): Carbon
    {
        return now()->startOfHour()->addHours($request->is('api/v1/admin/*') ? 2 : 1);
    }
}
