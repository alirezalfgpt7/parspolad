<?php

use App\Models\Contract;
use App\Models\MediaFile;
use App\Models\Product;
use App\Models\User;
use App\Services\PrivateMediaStorageService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

it('blocks direct access to private media and allows its temporary signed download', function (): void {
    Storage::fake('local');
    Storage::disk('local')->put('documents/private.pdf', 'private document');
    $media = MediaFile::query()->create([
        'name' => 'private.pdf',
        'url' => '/api/v1/media/1/download',
        'storage_path' => 'documents/private.pdf',
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'size_bytes' => 16,
        'folder' => 'documents',
        'requires_auth' => true,
    ]);

    $this->getJson('/api/v1/media/'.$media->id.'/download')->assertForbidden();

    $signedUrl = URL::temporarySignedRoute('media.download', now()->addMinute(), ['media' => $media->id]);
    $this->get($signedUrl)->assertOk()->assertHeader('Content-Type', 'application/pdf');
});

it('provides administrators a signed original URL for private media previews', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('local');
    $image = imagecreatetruecolor(32, 32);
    ob_start();
    imagejpeg($image);
    $contents = ob_get_clean();
    imagedestroy($image);
    Storage::disk('local')->put('uploads/private-image.jpg', $contents);
    $media = MediaFile::query()->create([
        'name' => 'private-image.jpg',
        'url' => '',
        'storage_path' => 'uploads/private-image.jpg',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
        'requires_auth' => true,
    ]);
    $media->update(['url' => "/api/v1/media/{$media->id}/download"]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?per_page=100')
        ->assertOk();
    $item = collect($response->json('data'))->firstWhere('id', $media->id);
    $url = $item['url'];
    $previewUrl = $item['preview_url'];
    $thumbnailUrl = $item['thumbnail_url'];

    expect($url)->toContain('signature=')
        ->and($previewUrl)->toContain('signature=')
        ->and($thumbnailUrl)->toContain('signature=');
    $this->get($url)->assertOk();
    $this->get($previewUrl)
        ->assertOk()
        ->assertHeader('Content-Disposition', 'inline; filename=private-image.jpg');
    $this->get($thumbnailUrl)
        ->assertOk()
        ->assertHeader('Content-Type', 'image/webp')
        ->assertHeader('Cache-Control', 'max-age=3600, private');
});

it('serves the unchanged original GIF inline for full-size previews', function (): void {
    Storage::fake('public');
    $contents = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    Storage::disk('public')->put('uploads/animation.gif', $contents);
    $media = MediaFile::query()->create([
        'name' => 'animation.gif',
        'url' => '/storage/uploads/animation.gif',
        'storage_path' => 'uploads/animation.gif',
        'mime_type' => 'image/gif',
        'extension' => 'gif',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $response = $this->get(route('media.preview', ['media' => $media->id], false))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/gif')
        ->assertHeader('Content-Disposition', 'inline; filename=animation.gif');

    expect($response->baseResponse->getFile()->getPathname())
        ->toBe(Storage::disk('public')->path('uploads/animation.gif'))
        ->and(file_get_contents($response->baseResponse->getFile()->getPathname()))
        ->toBe($contents);
});

it('supports byte-range requests for in-browser video previews', function (): void {
    Storage::fake('public');
    $contents = '0123456789';
    Storage::disk('public')->put('uploads/range-preview.mp4', $contents);
    $media = MediaFile::query()->create([
        'name' => 'range-preview.mp4',
        'url' => '/storage/uploads/range-preview.mp4',
        'storage_path' => 'uploads/range-preview.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => strlen($contents),
        'folder' => 'uploads',
    ]);

    $this->get(route('media.preview', ['media' => $media->id], false), ['Range' => 'bytes=2-5'])
        ->assertStatus(206)
        ->assertHeader('Content-Range', 'bytes 2-5/10')
        ->assertHeader('Accept-Ranges', 'bytes');
});

it('moves marked media out of the public disk before returning its protected URL', function (): void {
    Storage::fake('public');
    Storage::fake('local');
    Storage::disk('public')->put('documents/controlled.pdf', 'protected content');
    $media = MediaFile::query()->create([
        'name' => 'controlled.pdf',
        'url' => '/storage/documents/controlled.pdf',
        'storage_path' => 'documents/controlled.pdf',
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'size_bytes' => 17,
        'folder' => 'documents',
        'requires_auth' => false,
    ]);

    $url = app(PrivateMediaStorageService::class)->protectUrl($media->url, true);

    expect($url)->toBe('/api/v1/media/'.$media->id.'/download')
        ->and($media->fresh()->requires_auth)->toBeTrue();
    Storage::disk('public')->assertMissing('documents/controlled.pdf');
    Storage::disk('local')->assertExists('documents/controlled.pdf');
    $this->getJson($url)->assertForbidden();
});

it('migrates legacy protected media that still resides on the public disk', function (): void {
    Storage::fake('public');
    Storage::fake('local');
    Storage::disk('public')->put('documents/legacy-private.pdf', 'protected content');
    $media = MediaFile::query()->create([
        'name' => 'legacy-private.pdf',
        'url' => '/storage/documents/legacy-private.pdf',
        'storage_path' => 'documents/legacy-private.pdf',
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'size_bytes' => 17,
        'folder' => 'documents',
        'requires_auth' => true,
    ]);

    $url = app(PrivateMediaStorageService::class)->protectUrl($media->url, true);

    expect($url)->toBe('/api/v1/media/'.$media->id.'/download');
    Storage::disk('public')->assertMissing('documents/legacy-private.pdf');
    Storage::disk('local')->assertExists('documents/legacy-private.pdf');
});

it('refuses private-media migration when the same file has a public reference', function (): void {
    Storage::fake('public');
    Storage::fake('local');
    Storage::disk('public')->put('documents/shared.pdf', 'shared content');
    Contract::query()->create([
        'contract_number' => 'PRIVATE-1',
        'title_fa' => 'قرارداد خصوصی',
        'title_en' => 'Private contract',
        'client_fa' => 'مشتری',
        'client_en' => 'Client',
        'start_year' => 1404,
        'document_url' => '/storage/documents/shared.pdf',
        'requires_auth' => true,
    ]);
    Product::query()->create([
        'slug' => 'public-catalog',
        'name_fa' => 'محصول',
        'name_en' => 'Product',
        'category_fa' => 'دسته',
        'category_en' => 'Category',
        'model_code' => 'PUBLIC-1',
        'standard' => 'API',
        'summary_fa' => 'توضیح',
        'image_url' => '/images/product.png',
        'catalog_url' => '/storage/documents/shared.pdf',
    ]);

    $this->artisan('media:protect-private')
        ->expectsOutputToContain('also referenced publicly')
        ->expectsOutputToContain('no files were changed')
        ->assertExitCode(1);

    Storage::disk('public')->assertExists('documents/shared.pdf');
    Storage::disk('local')->assertMissing('documents/shared.pdf');
});
