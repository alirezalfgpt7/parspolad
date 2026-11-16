<?php

namespace App\Policies;

use App\Models\User;

class ThemeSettingPolicy
{
    public function update(User $user): bool
    {
        return $user->can('theme.manage') || $user->hasRole(['super_admin', 'admin']);
    }
}
