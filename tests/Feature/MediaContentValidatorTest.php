<?php

use App\Services\MediaContentValidator;
use App\Models\MediaFile;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('accepts a PDF whose detected content matches its extension', function (): void {
    $pdf = "%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF";

    expect(app(MediaContentValidator::class)->validate('document.pdf', $pdf))
        ->toBe('application/pdf');
});

it('rejects file content that does not match the declared extension', function (): void {
    expect(fn () => app(MediaContentValidator::class)->validate('photo.jpg', '<script>alert(1)</script>'))
        ->toThrow(HttpException::class);
});

it('rejects SVG uploads rather than serving active content', function (): void {
    expect(fn () => app(MediaContentValidator::class)->validate('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'))
        ->toThrow(HttpException::class);
});

it('rejects a spoofed media upload before it is stored', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');
    $mediaCount = MediaFile::query()->count();

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/media/upload', [
            'filename' => 'photo.jpg',
            'content_base64' => base64_encode('<script>alert(1)</script>'),
        ])
        ->assertUnprocessable();

    expect(MediaFile::query()->count())->toBe($mediaCount);
});

it('stores a valid PDF upload with its detected MIME type', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    Storage::fake('public');
    Storage::fake('local');
    $pdf = "%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF";

    $response = $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/media/upload', [
            'filename' => 'document.pdf',
            'content_base64' => base64_encode($pdf),
        ])
        ->assertCreated()
        ->assertJsonPath('data.mime_type', 'application/pdf');

    Storage::disk('public')->assertExists($response->json('data.storage_path'));
});
