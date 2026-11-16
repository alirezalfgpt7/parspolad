<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('projects.manage') || $this->user()?->hasRole(['super_admin', 'admin', 'project_manager']);
    }

    public function rules(): array
    {
        return [
            'title_fa' => ['sometimes', 'string', 'max:255'],
            'title_en' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'integer', 'exists:project_categories,id'],
            'client_name_fa' => ['sometimes', 'string', 'max:255'],
            'contract_number' => ['sometimes', 'string', 'max:120'],
            'year' => ['sometimes', 'integer', 'min:1348', 'max:1450'],
            'status' => ['sometimes', new Enum(ProjectStatusEnum::class)],
            'summary_fa' => ['sometimes', 'string'],
            'description_fa' => ['nullable', 'string'],
            'standards' => ['nullable', 'array'],
            'cover_image' => ['sometimes', 'string', 'max:255'],
            'is_featured' => ['boolean'],
        ];
    }
}
