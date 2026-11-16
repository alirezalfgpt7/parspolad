<?php

use App\Models\Setting;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('allows bootstrap but blocks public API endpoints while maintenance is enabled', function (): void {
    Setting::query()->updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['group' => 'site', 'value' => '1'],
    );

    $this->getJson('/api/v1/bootstrap')->assertOk();
    $this->getJson('/api/v1/projects')
        ->assertStatus(503)
        ->assertHeader('Retry-After', '300');
});
