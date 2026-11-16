<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'parent_id',
        'name_fa',
        'name_en',
        'head_name_fa',
        'head_name_en',
        'head_title_fa',
        'head_title_en',
        'color',
        'member_count',
    ];

    protected function casts(): array
    {
        return ['member_count' => 'integer'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }
}
