<?php

namespace App\Models;

use App\Enums\ContractStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Contract extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'contract_number',
        'title_fa',
        'title_en',
        'client_fa',
        'client_en',
        'amount_billion_irr',
        'start_year',
        'end_year',
        'status',
        'scope_fa',
        'scope_en',
        'document_url',
        'requires_auth',
    ];

    protected function casts(): array
    {
        return [
            'status' => ContractStatusEnum::class,
            'amount_billion_irr' => 'decimal:2',
            'start_year' => 'integer',
            'end_year' => 'integer',
            'requires_auth' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['contract_number', 'title_fa', 'status', 'amount_billion_irr'])->logOnlyDirty();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ContractDocument::class);
    }
}
