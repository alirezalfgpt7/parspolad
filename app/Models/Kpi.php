<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    protected $fillable = ['key', 'label_fa', 'label_en', 'value', 'suffix_fa', 'suffix_en', 'sort_order'];

    protected function casts(): array
    {
        return ['value' => 'integer', 'sort_order' => 'integer'];
    }
}
