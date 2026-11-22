<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProjectListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_fa' => $this->title_fa,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn ($category): ?array => $category
                ? [
                    'id' => $category->id,
                    'slug' => $category->slug,
                    'name_fa' => $category->name_fa,
                    'name_en' => $category->name_en,
                    'icon' => $category->icon,
                    'color' => $category->color,
                ]
                : null),
            'client_name_fa' => $this->client_name_fa,
            'contract_number' => $this->contract_number,
            'year' => $this->year,
            'status' => $this->status?->value ?? $this->status,
            'cover_image' => $this->cover_image,
        ];
    }
}
