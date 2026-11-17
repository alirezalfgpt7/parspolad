<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('supports user and custom role lifecycle without allowing deletion of roles in use', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $usersResponse = $this->withToken($token)->getJson('/api/v1/admin/users?per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'users')
        ->assertJsonPath('users_meta.per_page', 1)
        ->assertJsonFragment(['users_count' => 0]);
    expect($usersResponse->json('permissions'))->toContain('users.manage');
    $superAdmin = User::role('super_admin')->firstOrFail();
    $this->withToken($token)->putJson('/api/v1/admin/users/'.$superAdmin->id, [
        'role' => 'content-manager',
    ])->assertUnprocessable();
    $this->withToken($token)->postJson('/api/v1/admin/roles', [
        'name' => 'super-admin',
        'label_fa' => 'نقش اشتباه',
        'label_en' => 'Reserved Alias',
        'permissions' => [],
    ])->assertUnprocessable();

    $role = $this->withToken($token)->postJson('/api/v1/admin/roles', [
        'name' => 'quality-reviewer',
        'label_fa' => 'بازبین کیفیت',
        'label_en' => 'Quality Reviewer',
        'permissions' => ['users.view'],
    ])->assertCreated()
        ->assertJsonPath('data.name', 'quality-reviewer')
        ->json('data');

    $this->withToken($token)->putJson('/api/v1/admin/roles/'.$role['id'], [
        'label_fa' => 'بازرس کیفیت',
        'label_en' => 'Quality Inspector',
        'permissions' => ['users.view', 'pages.manage'],
    ])->assertOk()->assertJsonPath('data.label_fa', 'بازرس کیفیت');

    $user = $this->withToken($token)->postJson('/api/v1/admin/users', [
        'name' => 'Quality User',
        'email' => 'quality@example.test',
        'phone' => '09120000000',
        'password' => 'SecurePassword123',
        'role' => 'quality-reviewer',
    ])->assertCreated()->json();
    User::query()->findOrFail($user['id'])->createToken('revocation-check');

    $this->withToken($token)->deleteJson('/api/v1/admin/roles/'.$role['id'])->assertStatus(409);

    $this->withToken($token)->putJson('/api/v1/admin/users/'.$user['id'], [
        'name' => 'Updated Quality User',
        'email' => 'updated-quality@example.test',
        'phone' => '09121111111',
        'password' => 'AnotherSecurePassword123',
    ])->assertOk()
        ->assertJsonPath('data.name', 'Updated Quality User')
        ->assertJsonPath('data.email', 'updated-quality@example.test');

    $this->withToken($token)->putJson('/api/v1/admin/users/'.$user['id'], [
        'role' => 'content-manager',
    ])->assertOk();
    $this->withToken($token)->deleteJson('/api/v1/admin/users/'.$user['id'])->assertOk();
    expect(User::withTrashed()->find($user['id'])->deleted_at)->not->toBeNull();
    expect(DB::table('personal_access_tokens')->where('tokenable_id', $user['id'])->exists())->toBeFalse();

    $this->withToken($token)->deleteJson('/api/v1/admin/roles/'.$role['id'])->assertOk();
    expect(DB::table('roles')->where('id', $role['id'])->exists())->toBeFalse();
});
