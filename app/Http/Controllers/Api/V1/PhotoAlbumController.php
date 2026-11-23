<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MediaFile;
use App\Models\PhotoAlbum;
use App\Services\MediaOptimizationService;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PhotoAlbumController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $albums = PhotoAlbum::query()
            ->where('is_active', true)
            ->with([
                'cover.variants' => fn ($query) => $query
                    ->whereIn('variant', ['thumbnail', 'content', 'hero'])
                    ->where('requires_auth', false),
            ])
            ->withCount([
                'media' => fn ($query) => $query
                    ->where('requires_auth', false)
                    ->whereNull('source_media_id'),
            ])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->paginate(min(max($request->integer('per_page', 12), 1), 24));

        return response()->json([
            'data' => $albums->getCollection()->map(fn (PhotoAlbum $album): array => [
                'id' => $album->id,
                'title_fa' => $album->title_fa,
                'title_en' => $album->title_en,
                'slug' => $album->slug,
                'description_fa' => $album->description_fa,
                'description_en' => $album->description_en,
                'cover_url' => $album->cover?->requires_auth ? null : $album->cover?->url,
                'cover_thumbnail_url' => $album->cover?->requires_auth
                    ? null
                    : ($album->cover ? $this->thumbnailUrl($album, $album->cover) : null),
                'media_count' => $album->media_count,
                'updated_at' => $album->updated_at,
            ])->values(),
            'meta' => [
                'current_page' => $albums->currentPage(),
                'last_page' => $albums->lastPage(),
                'per_page' => $albums->perPage(),
                'total' => $albums->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $album = PhotoAlbum::query()
            ->where('is_active', true)
            ->where('slug', $slug)
            ->with([
                'media' => fn ($query) => $query
                    ->where('requires_auth', false)
                    ->whereNull('source_media_id')
                    ->with(['variants' => fn ($variants) => $variants
                        ->whereIn('variant', ['thumbnail', 'content', 'hero'])
                        ->where('requires_auth', false)]),
            ])
            ->firstOrFail();

        return response()->json(['data' => $this->albumData($album, true)]);
    }

    public function thumbnail(
        string $slug,
        MediaFile $media,
        MediaOptimizationService $optimizer,
        PrivateMediaStorageService $storage,
    ): Response {
        $isAlbumImage = PhotoAlbum::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('media', fn ($query) => $query
                ->whereKey($media->id)
                ->where('requires_auth', false)
                ->whereNull('source_media_id'))
            ->exists();
        abort_unless(
            $isAlbumImage
                && $media->source_media_id === null
                && in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true),
            404,
        );

        return response($optimizer->thumbnail($media, $storage), 200, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function original(
        string $slug,
        MediaFile $media,
        PrivateMediaStorageService $storage,
    ): StreamedResponse {
        $isAlbumImage = PhotoAlbum::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->whereHas('media', fn ($query) => $query
                ->whereKey($media->id)
                ->where('requires_auth', false)
                ->whereNull('source_media_id'))
            ->exists();
        abort_unless(
            $isAlbumImage
                && in_array($media->mime_type, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], true),
            404,
        );

        $storage->setVisibility($media, false);

        return Storage::disk('public')->response($media->storage_path, $media->name, [
            'Content-Type' => $media->mime_type,
            'Cache-Control' => 'public, max-age=3600',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->ensurePermission($request);
        $albums = PhotoAlbum::query()
            ->with('cover')
            ->withCount('media')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(min(max($request->integer('per_page', 20), 1), 50));

        return response()->json([
            'data' => $albums->getCollection()->map(fn (PhotoAlbum $album): array => [
                ...$this->albumData($album),
                'media_count' => $album->media_count,
                'cover_url' => $album->cover?->url,
            ])->values(),
            'meta' => [
                'current_page' => $albums->currentPage(),
                'last_page' => $albums->lastPage(),
                'per_page' => $albums->perPage(),
                'total' => $albums->total(),
            ],
        ]);
    }

    public function adminShow(Request $request, PhotoAlbum $album): JsonResponse
    {
        $this->ensurePermission($request);

        return response()->json(['data' => $this->albumData($album->load(['cover', 'media']))]);
    }

    public function store(Request $request, PrivateMediaStorageService $storage): JsonResponse
    {
        $this->ensurePermission($request);
        $data = $this->validatedData($request);
        $media = $this->resolvePublicImages($data['media_ids'], $storage);
        $this->ensureCoverIsSelected($data, $media);

        $album = DB::transaction(function () use ($data): PhotoAlbum {
            $album = PhotoAlbum::query()->create($this->albumAttributes($data));
            $album->media()->sync($this->mediaOrder($data['media_ids']));

            return $album;
        });

        return response()->json(['data' => $this->albumData($album->load(['cover', 'media']))], 201);
    }

    public function update(Request $request, PhotoAlbum $album, PrivateMediaStorageService $storage): JsonResponse
    {
        $this->ensurePermission($request);
        $data = $this->validatedData($request, $album);
        $media = $this->resolvePublicImages($data['media_ids'], $storage);
        $this->ensureCoverIsSelected($data, $media);

        DB::transaction(function () use ($album, $data): void {
            $album->update($this->albumAttributes($data));
            $album->media()->sync($this->mediaOrder($data['media_ids']));
        });

        return response()->json(['data' => $this->albumData($album->fresh()->load(['cover', 'media']))]);
    }

    public function destroy(Request $request, PhotoAlbum $album): JsonResponse
    {
        $this->ensurePermission($request);
        $album->delete();

        return response()->json(['ok' => true]);
    }

    private function validatedData(Request $request, ?PhotoAlbum $album = null): array
    {
        return $request->validate([
            'title_fa' => ['required', 'string', 'max:160'],
            'title_en' => ['required', 'string', 'max:160'],
            'slug' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('photo_albums', 'slug')->ignore($album?->id),
            ],
            'description_fa' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'cover_media_id' => ['nullable', 'integer'],
            'layout' => ['required', Rule::in(['grid', 'masonry', 'mosaic', 'slider'])],
            'columns' => ['required', 'integer', 'between:2,8'],
            'rows' => ['required', 'integer', 'between:1,10'],
            'transition' => ['required', Rule::in(['fade', 'slide', 'zoom'])],
            'interval_ms' => ['required', 'integer', 'between:2500,15000'],
            'image_effect' => ['required', Rule::in(['none', 'zoom', 'pan'])],
            'card_effect' => ['required', Rule::in(['none', 'lift', 'glow'])],
            'sort_order' => ['required', 'integer', 'between:0,100000'],
            'is_active' => ['required', 'boolean'],
            'media_ids' => ['required', 'array', 'min:1', 'max:60'],
            'media_ids.*' => ['required', 'integer', 'distinct'],
        ]);
    }

    private function resolvePublicImages(array $mediaIds, PrivateMediaStorageService $storage)
    {
        $media = MediaFile::query()
            ->whereIn('id', $mediaIds)
            ->whereNull('source_media_id')
            ->where('requires_auth', false)
            ->whereIn('mime_type', ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
            ->get()
            ->keyBy('id');

        abort_if($media->count() !== count($mediaIds), 422, 'فقط تصاویر اصلی و عمومی کتابخانه قابل افزودن به آلبوم هستند.');
        foreach ($media as $file) {
            abort_unless(
                $storage->isAvailableOnPublicDisk($file),
                422,
                "فایل تصویر «{$file->name}» در فضای عمومی ذخیره‌سازی در دسترس نیست.",
            );
        }

        return $media;
    }

    private function ensureCoverIsSelected(array $data, $media): void
    {
        if (isset($data['cover_media_id'])) {
            abort_unless($media->has((int) $data['cover_media_id']), 422, 'تصویر کاور باید از تصاویر انتخاب‌شدهٔ همین آلبوم باشد.');
        }
    }

    private function albumAttributes(array $data): array
    {
        $attributes = collect($data)->except('media_ids')->all();
        $attributes['cover_media_id'] ??= (int) $data['media_ids'][0];

        return $attributes;
    }

    private function mediaOrder(array $mediaIds): array
    {
        $ordered = [];
        foreach (array_values($mediaIds) as $index => $mediaId) {
            $ordered[$mediaId] = ['sort_order' => $index];
        }

        return $ordered;
    }

    private function albumData(PhotoAlbum $album, bool $public = false): array
    {
        return [
            'id' => $album->id,
            'title_fa' => $album->title_fa,
            'title_en' => $album->title_en,
            'slug' => $album->slug,
            'description_fa' => $album->description_fa,
            'description_en' => $album->description_en,
            'cover_media_id' => $album->cover_media_id,
            'layout' => $album->layout,
            'columns' => $album->columns,
            'rows' => $album->rows,
            'transition' => $album->transition,
            'interval_ms' => $album->interval_ms,
            'image_effect' => $album->image_effect,
            'card_effect' => $album->card_effect,
            'sort_order' => $album->sort_order,
            'is_active' => $album->is_active,
            'media' => $album->relationLoaded('media')
                ? $album->media->map(fn (MediaFile $file): array => [
                    'id' => $file->id,
                    'name' => $file->name,
                    'url' => $public ? $this->originalUrl($album, $file) : $file->url,
                    'thumbnail_url' => $this->thumbnailUrl($album, $file),
                    'hero_url' => $public ? null : ($file->relationLoaded('variants')
                        ? $file->variants->firstWhere('variant', 'hero')?->url
                        : null),
                    'content_url' => $public ? null : ($file->relationLoaded('variants')
                        ? $file->variants->firstWhere('variant', 'content')?->url
                        : null),
                    'alt_text' => $file->alt_text,
                    'description' => $file->description,
                ])->values()
                : [],
        ];
    }

    private function thumbnailUrl(PhotoAlbum $album, MediaFile $media): string
    {
        return '/albums/'.$album->slug.'/media/'.$media->id.'/thumbnail';
    }

    private function originalUrl(PhotoAlbum $album, MediaFile $media): string
    {
        return '/albums/'.$album->slug.'/media/'.$media->id.'/original';
    }

    private function ensurePermission(Request $request): void
    {
        abort_unless($request->user()?->can('media.manage'), 403);
    }
}
