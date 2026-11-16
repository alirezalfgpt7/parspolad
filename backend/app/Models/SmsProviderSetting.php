<?php

namespace App\Models;

use App\Enums\SmsProviderEnum;
use Illuminate\Database\Eloquent\Model;

class SmsProviderSetting extends Model
{
    protected $fillable = [
        'provider',
        'api_key_encrypted',
        'sender_line',
        'enabled',
    ];

    protected $hidden = ['api_key_encrypted'];

    protected function casts(): array
    {
        return [
            'provider' => SmsProviderEnum::class,
            'api_key_encrypted' => 'encrypted',
            'enabled' => 'boolean',
        ];
    }
}
