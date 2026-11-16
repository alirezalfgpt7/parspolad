<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Page extends Model
{
    use SoftDeletes;

    use LogsActivity;

    protected $fillable = [
        'slug',
        'title_fa',
        'title_en',
        'subtitle_fa',
        'subtitle_en',
        'content_fa',
        'content_en',
        'meta_title',
        'meta_description',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['slug', 'title_fa', 'meta_title'])->logOnlyDirty();
    }
}
