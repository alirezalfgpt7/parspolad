<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemeSetting extends Model
{
    protected $fillable = [
        'active_preset_slug',
        'default_mode',
        'active_palette',
        'landing_theme_enabled',
        'landing_palette',
    ];

    protected function casts(): array
    {
        return [
            'active_palette' => 'array',
            'landing_theme_enabled' => 'boolean',
            'landing_palette' => 'array',
        ];
    }
}
