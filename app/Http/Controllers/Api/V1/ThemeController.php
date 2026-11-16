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
        return response()->json([
            'presets' => ThemePreset::query()->orderBy('id')->get(),
            'settings' => new ThemeSettingResource(ThemeSetting::query()->firstOrFail()),
        ]);
    }

    public function update(UpdateThemeRequest $request): JsonResponse
    {
        $theme = ThemeSetting::query()->firstOrCreate([]);
        $theme->update($request->validated());

        return response()->json(new ThemeSettingResource($theme->fresh()));
    }

    public function storePreset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:80', 'unique:theme_presets,slug'],
            'name_fa' => ['required', 'string', 'max:120'],
            'name_en' => ['required', 'string', 'max:120'],
            'palette' => ['required', 'array'],
        ]);

        $preset = ThemePreset::query()->create($validated + ['is_default' => false]);

        return response()->json(['data' => $preset], 201);
    }
}
