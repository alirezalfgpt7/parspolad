<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('persists public logo, social, contact bar, and SEO settings', function (): void {
    $login = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this));
    $login->assertOk();

    $this->withToken($login->json('token'))
        ->putJson('/api/v1/admin/settings', [
            'company' => [
                'logo_url' => '/storage/logos/custom-main.png',
                'logo_small_url' => '/storage/logos/custom-mark.png',
                'instagram_url' => 'https://instagram.com/parspoolad',
                'telegram_url' => 'https://t.me/parspoolad',
            ],
            'seo' => [
                'site_title' => 'عنوان فارسی آزمون',
                'site_title_en' => 'Test English title',
                'meta_description' => 'توضیحات فارسی آزمون',
                'meta_description_en' => 'Test English description',
                'keywords' => 'کلمه، آزمون',
                'keywords_en' => 'test, keyword',
                'meta_image' => '/storage/seo/share.png',
                'robots' => 'noindex,follow',
            ],
            'site' => [
                'info_bar_enabled' => false,
                'info_bar_phone' => '09360000000',
            ],
        ])
        ->assertOk();

    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertJsonPath('company.logo_url', '/storage/logos/custom-main.png')
        ->assertJsonPath('company.logo_small_url', '/storage/logos/custom-mark.png')
        ->assertJsonPath('company.instagram_url', 'https://instagram.com/parspoolad')
        ->assertJsonPath('company.telegram_url', 'https://t.me/parspoolad')
        ->assertJsonPath('seo.site_title_en', 'Test English title')
        ->assertJsonPath('seo.meta_description_en', 'Test English description')
        ->assertJsonPath('seo.meta_image', '/storage/seo/share.png')
        ->assertJsonPath('seo.robots', 'noindex,follow')
        ->assertJsonPath('site.info_bar_enabled', false)
        ->assertJsonPath('site.info_bar_phone', '09360000000');
});
