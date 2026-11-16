<?php

namespace App\Models;

use App\Enums\NotificationChannelEnum;
use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = ['event_key', 'name_fa', 'channel', 'subject_fa', 'body_html', 'sms_text', 'is_active'];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannelEnum::class,
            'is_active' => 'boolean',
        ];
    }
}
