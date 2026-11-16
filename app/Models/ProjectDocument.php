<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDocument extends Model
{
    protected $fillable = ['project_id', 'title_fa', 'title_en', 'file_url', 'file_type', 'requires_auth'];

    protected function casts(): array
    {
        return ['requires_auth' => 'boolean'];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
