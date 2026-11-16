<?php

namespace App\Enums;

enum UserRoleEnum: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case EDITOR = 'editor';
    case PROJECT_MANAGER = 'project_manager';
    case CLIENT = 'client';
}
