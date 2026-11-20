<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kpi extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['key', 'label_fa', 'label_en', 'value', 'suffix_fa', 'suffix_en', 'icon', 'background_color', 'sort_order'];

    protected function casts(): array
    {
        return ['value' => 'integer', 'sort_order' => 'integer'];
    }
}
