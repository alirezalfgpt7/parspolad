<?php

use App\Models\Service;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('provides fillable-field metadata and CRUD for generic CMS resources', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/services')
        ->assertOk()
        ->assertJsonPath('data.resource', 'services')
        ->assertJsonPath('data.fields.0.name', 'slug');

    $created = $this->withToken($token)->postJson('/api/v1/admin/services', [
        'slug' => 'dynamic-service',
        'title_fa' => 'خدمت پویا',
        'title_en' => 'Dynamic Service',
        'summary_fa' => 'شرح خدمت پویا',
        'image_url' => '/storage/services/dynamic.jpg',
    ])->assertCreated()->json('data');

    $this->withToken($token)->putJson('/api/v1/admin/services/'.$created['id'], [
        'title_fa' => 'خدمت ویرایش‌شده',
    ])->assertOk()->assertJsonPath('data.title_fa', 'خدمت ویرایش‌شده');

    $this->withToken($token)->deleteJson('/api/v1/admin/services/'.$created['id'])->assertOk();
    expect(DB::table('services')->where('id', $created['id'])->value('deleted_at'))->not->toBeNull();
    expect(Service::query()->whereKey($created['id'])->exists())->toBeFalse();
});

it('supports editable JSON metadata on public CMS pages', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/pages')
        ->assertOk()
        ->assertJsonPath('data.fields.9.name', 'metadata')
        ->assertJsonPath('data.fields.9.type', 'json');

    $created = $this->withToken($token)->postJson('/api/v1/admin/pages', [
        'slug' => 'editable-landing-page',
        'title_fa' => 'صفحه پویا',
        'title_en' => 'Dynamic Page',
        'content_fa' => '<p>محتوای قابل ویرایش</p>',
        'metadata' => ['image_url' => '/images/example.jpg'],
    ])->assertCreated()->json('data');

    $this->getJson('/api/v1/pages/editable-landing-page')
        ->assertOk()
        ->assertJsonPath('data.metadata.image_url', '/images/example.jpg');
});
