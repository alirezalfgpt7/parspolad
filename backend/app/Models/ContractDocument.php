<?php

namespace App\Models;

use App\Enums\DocumentTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractDocument extends Model
{
    protected $fillable = ['contract_id', 'title_fa', 'file_url', 'document_type', 'requires_auth'];

    protected function casts(): array
    {
        return [
            'document_type' => DocumentTypeEnum::class,
            'requires_auth' => 'boolean',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
