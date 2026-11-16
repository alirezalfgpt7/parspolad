<?php

namespace App\Enums;

enum ContractStatusEnum: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case PENDING = 'pending';
    case ARCHIVED = 'archived';

    public function labelFa(): string
    {
        return match ($this) {
            self::ACTIVE => 'فعال / در حال اجرا',
            self::COMPLETED => 'خاتمه‌یافته',
            self::PENDING => 'در انتظار ابلاغ',
            self::ARCHIVED => 'بایگانی‌شده',
        };
    }
}
