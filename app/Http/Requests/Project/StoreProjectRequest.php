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
            'standards' => ['sometimes', 'array', 'max:20'],
            'standards.*' => ['string', 'max:80'],
            'cover_image' => ['required', 'string', 'max:255'],
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
