<?php

use App\Models\Article;
use App\Models\ArticleComment;
use Database\Seeders\DatabaseSeeder;

beforeEach(function (): void {
    $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    $this->seed(DatabaseSeeder::class);
});

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

    $replyCaptcha = $this->getJson('/captcha/api/public')->assertOk()->json();
    $this->postJson("/api/v1/articles/{$article->slug}/comments", [
        'author_name' => 'علی احمدی',
        'body' => 'از توضیحتان ممنونم، این نکته تکمیلی را هم اضافه می‌کنم.',
        'parent_id' => $comment->id,
        'website' => '',
        'captcha_key' => $replyCaptcha['key'],
        'captcha' => 'a',
    ])->assertCreated();

    $reply = ArticleComment::query()->where('parent_id', $comment->id)->firstOrFail();
    $this->getJson("/api/v1/articles/{$article->slug}/comments")
        ->assertOk()
        ->assertJsonCount(0, 'data.0.replies');

    $this->withToken($token)->putJson("/api/v1/admin/comments/{$reply->id}", [
        'status' => 'approved',
    ])->assertOk();

    $this->getJson("/api/v1/articles/{$article->slug}/comments")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.body', $commentData['body'])
        ->assertJsonPath('data.0.replies.0.id', $reply->id)
        ->assertJsonPath('data.0.replies.0.parent_id', $comment->id);
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
