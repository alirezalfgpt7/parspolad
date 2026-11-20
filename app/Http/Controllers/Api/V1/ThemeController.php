<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Theme\UpdateThemeRequest;
use App\Http\Resources\ThemeSettingResource;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    public function show(): JsonResponse
    {
        ThemePreset::ensureBuiltInPresets();
        return response()->json([
            'presets' => ThemePreset::query()->orderBy('id')->get(),
            'settings' => new ThemeSettingResource(ThemeSetting::query()->firstOrFail()),
        ]);
    }

    public function update(UpdateThemeRequest $request): JsonResponse
    {
        $theme = ThemeSetting::query()->firstOrCreate([]);
        $validated = $request->validated();
        $current = (new ThemeSettingResource($theme))->toArray($request);

        foreach (['active_palette', 'landing_palette', 'admin_palette'] as $key) {
            if (isset($validated[$key])) {
                $validated[$key] = array_replace($current[$key], $validated[$key]);
            }
        }

        $theme->update($validated);

        return response()->json(new ThemeSettingResource($theme->fresh()));
    }

    public function storePreset(Request $request): JsonResponse
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
        $rules = [
            'slug' => ['required', 'string', 'max:80', 'unique:theme_presets,slug'],
            'name_fa' => ['required', 'string', 'max:120'],
            'name_en' => ['required', 'string', 'max:120'],
            'palette' => ['required', 'array:'.implode(',', $paletteKeys)],
            'design_style' => ['sometimes', 'required', 'in:industrial,modern,glass'],
            'button_shape' => ['sometimes', 'required', 'in:rounded,pill,square'],
            'button_effect' => ['sometimes', 'required', 'in:shimmer,liquid,glow,plain'],
        ];
        foreach ($paletteKeys as $key) {
            $rules["palette.{$key}"] = ['required', 'string', 'max:20'];
        }
        $validated = $request->validate($rules);

        $preset = ThemePreset::query()->create($validated + ['is_default' => false]);

        return response()->json(['data' => $preset], 201);
    }
}
