<?php

namespace App\Models;

use App\Enums\ProjectStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Project extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'slug',
        'title_fa',
        'title_en',
        'category_id',
        'client_name_fa',
        'client_name_en',
        'contract_number',
        'contract_type_fa',
        'contract_type_en',
        'location_fa',
        'location_en',
        'year',
        'status',
        'summary_fa',
        'summary_en',
        'description_fa',
        'description_en',
        'standards',
        'cover_image',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProjectStatusEnum::class,
            'year' => 'integer',
            'standards' => 'array',
            'is_featured' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['title_fa', 'contract_number', 'status', 'year'])->logOnlyDirty();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProjectCategory::class, 'category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(ProjectVideo::class)->orderBy('sort_order');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class);
    }
}
