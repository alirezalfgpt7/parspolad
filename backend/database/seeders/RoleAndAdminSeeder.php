<?php

namespace Database\Seeders;

use App\Enums\UserRoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view',
            'theme.manage',
            'sliders.manage',
            'projects.manage',
            'contracts.manage',
            'licenses.manage',
            'menus.manage',
            'cms.manage',
            'organization.manage',
            'media.manage',
            'messages.manage',
            'users.manage',
            'settings.manage',
            'logs.view',
        ];

        foreach ($permissions as $perm) {
            Permission::query()->firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $roles = [
            UserRoleEnum::SUPER_ADMIN->value => ['label_fa' => 'سوپر ادمین', 'label_en' => 'Super Admin', 'perms' => $permissions],
            UserRoleEnum::ADMIN->value => ['label_fa' => 'مدیر سامانه', 'label_en' => 'Admin', 'perms' => $permissions],
            UserRoleEnum::EDITOR->value => ['label_fa' => 'ویرایشگر محتوا', 'label_en' => 'Content Editor', 'perms' => ['dashboard.view', 'sliders.manage', 'cms.manage', 'media.manage']],
            UserRoleEnum::PROJECT_MANAGER->value => ['label_fa' => 'مدیر پروژه', 'label_en' => 'Project Manager', 'perms' => ['dashboard.view', 'projects.manage', 'contracts.manage']],
            UserRoleEnum::CLIENT->value => ['label_fa' => 'کارفرمای سازمانی', 'label_en' => 'Client', 'perms' => ['dashboard.view']],
        ];

        foreach ($roles as $name => $meta) {
            $role = Role::query()->firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['label_fa' => $meta['label_fa'], 'label_en' => $meta['label_en']]
            );
            $role->syncPermissions($meta['perms']);
        }

        $adminEmail = env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir');
        $adminPass = env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404');

        $superAdmin = User::query()->firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'پرویز آقایی (مدیر ارشد سامانه)',
                'phone' => '09161110001',
                'password' => Hash::make($adminPass),
                'is_active' => true,
                'two_factor_enabled' => false,
            ]
        );
        $superAdmin->assignRole(UserRoleEnum::SUPER_ADMIN->value);
    }
}
