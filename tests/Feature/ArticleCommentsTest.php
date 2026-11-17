<?php

use App\Models\Article;
use App\Models\ArticleComment;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('keeps new comments private until an authorized editor approves them', function (): void {
    config([
        'captcha.public.math' => false,
        'captcha.public.characters' => ['a'],
        'captcha.public.length' => 1,
    ]);

    $article = Article::query()->firstOrFail();
    $commentData = [
        'author_name' => 'مریم رضایی',
        'body' => 'نکته فنی مفیدی است. <script>alert(1)</script>',
        'website' => '',
    ];
    $captcha = $this->getJson('/captcha/api/public')->assertOk()->json();

    $this->postJson("/api/v1/articles/{$article->slug}/comments", $commentData + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'wrong',
    ])->assertUnprocessable()->assertJsonValidationErrors('captcha');

    $captcha = $this->getJson('/captcha/api/public')->assertOk()->json();
    $this->postJson("/api/v1/articles/{$article->slug}/comments", $commentData + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'a',
    ])->assertCreated()
        ->assertJsonPath('message', 'نظر شما پس از بررسی مدیر منتشر خواهد شد.');

    $comment = ArticleComment::query()->firstOrFail();
    $this->getJson("/api/v1/articles/{$article->slug}/comments")
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)->putJson("/api/v1/admin/comments/{$comment->id}", [
        'status' => 'approved',
    ])->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->getJson("/api/v1/articles/{$article->slug}/comments")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.body', $commentData['body']);
});

it('rejects article comments that fill the honeypot field', function (): void {
    $article = Article::query()->firstOrFail();

    $this->postJson("/api/v1/articles/{$article->slug}/comments", [
        'author_name' => 'Automated sender',
        'body' => 'Automated comment submission',
        'website' => 'https://spam.example.test',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('website');
});
