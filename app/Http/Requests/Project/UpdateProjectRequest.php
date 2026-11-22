<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
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
            'slug' => ['sometimes', 'string', 'max:160', Rule::unique('projects', 'slug')->ignore($this->route('project')?->id)],
            'title_fa' => ['sometimes', 'string', 'max:255'],
            'title_en' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'integer', 'exists:project_categories,id'],
            'client_name_fa' => ['sometimes', 'string', 'max:255'],
            'client_name_en' => ['sometimes', 'string', 'max:255'],
            'contract_number' => ['sometimes', 'string', 'max:120'],
            'contract_type_fa' => ['sometimes', 'nullable', 'string', 'max:120'],
            'contract_type_en' => ['sometimes', 'nullable', 'string', 'max:120'],
            'location_fa' => ['sometimes', 'nullable', 'string', 'max:200'],
            'location_en' => ['sometimes', 'nullable', 'string', 'max:200'],
            'year' => ['sometimes', 'integer', 'min:1348', 'max:1450'],
            'status' => ['sometimes', new Enum(ProjectStatusEnum::class)],
            'summary_fa' => ['sometimes', 'string'],
            'summary_en' => ['sometimes', 'nullable', 'string'],
            'description_fa' => ['nullable', 'string'],
            'description_en' => ['sometimes', 'nullable', 'string'],
            'standards' => ['sometimes', 'nullable', 'array', 'max:20'],
            'standards.*' => ['string', 'max:80'],
            'cover_image' => ['sometimes', 'string', 'max:255'],
            'images' => ['sometimes', 'array', 'max:30'],
            'images.*' => ['required', 'string', 'max:500', 'distinct'],
            'videos' => ['sometimes', 'array', 'max:10'],
            'videos.*' => ['required', 'string', 'max:500', 'distinct'],
            'documents' => ['sometimes', 'array', 'max:30'],
            'documents.*.title_fa' => ['required', 'string', 'max:255'],
            'documents.*.title_en' => ['required', 'string', 'max:255'],
            'documents.*.file_url' => ['required', 'string', 'max:500'],
            'documents.*.file_type' => ['sometimes', 'string', 'max:20'],
            'documents.*.requires_auth' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ];
    }
}
