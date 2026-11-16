<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('returns public bootstrap payload with active industrial crimson theme', function (): void {
    $response = $this->getJson('/api/v1/bootstrap');

    $response->assertOk()
        ->assertJsonPath('theme_settings.active_preset_slug', 'industrial-crimson')
        ->assertJsonStructure([
            'theme_presets',
            'theme_settings',
            'kpis',
            'projects',
            'contracts',
            'licenses',
            'settings',
        ]);
});

it('authenticates seeded super admin with Sanctum token and updates theme', function (): void {
    $login = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ]);

    $login->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);
    $token = $login->json('token');

    $updateTheme = $this->withToken($token)->putJson('/api/v1/admin/theme', [
        'active_preset_slug' => 'petro-navy',
        'default_mode' => 'dark',
        'active_palette' => [
            'primary' => '#0369A1',
            'secondary' => '#0F172A',
            'accent' => '#D97706',
        ],
        'landing_theme_enabled' => true,
        'landing_palette' => [
            'primary' => '#B91C1C',
            'secondary' => '#0F172A',
            'accent' => '#D97706',
        ],
    ]);

    $updateTheme->assertOk()->assertJsonPath('active_preset_slug', 'petro-navy');
});
