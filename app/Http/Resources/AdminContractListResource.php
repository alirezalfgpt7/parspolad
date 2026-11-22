<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminContractListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_number' => $this->contract_number,
            'title_fa' => $this->title_fa,
            'client_fa' => $this->client_fa,
            'amount_billion_irr' => (float) $this->amount_billion_irr,
            'start_year' => $this->start_year,
            'end_year' => $this->end_year,
            'status' => $this->status?->value ?? $this->status,
        ];
    }
}
