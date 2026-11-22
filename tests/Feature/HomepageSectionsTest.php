<?php

use App\Models\Article;
use App\Models\Page;
use App\Models\Project;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('returns only configured homepage records in the chosen order and count', function (): void {
    $firstProject = Project::factory()->create(['title_fa' => 'پروژهٔ انتخابی اول']);
    $secondProject = Project::factory()->create(['title_fa' => 'پروژهٔ انتخابی دوم']);
    Article::query()->update(['published_at' => '2100-01-01']);
    $olderArticle = Article::factory()->create(['published_at' => '1900-01-01']);
    Article::factory()->create(['published_at' => '2100-01-01']);

    $page = Page::query()->where('slug', 'home-spotlight')->firstOrFail();
    $page->metadata = [
        ...($page->metadata ?? []),
        'home_sections' => [
            'projects' => [
                'mode' => 'selected',
                'limit' => 1,
                'selected_items' => [
                    ['id' => $secondProject->id, 'label' => $secondProject->title_fa],
                    ['id' => $firstProject->id, 'label' => $firstProject->title_fa],
                ],
            ],
            'articles' => ['mode' => 'oldest', 'limit' => 1],
            'services' => ['mode' => 'ordered', 'limit' => 0],
        ],
    ];
    $page->save();

    $this->getJson('/api/v1/homepage-sections')
        ->assertOk()
        ->assertJsonCount(1, 'data.projects')
        ->assertJsonPath('data.projects.0.id', $secondProject->id)
        ->assertJsonCount(1, 'data.articles')
        ->assertJsonPath('data.articles.0.id', $olderArticle->id)
        ->assertJsonCount(0, 'data.services');
});
