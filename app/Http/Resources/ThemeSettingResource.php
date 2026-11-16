<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThemeSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'active_preset_slug' => $this->active_preset_slug,
            'default_mode' => $this->default_mode,
            'active_palette' => $this->active_palette,
            'landing_theme_enabled' => (bool) $this->landing_theme_enabled,
            'landing_palette' => $this->landing_palette,
        ];
    }
}
