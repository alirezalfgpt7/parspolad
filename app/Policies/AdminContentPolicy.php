<?php

namespace App\Policies;

use App\Support\AdminContentRegistry;
use App\Models\User;

class AdminContentPolicy
{
    public function viewAny(User $user, string $resource): bool
    {
        return $this->allows($user, $resource);
    }

    public function view(User $user, string $resource): bool
    {
        return $this->allows($user, $resource);
    }

    public function create(User $user, string $resource): bool
    {
        return $this->allows($user, $resource);
    }

    public function update(User $user, string $resource): bool
    {
        return $this->allows($user, $resource);
    }

    public function delete(User $user, string $resource): bool
    {
        return $this->allows($user, $resource);
    }

    private function allows(User $user, string $resource): bool
    {
        return $user->can(AdminContentRegistry::permission($resource));
    }
}
