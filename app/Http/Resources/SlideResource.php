<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlideResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slider_id' => $this->slider_id,
            'title_fa' => $this->title_fa,
            'title_en' => $this->title_en,
            'subtitle_fa' => $this->subtitle_fa,
            'subtitle_en' => $this->subtitle_en,
            'cta_text_fa' => $this->cta_text_fa,
            'cta_text_en' => $this->cta_text_en,
            'cta_link' => $this->cta_link,
            'media_type' => $this->media_type,
            'desktop_media' => $this->desktop_media,
            'mobile_media' => $this->mobile_media,
            'text_position' => $this->text_position,
            'text_color' => $this->text_color,
            'button_color' => $this->button_color,
            'overlay_gradient' => $this->overlay_gradient,
            'duration_ms' => $this->duration_ms,
            'effect' => $this->effect?->value ?? $this->effect,
            'text_animation' => $this->text_animation?->value ?? $this->text_animation,
            'particles_enabled' => (bool) $this->particles_enabled,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
