<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title_fa' => $this->title_fa,
            'title_en' => $this->title_en,
            'issuer_fa' => $this->issuer_fa,
            'issuer_en' => $this->issuer_en,
            'issue_date' => $this->issue_date,
            'expiry_date' => $this->expiry_date,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'document_url' => $this->document_url,
            'requires_auth' => (bool) $this->requires_auth,
        ];
    }
}
