<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function downloadDocument(?User $user, Contract $contract): bool
    {
        if (!$contract->requires_auth) {
            return true;
        }
        return $user !== null && $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->can('contracts.manage') || $user->hasRole(['super_admin', 'admin']);
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->can('contracts.manage') || $user->hasRole(['super_admin', 'admin']);
    }

    public function delete(User $user, Contract $contract): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }
}
