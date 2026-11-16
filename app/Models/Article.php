<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'slug',
        'title_fa',
        'title_en',
        'excerpt_fa',
        'excerpt_en',
        'content_fa',
        'content_en',
        'category_fa',
        'category_en',
        'cover_image',
        'author_fa',
        'published_at',
        'read_minutes',
    ];

    protected function casts(): array
    {
        return ['read_minutes' => 'integer'];
    }
}
