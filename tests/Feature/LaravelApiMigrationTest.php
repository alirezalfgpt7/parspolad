<?php

use App\Models\Kpi;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('opens the frontend instead of exposing the API status on the root URL', function (): void {
    config(['app.frontend_url' => 'http://localhost:3000']);

    $this->get('/')
        ->assertRedirect('http://localhost:3000');
});

it('provides the legacy frontend bootstrap fields from Laravel data', function (): void {
    $this->getJson('/api/v1/bootstrap')
        ->assertOk()
        ->assertJsonStructure([
            'theme',
            'presets',
            'menus',
            'sliders',
            'categories',
            'company',
            'map',
            'seo',
            'site',
            'is_authenticated',
        ]);

    $this->getJson('/api/v1/products')->assertOk()->assertJsonCount(6, 'data');
    $this->getJson('/api/v1/articles')->assertOk()->assertJsonCount(3, 'data');
});

it('supports protected admin content endpoints and public account registration', function (): void {
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');

    $this->withToken($token)
        ->getJson('/api/v1/admin/pages')
        ->assertOk()
        ->assertJsonCount(4, 'data');
    $this->withToken($token)->getJson('/api/v1/admin/contracts')->assertOk()->assertJsonCount(5, 'data');
    $this->withToken($token)->getJson('/api/v1/admin/licenses')->assertOk()->assertJsonCount(8, 'data');
    $this->withToken($token)->getJson('/api/v1/admin/settings')
        ->assertOk()
        ->assertJsonPath('data.company.name_fa', 'شرکت پارس پولاد آقایی');
    $this->withToken($token)->getJson('/api/v1/admin/users')
        ->assertOk()
        ->assertJsonPath('users.0.role', 'super-admin');

    $kpi = Kpi::query()->firstOrFail();
    $this->withToken($token)
        ->putJson('/api/v1/admin/kpis/'.$kpi->id, ['value' => 999])
        ->assertOk()
        ->assertJsonPath('data.value', 999);

    config([
        'captcha.public.math' => false,
        'captcha.public.characters' => ['a'],
        'captcha.public.length' => 1,
    ]);
    $captcha = $this->getJson('/captcha/api/public')
        ->assertOk()
        ->assertJsonStructure(['key', 'img'])
        ->json();

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Registered Client',
        'email' => 'registered-client@example.test',
        'password' => 'StrongPassword123!',
        'captcha_key' => $captcha['key'],
        'captcha' => 'a',
    ])->assertCreated()
        ->assertJsonPath('user.role', 'user');
});

it('denies administrator endpoints to users without the required permissions', function (): void {
    $user = User::query()->create([
        'name' => 'Regular client',
        'email' => 'regular-client@example.test',
        'password' => 'StrongPassword123!',
        'is_active' => true,
    ]);
    $user->assignRole('client');
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/admin/users')->assertForbidden();
    $this->withToken($token)->getJson('/api/v1/admin/settings')->assertForbidden();
});
