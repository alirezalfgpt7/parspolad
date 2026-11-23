<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaFile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'url',
        'storage_path',
        'source_media_id',
        'variant',
        'mime_type',
        'extension',
        'size_bytes',
        'folder',
        'requires_auth',
        'alt_text',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'requires_auth' => 'boolean',
            'source_media_id' => 'integer',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_media_id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(self::class, 'source_media_id');
    }
}
