<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class License extends Model
{
    use SoftDeletes;

    use LogsActivity;

    protected $fillable = [
        'code',
        'title_fa',
        'title_en',
        'issuer_fa',
        'issuer_en',
        'issue_date',
        'expiry_date',
        'category',
        'image_url',
        'document_url',
        'requires_auth',
    ];

    protected function casts(): array
    {
        return ['requires_auth' => 'boolean'];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['code', 'title_fa', 'expiry_date'])->logOnlyDirty();
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(LicenseAttachment::class);
    }
}
