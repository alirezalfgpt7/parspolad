<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Model
{
    protected $fillable = [
        'department_id',
        'name_fa',
        'name_en',
        'role_fa',
        'role_en',
        'experience_years',
        'email',
        'phone',
        'avatar_url',
    ];

    protected function casts(): array
    {
        return ['experience_years' => 'integer'];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
