<?php

namespace App\Http\Requests\Contract;

use App\Enums\ContractStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contracts.manage') || $this->user()?->hasRole(['super_admin', 'admin']);
    }

    public function rules(): array
    {
        return [
            'contract_number' => ['required', 'string', 'max:120'],
            'title_fa' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'client_fa' => ['required', 'string', 'max:255'],
            'client_en' => ['required', 'string', 'max:255'],
            'amount_billion_irr' => ['required', 'numeric', 'min:0'],
            'start_year' => ['nullable', 'integer', 'min:1348', 'max:1450'],
            'end_year' => ['nullable', 'integer', 'min:1348', 'max:1450'],
            'status' => ['required', new Enum(ContractStatusEnum::class)],
            'scope_fa' => ['nullable', 'string'],
            'scope_en' => ['nullable', 'string'],
            'document_url' => ['nullable', 'string', 'max:255'],
            'requires_auth' => ['boolean'],
        ];
    }
}
