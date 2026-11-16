<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('lists and searches projects and blocks unauthorized project creation', function (): void {
    $this->getJson('/api/v1/projects?q=سرچاهی')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.last_page', 1)
        ->assertJsonFragment(['slug' => 'nisoc-surface-safety-valve-wellhead']);

    $this->postJson('/api/v1/admin/projects', [
        'title_fa' => 'Unauthorized',
    ])->assertUnauthorized();
});

it('allows authenticated super admin to create projects and submit RFQ messages', function (): void {
    config([
        'captcha.public.math' => false,
        'captcha.public.characters' => ['a'],
        'captcha.public.length' => 1,
    ]);
    $captcha = $this->getJson('/captcha/api/public')
        ->assertOk()
        ->assertJsonStructure(['key', 'img'])
        ->json();

    $rfqMessage = [
        'name' => 'مهندس رضایی',
        'email' => 'rezaei@nisoc.ir',
        'phone' => '09161234567',
        'company' => 'NISOC',
        'subject' => 'استعلام قیمت گیت ولو سرچاهی',
        'message' => 'درخواست پیش‌فاکتور ۱۰ دستگاه گیت ولو ۳ اینچ ۱۰۰۰۰ PSI',
        'type' => 'rfq',
        'website' => '',
    ];

    $this->postJson('/api/v1/contact', $rfqMessage + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'wrong',
    ])->assertUnprocessable()->assertJsonValidationErrors('captcha');

    $captcha = $this->getJson('/captcha/api/public')->assertOk()->json();
    $this->postJson('/api/v1/contact', $rfqMessage + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'a',
    ])->assertCreated();

    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->json('token');

    $this->withToken($token)->postJson('/api/v1/admin/projects', [
        'title_fa' => 'تأمین اسپول سرچاهی میدان منصوری',
        'title_en' => 'Mansouri Field Wellhead Spools',
        'category_id' => 1,
        'client_name_fa' => 'شرکت ملی مناطق نفت‌خیز جنوب',
        'client_name_en' => 'NISOC',
        'contract_number' => 'PPA-1404-99',
        'year' => 1404,
        'status' => 'in_progress',
        'summary_fa' => 'ساخت بر اساس استاندارد API 6A',
        'cover_image' => '/storage/products/christmas-tree.jpg',
        'is_featured' => true,
    ])->assertCreated();
});

it('rejects public messages that fill the honeypot field', function (): void {
    $this->postJson('/api/v1/contact', [
        'name' => 'Automated sender',
        'email' => 'bot@example.test',
        'phone' => '09120000000',
        'subject' => 'Spam submission',
        'message' => 'Automated form submission',
        'type' => 'contact',
        'website' => 'https://spam.example.test',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('website');
});
