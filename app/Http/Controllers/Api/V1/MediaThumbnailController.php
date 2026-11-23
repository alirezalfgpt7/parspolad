<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\MediaOptimizationService;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MediaThumbnailController extends Controller
{
    public function __invoke(
        Request $request,
        MediaFile $media,
        MediaOptimizationService $optimizer,
        PrivateMediaStorageService $storage,
    ): Response {
        if ($media->requires_auth) {
            abort_unless($request->hasValidSignature(), 403);
        }

        return response($optimizer->thumbnail($media, $storage), 200, [
            'Content-Type' => str_starts_with($media->mime_type, 'video/') || $media->variant === 'poster'
                ? 'image/jpeg'
                : 'image/webp',
            'Cache-Control' => $media->requires_auth ? 'private, max-age=3600' : 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
