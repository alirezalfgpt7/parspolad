<?php

use App\Models\MediaFile;
use App\Models\MenuItem;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Storage;

function createPublicAlbumImage(string $name, string $path): MediaFile
{
    Storage::disk('public')->put($path, 'test image content');

    return MediaFile::query()->create([
        'name' => $name,
        'url' => '/storage/'.$path,
        'storage_path' => $path,
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 19,
        'folder' => 'albums',
        'requires_auth' => false,
    ]);
}

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
    Storage::fake('public');
    Storage::fake('local');
});

it('creates public albums with selected original photos and serves generated thumbnails', function (): void {
    $admin = User::role('super_admin')->firstOrFail();
    $image = createPublicAlbumImage('field.png', 'albums/field.png');
    Storage::disk('public')->put('albums/field-thumb.webp', 'thumbnail');
    MediaFile::query()->create([
        'name' => 'field-thumb.webp',
        'url' => '/storage/albums/field-thumb.webp',
        'storage_path' => 'albums/field-thumb.webp',
        'source_media_id' => $image->id,
        'variant' => 'thumbnail',
        'mime_type' => 'image/webp',
        'extension' => 'webp',
        'size_bytes' => 9,
        'folder' => 'albums',
        'requires_auth' => false,
    ]);

    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/albums', [
        'title_fa' => 'عملیات میدانی',
        'title_en' => 'Field Operations',
        'slug' => 'field-operations',
        'description_fa' => 'تصاویر عملیات',
        'description_en' => 'Field operation photos',
        'cover_media_id' => $image->id,
        'layout' => 'slider',
        'columns' => 3,
        'rows' => 2,
        'transition' => 'fade',
        'interval_ms' => 5000,
        'image_effect' => 'zoom',
        'card_effect' => 'lift',
        'sort_order' => 0,
        'is_active' => true,
        'media_ids' => [$image->id],
    ]);
    $response->assertCreated()->assertJsonPath('data.layout', 'slider');

    $this->getJson('/api/v1/albums')
        ->assertOk()
        ->assertJsonPath('data.0.slug', 'field-operations')
        ->assertJsonPath('data.0.media_count', 1);
    $this->getJson('/api/v1/albums/field-operations')
        ->assertOk()
        ->assertJsonPath('data.media.0.id', $image->id)
        ->assertJsonPath('data.media.0.thumbnail_url', '/albums/field-operations/media/'.$image->id.'/thumbnail');
    $this->get('/api/v1/albums/field-operations/media/'.$image->id.'/thumbnail')
        ->assertOk()
        ->assertHeader('Content-Type', 'image/webp')
        ->assertContent('thumbnail');
    $this->get('/api/v1/albums/field-operations/media/'.$image->id.'/original')
        ->assertOk()
        ->assertHeader('Content-Type', 'image/png')
        ->assertStreamedContent('test image content');
    $notInAlbum = createPublicAlbumImage('not-in-album.png', 'albums/not-in-album.png');
    $this->get('/api/v1/albums/field-operations/media/'.$notInAlbum->id.'/original')->assertNotFound();
    $this->getJson('/api/v1/sitemap')
        ->assertOk()
        ->assertJsonFragment(['path' => '/albums/field-operations']);

    expect(MenuItem::query()->where('url', '/albums')->exists())->toBeTrue();

    $this->actingAs($admin, 'sanctum')
        ->deleteJson('/api/v1/admin/albums/'.$response->json('data.id'))
        ->assertOk();
    Storage::disk('public')->assertExists('albums/field.png');
    Storage::disk('public')->assertExists('albums/field-thumb.webp');
});

