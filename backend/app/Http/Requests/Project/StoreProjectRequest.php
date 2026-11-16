<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('projects.manage') || $this->user()?->hasRole(['super_admin', 'admin', 'project_manager']);
    }

    public function rules(): array
    {
        return [
            'slug' => ['nullable', 'string', 'max:160', 'unique:projects,slug'],
            'title_fa' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:project_categories,id'],
            'client_name_fa' => ['required', 'string', 'max:255'],
            'client_name_en' => ['required', 'string', 'max:255'],
            'contract_number' => ['required', 'string', 'max:120'],
            'contract_type_fa' => ['nullable', 'string', 'max:120'],
            'contract_type_en' => ['nullable', 'string', 'max:120'],
            'location_fa' => ['nullable', 'string', 'max:200'],
            'location_en' => ['nullable', 'string', 'max:200'],
            'year' => ['required', 'integer', 'min:1348', 'max:1450'],
            'status' => ['required', new Enum(ProjectStatusEnum::class)],
            'summary_fa' => ['required', 'string'],
            'summary_en' => ['nullable', 'string'],
            'description_fa' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'standards' => ['nullable', 'array'],
            'cover_image' => ['required', 'string', 'max:255'],
            'is_featured' => ['boolean'],
        ];
    }
}
