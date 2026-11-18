<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaFile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'url',
        'storage_path',
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
        ];
    }
}
