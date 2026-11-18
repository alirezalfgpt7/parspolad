<?php

use App\Enums\UserRoleEnum;
use App\Models\User;
use Database\Seeders\RoleAndAdminSeeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

it('syncs roles against current permission rows when the permission cache contains old ids', function (): void {
    $this->seed(RoleAndAdminSeeder::class);

    $permissionNames = Permission::query()->orderBy('id')->pluck('name')->all();
    app(PermissionRegistrar::class)->getPermissions();

    DB::table('role_has_permissions')->delete();
    DB::table('model_has_permissions')->delete();
    DB::table('permissions')->delete();

    foreach ($permissionNames as $index => $name) {
        DB::table('permissions')->insert([
            'id' => 1000 + $index,
            'name' => $name,
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->seed(RoleAndAdminSeeder::class);

    $superAdminRole = Role::query()
        ->where('name', UserRoleEnum::SUPER_ADMIN->value)
        ->firstOrFail();
    $dashboardPermission = Permission::query()
        ->where('name', 'dashboard.view')
        ->firstOrFail();

    $this->assertDatabaseHas('role_has_permissions', [
        'role_id' => $superAdminRole->id,
        'permission_id' => $dashboardPermission->id,
    ]);
    expect(User::query()->count())->toBe(1)
        ->and($dashboardPermission->id)->toBeGreaterThan(28);
});
