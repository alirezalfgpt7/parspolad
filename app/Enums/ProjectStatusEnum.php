<?php

namespace App\Enums;

enum ProjectStatusEnum: string
{
    case COMPLETED = 'completed';
    case IN_PROGRESS = 'in_progress';
    case PLANNED = 'planned';
    case CONTRACTED = 'contracted';

    public function labelFa(): string
    {
        return match ($this) {
            self::COMPLETED => 'تکمیل‌شده',
            self::IN_PROGRESS => 'در حال اجرا',
            self::PLANNED => 'در دست برنامه‌ریزی',
            self::CONTRACTED => 'منعقدشده',
        };
    }
}
