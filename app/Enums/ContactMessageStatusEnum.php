<?php

namespace App\Enums;

enum ContactMessageStatusEnum: string
{
    case NEW = 'new';
    case REVIEWED = 'reviewed';
    case REPLIED = 'replied';
}
