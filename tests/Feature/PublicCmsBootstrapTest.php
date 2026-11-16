<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('provides editable public page intros and footer settings through bootstrap', function (): void {
    $response = $this->getJson('/api/v1/bootstrap')->assertOk();

    foreach (['home', 'services', 'products', 'projects', 'contracts-licenses', 'org-chart', 'contact', 'rfq', 'news', 'sitemap'] as $slug) {
        $response->assertJsonFragment(['slug' => $slug]);
    }

    $response->assertJsonPath('site.header_cta_url', '/rfq')
        ->assertJsonPath('company.standards_en', 'API 6A / 6FA / ISO 29001 standards');

    $this->getJson('/api/v1/faqs')
        ->assertOk()
        ->assertJsonPath('data.0.question_en', 'Are Pars Poolad Aghaee wellhead and downhole products certified to international standards?');
});
