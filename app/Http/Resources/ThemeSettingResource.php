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
            'design_style' => $this->design_style,
            'button_shape' => $this->button_shape,
            'button_effect' => $this->button_effect ?? 'shimmer',
            'landing_theme_enabled' => (bool) $this->landing_theme_enabled,
            'landing_palette' => $this->landing_palette,
            'landing_design_style' => $this->landing_design_style ?? $this->design_style,
            'landing_button_shape' => $this->landing_button_shape ?? $this->button_shape,
            'landing_button_effect' => $this->landing_button_effect ?? $this->button_effect ?? 'shimmer',
            'admin_palette' => $this->admin_palette ?? $this->active_palette,
            'admin_design_style' => $this->admin_design_style ?? $this->design_style,
            'admin_button_shape' => $this->admin_button_shape ?? $this->button_shape,
            'admin_button_effect' => $this->admin_button_effect ?? $this->button_effect ?? 'shimmer',
        ];
    }
}
