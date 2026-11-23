<?php

use App\Models\MediaFile;
use App\Models\User;
use App\Services\MediaOptimizationService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

it('creates reusable WebP variants without changing the source image', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');

    $image = imagecreatetruecolor(640, 480);
    ob_start();
    imagepng($image);
    $sourceContents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('public')->put('uploads/source.png', $sourceContents);
    $media = MediaFile::query()->create([
        'name' => 'source.png',
        'url' => '/storage/uploads/source.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => strlen($sourceContents),
        'folder' => 'uploads',
    ]);

    $firstResponse = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/media/{$media->id}/optimize", ['force' => true]);
    $firstResponse->assertOk()
        ->assertJsonCount(3, 'data.variants')
        ->assertJsonPath('data.variants.0.extension', 'webp');

    $firstVariants = $firstResponse->json('data.variants');
    expect($firstVariants)->toHaveCount(3)
        ->and(MediaFile::query()->where('source_media_id', $media->id)->count())->toBe(3)
        ->and($media->fresh()->storage_path)->toBe('uploads/source.png')
        ->and(Storage::disk('public')->get('uploads/source.png'))->toBe($sourceContents);
    $optimizableResponse = $this->getJson('/api/v1/admin/media?optimizable=1')->assertOk();
    $optimizableRows = collect($optimizableResponse->json('data'));
    expect($optimizableRows->contains('id', $media->id))->toBeTrue()
        ->and($optimizableRows->firstWhere('id', $media->id)['source_available'])->toBeTrue()
        ->and($optimizableRows->every(fn (array $row): bool => $row['source_media_id'] === null))->toBeTrue();

    $secondResponse = $this->postJson("/api/v1/admin/media/{$media->id}/optimize", ['force' => true])
        ->assertOk()
        ->assertJsonCount(3, 'data.variants');
    $secondVariants = $secondResponse->json('data.variants');

    expect(array_column($secondVariants, 'id'))->toBe(array_column($firstVariants, 'id'))
        ->and(MediaFile::query()->where('source_media_id', $media->id)->count())->toBe(3);

    $thumbnail = MediaFile::query()->where('source_media_id', $media->id)->where('variant', 'thumbnail')->firstOrFail();
    $thumbnailDimensions = getimagesizefromstring(Storage::disk('public')->get($thumbnail->storage_path));
    $this->get(route('media.thumbnail', ['media' => $media->id], false))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/webp')
        ->assertHeader('Cache-Control', 'max-age=3600, public');
    expect($thumbnail->mime_type)->toBe('image/webp')
        ->and($thumbnailDimensions[0])->toBeLessThanOrEqual(320);
});

it('reports when FFmpeg is unavailable without disabling image optimization', function (): void {
    config(['media.ffmpeg_binary' => 'ppa-test-missing-ffmpeg-binary']);

    $capabilities = app(MediaOptimizationService::class)->capabilities();

    expect($capabilities['videos']['available'])->toBeFalse()
        ->and($capabilities['images']['available'])->toBeTrue();
});

it('keeps generated files private when the original requires authentication', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');

    $image = imagecreatetruecolor(64, 64);
    ob_start();
    imagepng($image);
    $sourceContents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('local')->put('uploads/private.png', $sourceContents);
    $media = MediaFile::query()->create([
        'name' => 'private.png',
        'url' => '',
        'storage_path' => 'uploads/private.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => strlen($sourceContents),
        'folder' => 'uploads',
        'requires_auth' => true,
    ]);
    $media->update(['url' => "/api/v1/media/{$media->id}/download"]);

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson("/api/v1/admin/media/{$media->id}/optimize", ['force' => true])
        ->assertOk();

    foreach ($response->json('data.variants') as $variant) {
        expect($variant['requires_auth'])->toBeTrue();
        Storage::disk('local')->assertExists($variant['storage_path']);
        Storage::disk('public')->assertMissing($variant['storage_path']);
    }
});

it('stores a browser-generated poster as a reusable variant of the source video', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');
    $source = MediaFile::query()->create([
        'name' => 'source.mp4',
        'url' => '/storage/uploads/source.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 128,
        'folder' => 'uploads',
    ]);

    $poster = imagecreatetruecolor(32, 32);
    ob_start();
    imagejpeg($poster);
    $posterContents = ob_get_clean();
    imagedestroy($poster);

    $response = $this->actingAs($admin, 'sanctum')
        ->post("/api/v1/admin/media/{$source->id}/optimizer-variant", [
            'variant' => 'poster',
            'file' => UploadedFile::fake()->createWithContent('poster.jpg', $posterContents),
        ])
        ->assertOk()
        ->assertJsonPath('data.variant', 'poster')
        ->assertJsonPath('data.mime_type', 'image/jpeg');

    $posterMedia = MediaFile::query()->findOrFail($response->json('data.id'));
    expect($posterMedia->source_media_id)->toBe($source->id)
        ->and($posterMedia->requires_auth)->toBeFalse();
    Storage::disk('public')->assertExists($posterMedia->storage_path);
});

