<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LicenseAttachment extends Model
{
    protected $fillable = ['license_id', 'title_fa', 'file_url', 'requires_auth'];

    protected function casts(): array
    {
        return ['requires_auth' => 'boolean'];
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }
}
