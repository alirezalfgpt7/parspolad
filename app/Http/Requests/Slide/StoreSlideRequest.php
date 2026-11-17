<?php

namespace App\Http\Requests\Slide;

use App\Enums\SlideEffectEnum;
use App\Enums\SlideTextAnimationEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('slider.manage') || $this->user()?->hasRole(['super_admin', 'admin', 'editor']);
    }

    public function rules(): array
    {
        return [
            'slider_id' => ['required', 'integer', 'exists:sliders,id'],
            'title_fa' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'subtitle_fa' => ['nullable', 'string', 'max:500'],
            'subtitle_en' => ['nullable', 'string', 'max:500'],
            'cta_text_fa' => ['nullable', 'string', 'max:120'],
            'cta_text_en' => ['nullable', 'string', 'max:120'],
            'cta_link' => ['nullable', 'string', 'max:255'],
            'media_type' => ['required', 'in:image,video'],
            'desktop_media' => ['required', 'string', 'max:255'],
            'mobile_media' => ['nullable', 'string', 'max:255'],
            'text_position' => ['required', 'in:right,center,left'],
            'text_color' => ['required', 'string', 'max:20'],
            'button_color' => ['required', 'string', 'max:20'],
            'overlay_gradient' => ['nullable', 'string', 'max:255'],
            'duration_ms' => ['required', 'integer', 'min:2000', 'max:30000'],
            'effect' => ['required', new Enum(SlideEffectEnum::class)],
            'text_animation' => ['required', new Enum(SlideTextAnimationEnum::class)],
            'particles_enabled' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