it('explains when a video poster cannot be generated without FFmpeg or a browser-generated poster', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    config(['media.ffmpeg_binary' => 'ppa-test-missing-ffmpeg-binary']);

    $contents = "\x00\x00\x00\x18ftypisom";
    Storage::disk('public')->put('uploads/no-poster.mp4', $contents);
    $media = MediaFile::query()->create([
        'name' => 'no-poster.mp4',
        'url' => '/storage/uploads/no-poster.mp4',
        'storage_path' => 'uploads/no-poster.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/media/{$media->id}/thumbnail")
        ->assertStatus(503)
        ->assertJsonPath(
            'message',
            'برای ساخت پیش‌نمایش این ویدئو، فایل اصلی در مرورگر پشتیبانی نشد و FFmpeg نیز روی سرور در دسترس نیست.',
        );
});

it('serves a video to the authenticated media manager for local browser conversion', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    $contents = "\x00\x00\x00\x18ftypisom";
    Storage::disk('public')->put('uploads/source.mp4', $contents);
    $media = MediaFile::query()->create([
        'name' => 'source.mp4',
        'url' => '/storage/uploads/source.mp4',
        'storage_path' => 'uploads/source.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->get("/api/v1/admin/media/{$media->id}/optimizer-source")
        ->assertOk()
        ->assertHeader('Cache-Control', 'no-store, private');

    expect($response->streamedContent())->toBe($contents);
    expect($media->fresh()->storage_path)->toBe('uploads/source.mp4');
});

it('asks before processing a small source or replacing complete optimized variants', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');

    $image = imagecreatetruecolor(64, 64);
    ob_start();
    imagepng($image);
    $contents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('public')->put('uploads/small.png', $contents);
    $media = MediaFile::query()->create([
        'name' => 'small.png',
        'url' => '/storage/uploads/small.png',
        'storage_path' => 'uploads/small.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/media/{$media->id}/optimization-check")
        ->assertOk()
        ->assertJsonPath('data.requires_confirmation', true)
        ->assertJsonPath('data.reason', 'حجم فایل از ابتدا کم است و ممکن است بهینه‌سازی کاهش چشمگیری ایجاد نکند.');
});

it('creates and serves a small reusable thumbnail instead of the original image', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');

    $image = imagecreatetruecolor(640, 480);
    ob_start();
    imagepng($image);
    $contents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('public')->put('uploads/thumbnail-source.png', $contents);
    $media = MediaFile::query()->create([
        'name' => 'thumbnail-source.png',
        'url' => '/storage/uploads/thumbnail-source.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->get("/api/v1/admin/media/{$media->id}/thumbnail")
        ->assertOk()
        ->assertHeader('Content-Type', 'image/webp');
    $thumbnail = MediaFile::query()
        ->where('source_media_id', $media->id)
        ->where('variant', 'thumbnail')
        ->firstOrFail();
    $dimensions = getimagesizefromstring($response->getContent());

    expect($thumbnail->mime_type)->toBe('image/webp')
        ->and($dimensions[0])->toBeLessThanOrEqual(320)
        ->and($media->fresh()->storage_path)->toBe('uploads/thumbnail-source.png');
});

it('recovers legacy originals stored directly below the public storage directory', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');

    $root = public_path('storage');
    $createdRoot = ! is_dir($root);
    if ($createdRoot) {
        mkdir($root, 0755, true);
    }

    $relativePath = 'legacy-preview-'.Str::uuid().'/source.png';
    $absolutePath = $root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
    $directory = dirname($absolutePath);
    mkdir($directory, 0755, true);

    $image = imagecreatetruecolor(640, 480);
    ob_start();
    imagepng($image);
    $contents = ob_get_clean();
    imagedestroy($image);
    file_put_contents($absolutePath, $contents);

    try {
        $media = MediaFile::query()->create([
            'name' => 'source.png',
            'url' => '/storage/'.$relativePath,
            'storage_path' => 'legacy/stale-path.png',
            'mime_type' => 'image/png',
            'extension' => 'png',
            'size_bytes' => strlen($contents),
            'folder' => 'legacy',
        ]);

        $mediaResponse = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/media?optimizable=1')
            ->assertOk();
        expect(collect($mediaResponse->json('data'))->firstWhere('id', $media->id)['source_available'])->toBeTrue();
        $this->actingAs($admin, 'sanctum')
            ->get("/api/v1/admin/media/{$media->id}/thumbnail")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp');

        expect($media->fresh()->storage_path)->toBe($relativePath);
        Storage::disk('public')->assertExists($relativePath);
    } finally {
        if (is_file($absolutePath)) {
            unlink($absolutePath);
        }
        if (is_dir($directory)) {
            rmdir($directory);
        }
        if ($createdRoot && is_dir($root)) {
            rmdir($root);
        }
    }
});

it('returns actionable JSON when a legacy media record points to a missing file', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    $media = MediaFile::query()->create([
        'name' => 'missing.mp4',
        'url' => '/storage/uploads/missing.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 128,
        'folder' => 'uploads',
    ]);

    $this->actingAs($admin, 'sanctum')
        ->getJson("/api/v1/admin/media/{$media->id}/optimization-check")
        ->assertNotFound()
        ->assertJsonPath('message', 'فایل اصلی در فضای ذخیره‌سازی پیدا نشد؛ آن را بازیابی یا دوباره بارگذاری کنید.');
    $listedMedia = collect($this->getJson('/api/v1/admin/media?optimizable=1')->json('data'))
        ->firstWhere('id', $media->id);

    expect($listedMedia['source_available'])->toBeFalse();
});

it('filters and sorts the paginated media library by category and file size', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    $smallVideo = MediaFile::query()->create([
        'name' => 'small.mp4',
        'url' => '/storage/uploads/small.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 100,
        'folder' => 'uploads',
    ]);
    $largeVideo = MediaFile::query()->create([
        'name' => 'large.mp4',
        'url' => '/storage/uploads/large.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 1000000000,
        'folder' => 'uploads',
    ]);
    MediaFile::query()->create([
        'name' => 'image.png',
        'url' => '/storage/uploads/image.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 500,
        'folder' => 'uploads',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?type=videos&sort=largest&per_page=1')
        ->assertOk()
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('data.0.id', $largeVideo->id);

    expect($response->json('meta.total'))->toBeGreaterThanOrEqual(2)
        ->and($response->json('data'))->toHaveCount(1)
        ->and($smallVideo->id)->not->toBe($largeVideo->id);
});

it('lists only original media and links optimized video previews to their source variants', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    $source = MediaFile::query()->create([
        'name' => 'source.mp4',
        'url' => '/storage/uploads/source.mp4',
        'storage_path' => 'uploads/source.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 4096,
        'folder' => 'uploads',
    ]);
    $poster = MediaFile::query()->create([
        'name' => 'source - poster',
        'url' => '/storage/optimized/1/poster.jpg',
        'storage_path' => 'optimized/1/poster.jpg',
        'source_media_id' => $source->id,
        'variant' => 'poster',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'size_bytes' => 512,
        'folder' => 'optimized/1',
    ]);
    $optimizedVideo = MediaFile::query()->create([
        'name' => 'source - video_720',
        'url' => '/storage/optimized/1/video.mp4',
        'storage_path' => 'optimized/1/video.mp4',
        'source_media_id' => $source->id,
        'variant' => 'video_720',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 2048,
        'folder' => 'optimized/1',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?per_page=100')
        ->assertOk();
    $listedMedia = collect($response->json('data'));
    $listedSource = $listedMedia->firstWhere('id', $source->id);

    expect($listedMedia->pluck('id'))->toContain($source->id)
        ->and($listedMedia->pluck('id'))->not->toContain($poster->id)
        ->and($listedMedia->pluck('id'))->not->toContain($optimizedVideo->id)
        ->and($listedSource['preview_url'])->toBe('/api/v1/media/'.$source->id.'/preview')
        ->and($listedSource['thumbnail_url'])->toBe('/api/v1/media/'.$source->id.'/thumbnail')
        ->and(collect($listedSource['derived_files'])->pluck('id'))
        ->toContain($poster->id)
        ->toContain($optimizedVideo->id)
        ->and(collect($listedSource['derived_files'])->firstWhere('id', $optimizedVideo->id)['preview_url'])
        ->toBe('/api/v1/media/'.$optimizedVideo->id.'/preview')
        ->and($listedSource['optimized_preview_url'])->toBe('/api/v1/media/'.$optimizedVideo->id.'/preview');
});

it('provides a dedicated GIF filter without exposing generated variants as files', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    $gif = MediaFile::query()->create([
        'name' => 'animated.gif',
        'url' => '/storage/uploads/animated.gif',
        'mime_type' => 'image/gif',
        'extension' => 'gif',
        'size_bytes' => 1024,
        'folder' => 'uploads',
    ]);
    $png = MediaFile::query()->create([
        'name' => 'still.png',
        'url' => '/storage/uploads/still.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 1024,
        'folder' => 'uploads',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?type=gifs&per_page=100')
        ->assertOk();

    expect(collect($response->json('data'))->pluck('id'))
        ->toContain($gif->id)
        ->not->toContain($png->id);
});
