<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'slug',
        'name_fa',
        'name_en',
        'category_fa',
        'category_en',
        'model_code',
        'pressure_rating',
        'standard',
        'summary_fa',
        'summary_en',
        'specs',
        'image_url',
        'catalog_url',
    ];

    protected function casts(): array
    {
        return ['specs' => 'array'];
    }
}
