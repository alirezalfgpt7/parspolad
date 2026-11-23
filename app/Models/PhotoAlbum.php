<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PhotoAlbum extends Model
{
    protected $fillable = [
        'title_fa',
        'title_en',
        'slug',
        'description_fa',
        'description_en',
        'cover_media_id',
        'layout',
        'columns',
        'rows',
        'transition',
        'interval_ms',
        'image_effect',
        'card_effect',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cover_media_id' => 'integer',
            'columns' => 'integer',
            'rows' => 'integer',
            'interval_ms' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(MediaFile::class, 'cover_media_id');
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(MediaFile::class, 'photo_album_media', 'album_id', 'media_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }
}