it('generates and reuses a public thumbnail for a selected image without a saved variant', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    $image = imagecreatetruecolor(640, 480);
    ob_start();
    imagepng($image);
    $contents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('public')->put('albums/unoptimized.png', $contents);
    $media = MediaFile::query()->create([
        'name' => 'unoptimized.png',
        'url' => '/storage/albums/unoptimized.png',
        'storage_path' => 'legacy/stale-path.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => strlen($contents),
        'folder' => 'albums',
        'requires_auth' => false,
    ]);

    $thumbnailUrl = '/api/v1/albums/image-without-thumbnail/media/'.$media->id.'/thumbnail';
    $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/albums', [
        'title_fa' => 'تصویر بدون بندانگشتی',
        'title_en' => 'Image without thumbnail',
        'slug' => 'image-without-thumbnail',
        'layout' => 'grid',
        'columns' => 3,
        'rows' => 2,
        'transition' => 'fade',
        'interval_ms' => 5000,
        'image_effect' => 'zoom',
        'card_effect' => 'lift',
        'sort_order' => 0,
        'is_active' => true,
        'media_ids' => [$media->id],
    ])
        ->assertCreated()
        ->assertJsonPath('data.media.0.thumbnail_url', '/albums/image-without-thumbnail/media/'.$media->id.'/thumbnail');

    $firstResponse = $this->get($thumbnailUrl)->assertOk()->assertHeader('Content-Type', 'image/webp');
    expect($media->fresh()->storage_path)->toBe('albums/unoptimized.png');
    $thumbnail = MediaFile::query()->where('source_media_id', $media->id)->where('variant', 'thumbnail')->firstOrFail();
    Storage::disk('public')->assertExists($thumbnail->storage_path);
    $this->get($thumbnailUrl)->assertOk()->assertContent($firstResponse->getContent());
});

it('rejects private, derived and unavailable photos when saving an album', function (): void {
    $admin = User::role('super_admin')->firstOrFail();
    Storage::disk('local')->put('albums/private.png', 'private image');
    $private = MediaFile::query()->create([
        'name' => 'private.png',
        'url' => '/api/v1/media/1/download',
        'storage_path' => 'albums/private.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 13,
        'folder' => 'albums',
        'requires_auth' => true,
    ]);

    $payload = [
        'title_fa' => 'آلبوم تصاویر',
        'title_en' => 'Photo Album',
        'slug' => 'photo-album',
        'layout' => 'grid',
        'columns' => 3,
        'rows' => 2,
        'transition' => 'fade',
        'interval_ms' => 5000,
        'image_effect' => 'zoom',
        'card_effect' => 'lift',
        'sort_order' => 0,
        'is_active' => true,
    ];
    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/albums', $payload + ['media_ids' => [$private->id]])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'فقط تصاویر اصلی و عمومی کتابخانه قابل افزودن به آلبوم هستند.');

    $missing = MediaFile::query()->create([
        'name' => 'missing.png',
        'url' => '/storage/albums/missing.png',
        'storage_path' => 'albums/missing.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 20,
        'folder' => 'albums',
        'requires_auth' => false,
    ]);
    $this->postJson('/api/v1/admin/albums', $payload + ['media_ids' => [$missing->id]])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'فایل تصویر «missing.png» در فضای عمومی ذخیره‌سازی در دسترس نیست.');
});

it('filters album picker results to original public images and reports file availability', function (): void {
    $admin = User::role('super_admin')->firstOrFail();
    $public = createPublicAlbumImage('public.png', 'albums/public.png');
    $private = MediaFile::query()->create([
        'name' => 'private.png',
        'url' => '/api/v1/media/2/download',
        'storage_path' => 'albums/private.png',
        'mime_type' => 'image/png',
        'extension' => 'png',
        'size_bytes' => 10,
        'folder' => 'albums',
        'requires_auth' => true,
    ]);
    MediaFile::query()->create([
        'name' => 'variant.webp',
        'url' => '/storage/albums/variant.webp',
        'storage_path' => 'albums/variant.webp',
        'source_media_id' => $public->id,
        'variant' => 'thumbnail',
        'mime_type' => 'image/webp',
        'extension' => 'webp',
        'size_bytes' => 8,
        'folder' => 'albums',
    ]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?type=images&source_only=1&public_only=1')
        ->assertOk();

    $rows = collect($response->json('data'));
    expect($rows->pluck('id')->all())
        ->toContain($public->id)
        ->not->toContain($private->id)
        ->and($rows->every(fn (array $row): bool => $row['source_media_id'] === null && $row['requires_auth'] === false))
        ->toBeTrue()
        ->and($rows->firstWhere('id', $public->id)['source_available'])
        ->toBeTrue();
});
