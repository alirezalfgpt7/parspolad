<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->hasRole(['super_admin', 'admin']) || $actor->can('users.manage');
    }

    public function manage(User $actor, User $target): bool
    {
        if ($target->hasRole('super_admin') && !$actor->hasRole('super_admin')) {
            return false;
        }
        return $actor->hasRole(['super_admin', 'admin']);
    }
}
