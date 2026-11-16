<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Project $project): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->can('projects.manage') || $user->hasRole(['super_admin', 'admin', 'project_manager']);
    }

    public function update(User $user, Project $project): bool
    {
        return $user->can('projects.manage') || $user->hasRole(['super_admin', 'admin', 'project_manager']);
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }
}
