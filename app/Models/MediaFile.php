<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaFile extends Model
{
    protected $fillable = ['name', 'url', 'mime_type', 'extension', 'size_bytes', 'folder', 'requires_auth'];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'requires_auth' => 'boolean',
        ];
    }
}
