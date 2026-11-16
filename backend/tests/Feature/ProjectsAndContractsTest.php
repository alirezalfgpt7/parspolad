<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('lists and searches projects and blocks unauthorized project creation', function (): void {
    $this->getJson('/api/v1/projects?q=سرچاهی')
        ->assertOk()
        ->assertJsonCount(1);

    $this->postJson('/api/v1/admin/projects', [
        'title_fa' => 'Unauthorized',
    ])->assertUnauthorized();
});

it('allows authenticated super admin to create projects and submit RFQ messages', function (): void {
    $this->postJson('/api/v1/contact', [
        'name' => 'مهندس رضایی',
        'email' => 'rezaei@nisoc.ir',
        'phone' => '09161234567',
        'company' => 'NISOC',
        'subject' => 'استعلام قیمت گیت ولو سرچاهی',
        'message' => 'درخواست پیش‌فاکتور ۱۰ دستگاه گیت ولو ۳ اینچ ۱۰۰۰۰ PSI',
        'type' => 'rfq',
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
