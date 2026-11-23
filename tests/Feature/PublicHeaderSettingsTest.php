<?php

use App\Models\Article;
use App\Models\MediaFile;
use App\Models\Setting;
use Database\Seeders\DatabaseSeeder;

beforeEach(function (): void {
    $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    $this->seed(DatabaseSeeder::class);
});

it('saves custom social links and publishes them in the public bootstrap', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $socialLinks = [
        [
            'id' => 1001,
            'name' => 'اینستاگرام',
            'url' => 'https://social.example.test/company',
            'icon' => 'Instagram',
            'is_active' => true,
        ],
        [
            'id' => 1002,
            'name' => 'واتساپ',
            'url' => 'https://wa.me/989121234567',
            'icon' => 'WhatsApp',
            'is_active' => true,
        ],
        [
            'id' => 1003,
            'name' => 'لینکدین',
            'url' => 'https://linkedin.example.test/company',
            'icon' => 'Linkedin',
            'is_active' => true,
        ],
    ];

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'site' => [
            'info_bar_enabled' => true,
            'info_bar_phone' => '06112345678',
            'info_bar_phone_enabled' => true,
            'info_bar_phone_icon' => 'Phone',
            'social_links' => $socialLinks,
        ],
    ])->assertOk();

    $this->withToken($token)->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonPath('data.site.social_links.0.name', 'اینستاگرام')
        ->assertJsonPath('data.site.social_links.0.icon', 'Instagram')
        ->assertJsonPath('data.site.social_links.0.is_active', true);

    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
        ->assertJsonPath('site.social_links.0.url', 'https://social.example.test/company')
        ->assertJsonPath('site.social_links.1.icon', 'WhatsApp')
        ->assertJsonPath('site.social_links.2.url', 'https://linkedin.example.test/company')
        ->assertJsonPath('site.info_bar_phone_enabled', true)
        ->assertJsonPath('site.info_bar_phone_icon', 'Phone');

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'site' => [
            'social_links' => [[
                'id' => 1002,
                'name' => 'Invalid link',
                'url' => 'javascript:alert(1)',
                'icon' => 'Globe',
                'is_active' => true,
            ]],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('site.social_links.0.url');
});

it('publishes the selected animated sidebar logo in bootstrap settings', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'company' => ['logo_small_url' => '/storage/videos/logo-3d.mp4'],
        'logos' => [
            'navbar' => '/storage/videos/logo-3d.mp4',
            'admin_sidebar' => '/storage/videos/logo-3d.mp4',
        ],
    ])->assertOk();

    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertJsonPath('logos.admin_sidebar', '/storage/videos/logo-3d.mp4')
        ->assertJsonPath('company.logo_small_url', '/storage/videos/logo-3d.mp4');
});

it('persists and publishes separate responsive preloader settings', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $preloader = [
        'initial' => [
            'enabled' => true,
            'display_mode' => 'full',
            'background_color' => '#020617',
            'text_fa' => 'در حال بارگذاری',
            'logo_url' => '/storage/media/animated-logo.mp4',
            'show_logo_frame' => false,
            'logo_size_mobile' => 48,
            'logo_size_tablet' => 64,
            'logo_size_desktop' => 80,
        ],
        'internal' => [
            'enabled' => false,
            'display_mode' => 'background_only',
            'background_color' => 'transparent',
            'transparent_background' => true,
            'remove_logo_background' => true,
            'text_fa' => '',
            'logo_size_mobile' => 40,
            'logo_size_tablet' => 48,
            'logo_size_desktop' => 56,
        ],
    ];

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'preloader' => $preloader,
    ])->assertOk();

    $this->withToken($token)->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonPath('data.preloader.initial.logo_url', '/storage/media/animated-logo.mp4')
        ->assertJsonPath('data.preloader.initial.show_logo_frame', false)
        ->assertJsonPath('data.preloader.internal.enabled', false);

    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertJsonPath('preloader.initial.text_fa', 'در حال بارگذاری')
        ->assertJsonPath('preloader.initial.logo_size_desktop', 80)
        ->assertJsonPath('preloader.internal.display_mode', 'background_only')
        ->assertJsonPath('preloader.internal.transparent_background', true)
        ->assertJsonPath('preloader.internal.remove_logo_background', true)
        ->assertJsonPath('preloader.internal.enabled', false);

    $this->withToken($token)->putJson('/api/v1/admin/settings', [
        'preloader' => [
            'initial' => ['logo_size_mobile' => 256],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('preloader.initial.logo_size_mobile');
});

it('resolves saved public preloader media paths to usable preview URLs', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $source = MediaFile::query()->create([
        'name' => 'animated-logo.mp4',
        'url' => '/storage/uploads/animated-logo.mp4',
        'storage_path' => 'uploads/animated-logo.mp4',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 100,
        'folder' => 'uploads',
        'requires_auth' => false,
    ]);
    $optimized = MediaFile::query()->create([
        'name' => 'animated-logo-720.mp4',
        'url' => '/storage/optimized/animated-logo.mp4',
        'storage_path' => 'optimized/animated-logo.mp4',
        'source_media_id' => $source->id,
        'variant' => 'video_720',
        'mime_type' => 'video/mp4',
        'extension' => 'mp4',
        'size_bytes' => 120,
        'folder' => 'optimized',
        'requires_auth' => false,
    ]);
    Setting::query()->updateOrCreate(
        ['key' => 'initial'],
        [
            'group' => 'preloader',
            'value' => json_encode(['logo_url' => $source->url], JSON_THROW_ON_ERROR),
        ],
    );

    $expectedPreview = "/api/v1/media/{$optimized->id}/preview#video";
    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertJsonPath('preloader.initial.logo_url', $expectedPreview);

    $this->withToken($token)->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonPath('data.preloader.initial.logo_url', $expectedPreview);
});

it('only accepts replies to approved top-level comments on the same article', function (): void {
    config([
        'captcha.public.math' => false,
        'captcha.public.characters' => ['a'],
        'captcha.public.length' => 1,
    ]);

    $article = Article::query()->firstOrFail();
    $otherArticle = $article->replicate();
    $otherArticle->slug = $article->slug.'-other';
    $otherArticle->save();
    $foreignParent = $otherArticle->comments()->create([
        'author_name' => 'نویسنده',
        'body' => 'دیدگاه تاییدشده برای مقاله دیگر است.',
        'status' => 'approved',
    ]);
    $captcha = $this->getJson('/captcha/api/public')->assertOk()->json();

    $this->postJson("/api/v1/articles/{$article->slug}/comments", [
        'author_name' => 'پاسخ‌دهنده',
        'body' => 'این پاسخ نباید به مقاله دیگری متصل شود.',
        'parent_id' => $foreignParent->id,
        'website' => '',
        'captcha_key' => $captcha['key'],
        'captcha' => 'a',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('parent_id');
});

it('persists configurable icons for top-level menu items', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $menus = $this->withToken($token)->getJson('/api/v1/admin/menus')
        ->assertOk()
        ->json('data');
    $menu = collect($menus)->firstWhere('key', 'header');
    $items = $menu['items'];
    $items[0]['icon'] = 'Home';

    $this->withToken($token)->putJson("/api/v1/admin/menus/{$menu['id']}", [
        'items' => $items,
    ])->assertOk()
        ->assertJsonPath('data.items.0.icon', 'Home');
});
