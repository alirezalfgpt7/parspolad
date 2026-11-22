<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminLicenseListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title_fa' => $this->title_fa,
            'issuer_fa' => $this->issuer_fa,
            'issue_date' => $this->issue_date,
            'expiry_date' => $this->expiry_date,
            'category' => $this->category?->value ?? $this->category,
        ];
    }
}
