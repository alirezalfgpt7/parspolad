<?php

use App\Models\Article;
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
