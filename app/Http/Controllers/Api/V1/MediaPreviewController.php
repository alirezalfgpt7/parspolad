<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaPreviewController extends Controller
{
    public function __invoke(
        Request $request,
        MediaFile $media,
        PrivateMediaStorageService $storage,
    ): BinaryFileResponse {
        if ($media->requires_auth) {
            abort_unless($request->hasValidSignature(), 403);
        }

        abort_unless(
            str_starts_with($media->mime_type, 'image/') || str_starts_with($media->mime_type, 'video/'),
            404,
        );
        $storage->setVisibility($media, (bool) $media->requires_auth);
        $media->refresh();
        $disk = $media->requires_auth ? 'local' : 'public';
        abort_unless(filled($media->storage_path) && Storage::disk($disk)->exists($media->storage_path), 404);

        $response = response()->file(Storage::disk($disk)->path($media->storage_path), [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => $media->requires_auth ? 'private, no-store' : 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setContentDisposition('inline', $media->name);

        return $response;
    }
}
