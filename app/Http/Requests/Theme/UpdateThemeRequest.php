<?php

namespace App\Http\Requests\Theme;

use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('theme.manage') || $this->user()?->hasRole(['super_admin', 'admin']);
    }

    public function rules(): array
    {
        return [
            'active_preset_slug' => ['required', 'string', 'max:80'],
            'default_mode' => ['required', 'in:light,dark'],
            'active_palette' => ['required', 'array'],
            'active_palette.primary' => ['required', 'string', 'max:20'],
            'active_palette.secondary' => ['required', 'string', 'max:20'],
            'active_palette.accent' => ['required', 'string', 'max:20'],
            'design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
            'landing_theme_enabled' => ['required', 'boolean'],
            'landing_palette' => ['required', 'array'],
            'landing_design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'landing_button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'landing_button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
            'admin_palette' => ['sometimes', 'required', 'array'],
            'admin_palette.primary' => ['required_with:admin_palette', 'string', 'max:20'],
            'admin_palette.secondary' => ['required_with:admin_palette', 'string', 'max:20'],
            'admin_palette.accent' => ['required_with:admin_palette', 'string', 'max:20'],
            'admin_design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'admin_button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'admin_button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
        ];
    }
}
