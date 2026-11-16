<?php

namespace App\Models;

use App\Enums\NotificationChannelEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = ['user_id', 'title_fa', 'title_en', 'body_fa', 'body_en', 'channel', 'is_read'];

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannelEnum::class,
            'is_read' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
