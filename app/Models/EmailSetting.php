<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSetting extends Model
{
    protected $fillable = [
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_password_encrypted',
        'from_address',
        'from_name',
    ];

    protected $hidden = ['smtp_password_encrypted'];

    protected function casts(): array
    {
        return [
            'smtp_port' => 'integer',
            'smtp_password_encrypted' => 'encrypted',
        ];
    }
}
