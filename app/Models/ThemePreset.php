<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemePreset extends Model
{
    protected $fillable = [
        'slug',
        'name_fa',
        'name_en',
        'is_default',
        'palette',
        'design_style',
        'button_shape',
        'button_effect',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'palette' => 'array',
        ];
    }
}
