<?php

namespace App\Policies;

use App\Models\License;
use App\Models\User;

class LicensePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function download(?User $user, License $license): bool
    {
        return !$license->requires_auth || ($user !== null && $user->is_active);
    }

    public function manage(User $user): bool
    {
        return $user->can('licenses.manage') || $user->hasRole(['super_admin', 'admin']);
    }
}
