<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_number' => $this->contract_number,
            'title_fa' => $this->title_fa,
            'title_en' => $this->title_en,
            'client_fa' => $this->client_fa,
            'client_en' => $this->client_en,
            'amount_billion_irr' => (float) $this->amount_billion_irr,
            'start_year' => $this->start_year,
            'end_year' => $this->end_year,
            'status' => $this->status?->value ?? $this->status,
            'scope_fa' => $this->scope_fa,
            'scope_en' => $this->scope_en,
            'document_url' => app(\App\Services\PrivateDownloadUrl::class)->resolve(
                $this->document_url,
                (bool) $this->requires_auth,
                $request,
            ),
            'requires_auth' => (bool) $this->requires_auth,
        ];
    }
}
