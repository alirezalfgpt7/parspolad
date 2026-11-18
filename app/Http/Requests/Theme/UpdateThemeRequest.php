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
        $paletteKeys = [
            'primary',
            'secondary',
            'accent',
            'background',
            'surface',
            'text',
            'headerBg',
            'headerText',
            'footerBg',
            'footerText',
            'buttonBg',
            'buttonText',
            'link',
        ];
        $paletteKeyList = implode(',', $paletteKeys);
        $rules = [
            'active_preset_slug' => ['required', 'string', 'max:80'],
            'default_mode' => ['required', 'in:light,dark'],
            'active_palette' => ['required', 'array:'.$paletteKeyList],
            'design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
            'landing_theme_enabled' => ['required', 'boolean'],
            'landing_palette' => ['required', 'array:'.$paletteKeyList],
            'landing_design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'landing_button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'landing_button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
            'admin_palette' => ['sometimes', 'required', 'array:'.$paletteKeyList],
            'admin_design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'admin_button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'admin_button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
        ];

        foreach ($paletteKeys as $key) {
            $requiredColor = in_array($key, ['primary', 'secondary', 'accent'], true);
            $rules["active_palette.{$key}"] = [$requiredColor ? 'required' : 'sometimes', 'string', 'max:20'];
            $rules["landing_palette.{$key}"] = [$requiredColor ? 'required' : 'sometimes', 'string', 'max:20'];
            $rules["admin_palette.{$key}"] = [
                $requiredColor ? 'required_with:admin_palette' : 'sometimes',
                'string',
                'max:20',
            ];
        }

        return $rules;
    }
}
