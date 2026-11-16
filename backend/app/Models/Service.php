<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'slug',
        'title_fa',
        'title_en',
        'summary_fa',
        'summary_en',
        'description_fa',
        'description_en',
        'icon',
        'image_url',
        'sort_order',
    ];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }
}
