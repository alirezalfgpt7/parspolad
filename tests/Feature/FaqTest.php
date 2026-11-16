<?php

use App\Models\Faq;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('serves active seeded FAQs from editable database content', function (): void {
    Faq::query()->create([
        'question_fa' => 'پرسش غیرفعال',
        'answer_fa' => 'این مورد نباید عمومی باشد.',
        'sort_order' => 0,
        'is_active' => false,
    ]);

    $this->getJson('/api/v1/faqs')
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('data.0.question_fa', 'آیا تجهیزات سرچاهی و درون‌چاهی پارس پولاد آقایی دارای تاییدیه‌های استاندارد بین‌المللی هستند؟');
});

it('allows authorized administrators to manage FAQs with soft deletion', function (): void {
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');

    $created = $this->withToken($token)->postJson('/api/v1/admin/faqs', [
        'question_fa' => 'پرسش تازه',
        'answer_fa' => 'پاسخ تازه',
        'sort_order' => 5,
        'is_active' => true,
    ])->assertCreated()->json('data');

    $this->withToken($token)->putJson('/api/v1/admin/faqs/'.$created['id'], [
        'answer_fa' => 'پاسخ ویرایش‌شده',
    ])->assertOk()->assertJsonPath('data.answer_fa', 'پاسخ ویرایش‌شده');

    $this->withToken($token)->deleteJson('/api/v1/admin/faqs/'.$created['id'])->assertOk();
    expect(DB::table('faqs')->where('id', $created['id'])->value('deleted_at'))->not->toBeNull();
});
