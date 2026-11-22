<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThemeSettingResource extends JsonResource
{
    private const DEFAULT_LANDING_HEADER_SETTINGS = [
        'border_color' => '#E2E8F0',
        'mode' => 'glass',
        'radius' => 18,
        'blur' => 20,
        'wave_colors' => ['#DC2626', '#DC2626', '#DC2626'],
        'wave_bottom_color' => '#EF4444',
    ];

    private const DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS = [
        'background_color' => '#0F172A',
        'title_color' => '#FFFFFF',
        'subtitle_color' => '#CBD5E1',
        'border_color' => '#334155',
        'wave_color' => '#DC2626',
        'wave_colors' => ['#DC2626', '#DC2626', '#DC2626'],
        'icon_name' => 'Globe',
        'icon_color' => '#F8FAFC',
        'icon_background_color' => '#1E293B',
        'radius' => 24,
        'wave_enabled' => true,
    ];

    private const DEFAULT_PALETTE = [
        'primary' => '#B91C1C',
        'secondary' => '#1E293B',
        'accent' => '#D97706',
        'background' => '#F8FAFC',
        'surface' => '#FFFFFF',
        'text' => '#0F172A',
        'headerBg' => '#FFFFFF',
        'headerText' => '#0F172A',
        'footerBg' => '#0F172A',
        'footerText' => '#F8FAFC',
        'buttonBg' => '#B91C1C',
        'buttonText' => '#FFFFFF',
        'link' => '#B91C1C',
    ];

    public function toArray(Request $request): array
    {
        $landingPalette = $this->normalizePalette($this->landing_palette);
        $activePalette = $this->normalizePalette($this->active_palette, $landingPalette);
        $adminPalette = $this->normalizePalette($this->admin_palette, $activePalette);
        $landingHeaderSettings = array_replace(
            self::DEFAULT_LANDING_HEADER_SETTINGS,
            $this->landing_header_settings ?? [],
        );
        $landingWaveColors = $landingHeaderSettings['wave_colors'] ?? null;
        $landingHeaderSettings['wave_colors'] = $this->normalizeWaveColors(
            is_array($landingWaveColors) ? $landingWaveColors : null,
            '#DC2626',
        );
        if (! is_string($landingHeaderSettings['wave_bottom_color'])
            || preg_match('/^#[0-9A-Fa-f]{6}$/', $landingHeaderSettings['wave_bottom_color']) !== 1) {
            $landingHeaderSettings['wave_bottom_color'] = '#EF4444';
        }
        $publicPageTitleSettings = array_replace(
            self::DEFAULT_PUBLIC_PAGE_TITLE_SETTINGS,
            $this->public_page_title_settings ?? [],
        );
        $legacyWaveColor = $publicPageTitleSettings['wave_color'] ?? '#DC2626';
        if (! is_string($legacyWaveColor) || preg_match('/^#[0-9A-Fa-f]{6}$/', $legacyWaveColor) !== 1) {
            $legacyWaveColor = '#DC2626';
        }
        $publicWaveColors = $publicPageTitleSettings['wave_colors'] ?? null;
        $publicPageTitleSettings['wave_colors'] = $this->normalizeWaveColors(
            is_array($publicWaveColors) ? $publicWaveColors : null,
            $legacyWaveColor,
        );
        $publicPageTitleSettings['wave_color'] = $publicPageTitleSettings['wave_colors'][0];

        return [
            'active_preset_slug' => $this->active_preset_slug,
            'default_mode' => $this->default_mode,
            'active_palette' => $activePalette,
            'design_style' => $this->design_style,
            'button_shape' => $this->button_shape,
            'button_effect' => $this->button_effect ?? 'shimmer',
            'landing_theme_enabled' => (bool) $this->landing_theme_enabled,
            'landing_palette' => $landingPalette,
            'landing_design_style' => $this->landing_design_style ?? $this->design_style,
            'landing_button_shape' => $this->landing_button_shape ?? $this->button_shape,
            'landing_button_effect' => $this->landing_button_effect ?? $this->button_effect ?? 'shimmer',
            'landing_header_settings' => $landingHeaderSettings,
            'public_page_title_settings' => $publicPageTitleSettings,
            'admin_palette' => $adminPalette,
            'admin_design_style' => $this->admin_design_style ?? $this->design_style,
            'admin_button_shape' => $this->admin_button_shape ?? $this->button_shape,
            'admin_button_effect' => $this->admin_button_effect ?? $this->button_effect ?? 'shimmer',
        ];
    }

    private function normalizePalette(?array $palette, ?array $fallback = null): array
    {
        $palette = array_intersect_key($palette ?? [], self::DEFAULT_PALETTE);
        $palette = array_filter(
            $palette,
            static fn ($value): bool => is_string($value)
                && trim($value) !== ''
                && strtolower(trim($value)) !== 'undefined',
        );

        return array_replace(self::DEFAULT_PALETTE, $fallback ?? [], $palette);
    }

    private function normalizeWaveColors(?array $colors, string $fallback): array
    {
        $colors = array_values(array_filter(
            $colors ?? [],
            static fn ($color): bool => is_string($color)
                && preg_match('/^#[0-9A-Fa-f]{6}$/', $color) === 1,
        ));
        $colors = array_slice($colors, 0, 3);

        while (count($colors) < 3) {
            $colors[] = $fallback;
        }

        return $colors;
    }
}
