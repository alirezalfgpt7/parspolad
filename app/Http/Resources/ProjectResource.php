<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_fa' => $this->title_fa,
            'title_en' => $this->title_en,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category'),
            'client_name_fa' => $this->client_name_fa,
            'client_name_en' => $this->client_name_en,
            'contract_number' => $this->contract_number,
            'contract_type_fa' => $this->contract_type_fa,
            'contract_type_en' => $this->contract_type_en,
            'location_fa' => $this->location_fa,
            'location_en' => $this->location_en,
            'year' => $this->year,
            'status' => $this->status?->value ?? $this->status,
            'summary_fa' => $this->summary_fa,
            'summary_en' => $this->summary_en,
            'description_fa' => $this->description_fa,
            'description_en' => $this->description_en,
            'standards' => $this->standards ?? [],
            'cover_image' => $this->cover_image,
            'images' => $this->whenLoaded('images', fn () => $this->images->pluck('image_url')),
            'videos' => $this->whenLoaded('videos', fn () => $this->videos->pluck('video_url')),
            'documents' => $this->whenLoaded(
                'documents',
                fn () => $this->documents->map(fn ($document): array => [
                    ...$document->toArray(),
                    'file_url' => app(\App\Services\PrivateDownloadUrl::class)->resolve(
                        $document->file_url,
                        (bool) $document->requires_auth,
                        $request,
                    ),
                ]),
            ),
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}
