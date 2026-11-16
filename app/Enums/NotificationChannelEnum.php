<?php

namespace App\Enums;

enum NotificationChannelEnum: string
{
    case EMAIL = 'email';
    case SMS = 'sms';
    case IN_APP = 'in_app';
}
