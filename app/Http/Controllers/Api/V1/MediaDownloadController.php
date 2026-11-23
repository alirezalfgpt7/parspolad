<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaDownloadController extends Controller
{
    public function __invoke(
        Request $request,
        MediaFile $media,
        PrivateMediaStorageService $storage,
    ): StreamedResponse {
        if ($media->requires_auth) {
            abort_unless($request->hasValidSignature(), 403);
            $storage->setVisibility($media, true);
            $media->refresh();
        }

        abort_unless(filled($media->storage_path), 404);
        $disk = $media->requires_auth ? 'local' : 'public';
        abort_unless(Storage::disk($disk)->exists($media->storage_path), 404);

        return Storage::disk($disk)->download($media->storage_path, $media->name, [
            'Content-Type' => $media->mime_type,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
