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
            'analytics.view',
            'theme.manage',
            'themes.manage',
            'slider.manage',
            'sliders.manage',
            'projects.manage',
            'projects.view',
            'contracts.manage',
            'contracts.view',
            'licenses.manage',
            'licenses.view',
            'menus.manage',
            'cms.manage',
            'pages.manage',
            'organization.manage',
            'media.manage',
            'messages.manage',
            'messages.view',
            'comments.manage',
            'users.manage',
            'users.view',
            'settings.manage',
            'reports.export',
            'documents.download_authorized',
            'profile.manage',
            'notifications.view',
            'logs.view',
        ];

        foreach ($permissions as $perm) {
            Permission::query()->firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        $roles = [
            UserRoleEnum::SUPER_ADMIN->value => ['label_fa' => 'سوپر ادمین', 'label_en' => 'Super Admin', 'perms' => $permissions],
            UserRoleEnum::ADMIN->value => ['label_fa' => 'مدیر سامانه', 'label_en' => 'Admin', 'perms' => $permissions],
            UserRoleEnum::EDITOR->value => ['label_fa' => 'ویرایشگر محتوا', 'label_en' => 'Content Editor', 'perms' => ['dashboard.view', 'slider.manage', 'sliders.manage', 'cms.manage', 'pages.manage', 'media.manage', 'messages.view', 'comments.manage']],
            UserRoleEnum::PROJECT_MANAGER->value => ['label_fa' => 'اپراتور فنی', 'label_en' => 'Technical Operator', 'perms' => ['dashboard.view', 'projects.view', 'projects.manage', 'contracts.view', 'contracts.manage', 'licenses.view', 'messages.manage']],
            UserRoleEnum::CLIENT->value => ['label_fa' => 'کاربر ثبت‌نام‌شده', 'label_en' => 'Registered User', 'perms' => ['dashboard.view', 'documents.download_authorized', 'profile.manage', 'notifications.view']],
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
