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
    Storage::disk('local')->put('uploads/private-image.jpg', 'private image');
    $media = MediaFile::query()->create([
        'name' => 'private-image.jpg',
        'url' => '',
        'storage_path' => 'uploads/private-image.jpg',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'size_bytes' => 13,
        'folder' => 'uploads',
        'requires_auth' => true,
    ]);
    $media->update(['url' => "/api/v1/media/{$media->id}/download"]);

    $response = $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/media?per_page=100')
        ->assertOk();
    $url = collect($response->json('data'))->firstWhere('id', $media->id)['url'];

    expect($url)->toContain('signature=');
    $this->get($url)->assertOk();
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
