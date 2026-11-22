<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemeSetting extends Model
{
    protected $fillable = [
        'active_preset_slug',
        'default_mode',
        'active_palette',
        'design_style',
        'button_shape',
        'button_effect',
        'landing_theme_enabled',
        'landing_palette',
        'landing_design_style',
        'landing_button_shape',
        'landing_button_effect',
        'landing_header_settings',
        'admin_palette',
        'admin_design_style',
        'admin_button_shape',
        'admin_button_effect',
    ];

    protected function casts(): array
    {
        return [
            'active_palette' => 'array',
            'landing_theme_enabled' => 'boolean',
            'landing_palette' => 'array',
            'landing_header_settings' => 'array',
            'admin_palette' => 'array',
        ];
    }
}
