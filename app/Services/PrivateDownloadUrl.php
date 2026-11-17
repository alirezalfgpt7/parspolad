<?php

namespace App\Services;

use App\Models\MediaFile;
use Illuminate\Http\Request;
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

        if ($request->is('api/v1/admin/*')) {
            return $storedUrl;
        }

        $media = MediaFile::query()->find((int) $matches[1]);
        if (! $media?->requires_auth) {
            return null;
        }

        return URL::temporarySignedRoute(
            'media.download',
            now()->addMinutes(5),
            ['media' => $media->id],
        );
    }
}
