<?php

use App\Models\Service;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('provides fillable-field metadata and CRUD for generic CMS resources', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    expect(DB::table('articles')->whereNull('article_category_id')->exists())->toBeFalse();

    $this->withToken($token)->getJson('/api/v1/admin/content-resources')
        ->assertOk()
        ->assertJsonFragment([
            'key' => 'services',
            'label_fa' => 'خدمات',
            'label_en' => 'Services',
        ]);

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/services')
        ->assertOk()
        ->assertJsonPath('data.resource', 'services')
        ->assertJsonPath('data.fields.0.name', 'slug')
        ->assertJsonPath('data.fields.0.label_fa', 'شناسهٔ یکتا')
        ->assertJsonPath('data.fields.0.label_en', 'Slug');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/notification-templates')
        ->assertOk()
        ->assertJsonPath('data.fields.2.type', 'select')
        ->assertJsonPath('data.fields.2.options.0.label_fa', 'ایمیل')
        ->assertJsonPath('data.fields.2.options.0.label_en', 'Email');

    $this->withToken($token)->getJson('/api/v1/admin/content-resources')
        ->assertOk()
        ->assertJsonPath('data.0.description_fa', 'دسته‌بندی پروژه‌ها و مشخصات دوزبانهٔ آن‌ها.')
        ->assertJsonPath('data.0.usage_fa', 'در فهرست و فیلتر پروژه‌های سایت استفاده می‌شود.')
        ->assertJsonPath('data.11.related_admin_path', '/admin/login-appearance');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/articles')
        ->assertOk()
        ->assertJsonPath('data.fields.5.name', 'content_fa')
        ->assertJsonPath('data.fields.5.type', 'richtext')
        ->assertJsonPath('data.fields.7.name', 'article_category_id')
        ->assertJsonPath('data.fields.7.type', 'select')
        ->assertJsonPath('data.fields.10.type', 'jalali-date');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/banners')
        ->assertOk()
        ->assertJsonPath('data.fields.8.type', 'select')
        ->assertJsonPath('data.fields.8.options.0.value', 'landing_mid')
        ->assertJsonPath('data.fields.8.options.1.value', 'projects_top')
        ->assertJsonPath('data.fields.8.options.2.value', 'services_bottom');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/products')
        ->assertOk()
        ->assertJsonFragment(['name' => 'specs_en', 'type' => 'json']);

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/kpis')
        ->assertOk()
        ->assertJsonFragment(['name' => 'icon', 'type' => 'string'])
        ->assertJsonFragment(['name' => 'background_color', 'type' => 'color']);

    $category = $this->withToken($token)->postJson('/api/v1/admin/article-categories', [
        'slug' => 'technical-news',
        'name_fa' => 'فنی',
        'name_en' => 'Technical',
    ])->assertCreated()->json('data');

    $this->withToken($token)->getJson('/api/v1/admin/content-schema/articles')
        ->assertOk()
        ->assertJsonFragment([
            'value' => (string) $category['id'],
            'label_fa' => 'فنی',
            'label_en' => 'Technical',
        ]);

    $article = $this->withToken($token)->postJson('/api/v1/admin/articles', [
        'slug' => 'categorized-news',
        'title_fa' => 'خبر دسته‌بندی‌شده',
        'title_en' => 'Categorized news',
        'excerpt_fa' => 'چکیده خبر',
        'content_fa' => '<p>متن خبر</p>',
        'article_category_id' => $category['id'],
        'cover_image' => '/storage/articles/cover.jpg',
        'author_fa' => 'نویسنده',
        'published_at' => '1404/08/01',
    ])->assertCreated()->json('data');
    expect($article['category_fa'])->toBe('فنی')
        ->and($article['category_en'])->toBe('Technical');

    $created = $this->withToken($token)->postJson('/api/v1/admin/services', [
        'slug' => 'dynamic-service',
        'title_fa' => 'خدمت پویا',
        'title_en' => 'Dynamic Service',
        'summary_fa' => 'شرح خدمت پویا',
        'image_url' => '/storage/services/dynamic.jpg',
    ])->assertCreated()->json('data');

    $this->withToken($token)->getJson('/api/v1/admin/services?search=Dynamic%20Service&sort_by=title_en&sort_order=asc&per_page=1')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('data.0.title_en', 'Dynamic Service');

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
