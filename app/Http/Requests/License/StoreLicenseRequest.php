<?php

namespace App\Http\Requests\License;

use Illuminate\Foundation\Http\FormRequest;

class StoreLicenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('licenses.manage') || $this->user()?->hasRole(['super_admin', 'admin']);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:80'],
            'title_fa' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'issuer_fa' => ['required', 'string', 'max:255'],
            'issuer_en' => ['required', 'string', 'max:255'],
            'issue_date' => ['required', 'string', 'max:30'],
            'expiry_date' => ['nullable', 'string', 'max:30'],
            'category' => ['required', 'in:iso,api,knowledge_based,association'],
            'image_url' => ['required', 'string', 'max:255'],
            'document_url' => ['nullable', 'string', 'max:255'],
            'requires_auth' => ['boolean'],
        ];
    }
}
