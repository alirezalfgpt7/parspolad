<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachineryAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name_fa',
        'name_en',
        'asset_code',
        'model',
        'year',
        'location_fa',
        'location_en',
        'manufacturer_fa',
        'manufacturer_en',
        'serial_number',
        'notes_fa',
        'notes_en',
    ];
}
