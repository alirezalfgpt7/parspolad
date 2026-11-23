<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Services\MediaContentValidator;
use App\Services\MediaOptimizationService;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaOptimizationController extends Controller
{
    public function capabilities(Request $request, MediaOptimizationService $optimizer): JsonResponse
    {
        abort_unless($request->user()?->can('media.manage'), 403);

        return response()->json(['data' => $optimizer->capabilities()]);
    }

    public function optimize(
        Request $request,
        MediaFile $media,
        MediaOptimizationService $optimizer,
        PrivateMediaStorageService $storage,
    ): JsonResponse {
        abort_unless($request->user()?->can('media.manage'), 403);
        $data = $request->validate(['force' => ['sometimes', 'boolean']]);
        $check = $optimizer->optimizationCheck($media, $storage);
        if ($check['requires_confirmation'] && ! ($data['force'] ?? false)) {
            return response()->json([
                'code' => 'optimization_confirmation_required',
                'message' => $check['reason'],
            ], 409);
        }

        return response()->json([
            'data' => [
                'source' => $media,
                'variants' => $optimizer->optimize($media, $storage),
            ],
        ]);
    }

    public function optimizationCheck(
        Request $request,
        MediaFile $media,
        MediaOptimizationService $optimizer,
        PrivateMediaStorageService $storage,
    ): JsonResponse {
        abort_unless($request->user()?->can('media.manage'), 403);

        return response()->json(['data' => $optimizer->optimizationCheck($media, $storage)]);
    }

    public function optimizerSource(
        Request $request,
        MediaFile $media,
        PrivateMediaStorageService $storage,
    ): StreamedResponse {
        abort_unless($request->user()?->can('media.manage'), 403);
        abort_unless($media->source_media_id === null, 422, 'فقط فایل اصلی قابل دریافت برای پردازش است.');
        abort_unless(in_array($media->mime_type, ['video/mp4', 'video/webm'], true), 422, 'این رسانه ویدئو نیست.');

        $storage->setVisibility($media, (bool) $media->requires_auth);
        $media->refresh();
        abort_if($media->size_bytes > 25 * 1024 * 1024, 413, 'حجم فایل برای پردازش مرورگری بیش از ۲۵ مگابایت است.');
        $disk = $media->requires_auth ? 'local' : 'public';

        return Storage::disk($disk)->download($media->storage_path, $media->name, [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function thumbnail(
        Request $request,
        MediaFile $media,
        MediaOptimizationService $optimizer,
        PrivateMediaStorageService $storage,
    ): Response {
        abort_unless($request->user()?->can('media.manage'), 403);

        return response($optimizer->thumbnail($media, $storage), 200, [
            'Content-Type' => str_starts_with($media->mime_type, 'video/') || $media->variant === 'poster'
                ? 'image/jpeg'
                : 'image/webp',
            'Cache-Control' => 'private, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function uploadBrowserVariant(
        Request $request,
        MediaFile $media,
        MediaContentValidator $contentValidator,
        MediaOptimizationService $optimizer,
    ): JsonResponse {
        abort_unless($request->user()?->can('media.manage'), 403);
        $data = $request->validate([
            'variant' => ['required', 'string', Rule::in(['video_720', 'poster'])],
            'file' => ['required', 'file', 'max:25600'],
        ]);

        $file = $request->file('file');
        $contents = $file->get();
        abort_unless(is_string($contents), 422, 'خواندن نسخهٔ تولیدشده ناموفق بود.');
        $extension = $data['variant'] === 'poster' ? 'jpg' : 'mp4';
        $mimeType = $contentValidator->validate($data['variant'].'.'.$extension, $contents);
        $variant = $optimizer->storeBrowserVideoVariant($media, $data['variant'], $contents, $mimeType);

        return response()->json(['data' => $variant]);
    }
}
