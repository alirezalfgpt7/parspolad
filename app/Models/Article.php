<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slug',
        'title_fa',
        'title_en',
        'excerpt_fa',
        'excerpt_en',
        'content_fa',
        'content_en',
        'article_category_id',
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

    public function comments(): HasMany
    {
        return $this->hasMany(ArticleComment::class);
    }
}
