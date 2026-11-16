<?php

use App\Models\Article;
use App\Models\ContactMessage;
use App\Models\Project;
use App\Models\ProjectCategory;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('soft deletes public content and projects while hiding them from normal queries', function (): void {
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');

    $article = Article::query()->firstOrFail();
    $this->withToken($token)->deleteJson("/api/v1/admin/articles/{$article->id}")
        ->assertOk();
    $this->assertSoftDeleted('articles', ['id' => $article->id]);
    $this->getJson("/api/v1/articles/{$article->slug}")->assertNotFound();

    $project = Project::query()->firstOrFail();
    $this->withToken($token)->deleteJson("/api/v1/admin/projects/{$project->id}")
        ->assertOk();
    $this->assertSoftDeleted('projects', ['id' => $project->id]);
    $this->getJson("/api/v1/projects/{$project->slug}")->assertNotFound();
});

it('protects categories that still have active projects', function (): void {
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');
    $category = ProjectCategory::query()->whereHas('projects')->firstOrFail();

    $this->withToken($token)->deleteJson("/api/v1/admin/categories/{$category->id}")
        ->assertConflict();
});

it('keeps soft-deleted seeded content hidden and avoids duplicate unique slugs', function (): void {
    $article = Article::query()->firstOrFail();
    $count = Article::withTrashed()->count();
    $article->delete();

    $this->seed(DatabaseSeeder::class);

    $this->assertSoftDeleted('articles', ['id' => $article->id]);
    expect(Article::withTrashed()->count())->toBe($count);
});

it('soft deletes contact messages from the administration API', function (): void {
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');
    $message = ContactMessage::query()->create([
        'name' => 'آزمایش',
        'email' => 'message@example.com',
        'phone' => '09120000000',
        'subject' => 'درخواست نمونه',
        'message' => 'متن پیام',
        'status' => 'new',
    ]);

    $this->withToken($token)->deleteJson("/api/v1/admin/messages/{$message->id}")->assertOk();

    $this->assertSoftDeleted('contact_messages', ['id' => $message->id]);
    $this->withToken($token)->getJson('/api/v1/admin/messages')
        ->assertOk()
        ->assertJsonMissing(['id' => $message->id]);
});
