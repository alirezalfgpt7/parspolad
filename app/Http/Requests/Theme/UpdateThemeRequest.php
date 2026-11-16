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
            'landing_theme_enabled' => ['required', 'boolean'],
            'landing_palette' => ['required', 'array'],
        ];
    }
}
