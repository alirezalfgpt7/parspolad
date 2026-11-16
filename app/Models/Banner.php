<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title_fa',
        'title_en',
        'subtitle_fa',
        'subtitle_en',
        'cta_text_fa',
        'cta_text_en',
        'cta_link',
        'image_url',
        'placement',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
