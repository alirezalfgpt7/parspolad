<?php

namespace App\Models;

use App\Enums\SlideEffectEnum;
use App\Enums\SlideTextAnimationEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Slide extends Model
{
    protected $fillable = [
        'slider_id',
        'title_fa',
        'title_en',
        'subtitle_fa',
        'subtitle_en',
        'cta_text_fa',
        'cta_text_en',
        'cta_link',
        'media_type',
        'desktop_media',
        'mobile_media',
        'text_position',
        'text_color',
        'button_color',
        'overlay_gradient',
        'duration_ms',
        'effect',
        'text_animation',
        'particles_enabled',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'effect' => SlideEffectEnum::class,
            'text_animation' => SlideTextAnimationEnum::class,
            'duration_ms' => 'integer',
            'particles_enabled' => 'boolean',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function slider(): BelongsTo
    {
        return $this->belongsTo(Slider::class);
    }
}
