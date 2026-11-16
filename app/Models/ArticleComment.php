<?php

namespace App\Models;

use App\Enums\ArticleCommentStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ArticleComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'article_id',
        'reviewed_by',
        'author_name',
        'body',
        'status',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ArticleCommentStatusEnum::class,
            'reviewed_at' => 'datetime',
        ];
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
