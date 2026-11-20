<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemePreset extends Model
{
    protected $fillable = [
        'slug',
        'name_fa',
        'name_en',
        'is_default',
        'palette',
        'design_style',
        'button_shape',
        'button_effect',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'palette' => 'array',
        ];
    }

    public static function ensureBuiltInPresets(): void
    {
        $presets = [
            [
                'slug' => 'industrial-crimson',
                'name_fa' => 'قرمز صنعتی پارس پولاد (پیش‌فرض)',
                'name_en' => 'Pars Polad Industrial Crimson',
                'is_default' => true,
                'design_style' => 'modern',
                'button_shape' => 'rounded',
                'button_effect' => 'shimmer',
                'palette' => [
                    'primary' => '#B91C1C', 'secondary' => '#1E293B', 'accent' => '#D97706',
                    'background' => '#F8FAFC', 'surface' => '#FFFFFF', 'text' => '#0F172A',
                    'headerBg' => '#FFFFFF', 'headerText' => '#0F172A',
                    'footerBg' => '#0F172A', 'footerText' => '#F8FAFC',
                    'buttonBg' => '#B91C1C', 'buttonText' => '#FFFFFF', 'link' => '#B91C1C',
                ],
            ],
            [
                'slug' => 'midnight-violet',
                'name_fa' => 'بنفش شبانه',
                'name_en' => 'Midnight Violet',
                'is_default' => false,
                'design_style' => 'modern',
                'button_shape' => 'pill',
                'button_effect' => 'glow',
                'palette' => [
                    'primary' => '#522B5B', 'secondary' => '#190019', 'accent' => '#854F6C',
                    'background' => '#FBE4D8', 'surface' => '#DFB6B2', 'text' => '#190019',
                    'headerBg' => '#190019', 'headerText' => '#FBE4D8',
                    'footerBg' => '#190019', 'footerText' => '#DFB6B2',
                    'buttonBg' => '#522B5B', 'buttonText' => '#FFFFFF', 'link' => '#854F6C',
                ],
            ],
            [
                'slug' => 'rose-burgundy',
                'name_fa' => 'زرشکی و صورتی',
                'name_en' => 'Rose Burgundy',
                'is_default' => false,
                'design_style' => 'modern',
                'button_shape' => 'pill',
                'button_effect' => 'liquid',
                'palette' => [
                    'primary' => '#B94273', 'secondary' => '#2D0A1E', 'accent' => '#E97DA6',
                    'background' => '#FFF3F6', 'surface' => '#FFC9B9', 'text' => '#2D0A1E',
                    'headerBg' => '#2D0A1E', 'headerText' => '#FFF3F6',
                    'footerBg' => '#2D0A1E', 'footerText' => '#FFC9B9',
                    'buttonBg' => '#6A1E3B', 'buttonText' => '#FFFFFF', 'link' => '#B94273',
                ],
            ],
            [
                'slug' => 'teal-sunset',
                'name_fa' => 'دریایی و طلایی',
                'name_en' => 'Teal Sunset',
                'is_default' => false,
                'design_style' => 'glass',
                'button_shape' => 'pill',
                'button_effect' => 'glow',
                'palette' => [
                    'primary' => '#264653', 'secondary' => '#1A1F2B', 'accent' => '#E9C46A',
                    'background' => '#FAF3E0', 'surface' => '#FFFFFF', 'text' => '#1A1F2B',
                    'headerBg' => '#1A1F2B', 'headerText' => '#FAF3E0',
                    'footerBg' => '#264653', 'footerText' => '#FAF3E0',
                    'buttonBg' => '#264653', 'buttonText' => '#FFFFFF', 'link' => '#2A9D8F',
                ],
            ],
            [
                'slug' => 'forest-mint',
                'name_fa' => 'جنگلی و نعناعی',
                'name_en' => 'Forest Mint',
                'is_default' => false,
                'design_style' => 'glass',
                'button_shape' => 'pill',
                'button_effect' => 'liquid',
                'palette' => [
                    'primary' => '#375534', 'secondary' => '#0F2A1D', 'accent' => '#AEC3B0',
                    'background' => '#F3F8EF', 'surface' => '#FFFFFF', 'text' => '#0F2A1D',
                    'headerBg' => '#0F2A1D', 'headerText' => '#F3F8EF',
                    'footerBg' => '#0F2A1D', 'footerText' => '#E3EED4',
                    'buttonBg' => '#375534', 'buttonText' => '#FFFFFF', 'link' => '#6B9071',
                ],
            ],
            [
                'slug' => 'deep-ocean',
                'name_fa' => 'آبی اقیانوسی',
                'name_en' => 'Deep Ocean Blue',
                'is_default' => false,
                'design_style' => 'glass',
                'button_shape' => 'pill',
                'button_effect' => 'glow',
                'palette' => [
                    'primary' => '#2078CF', 'secondary' => '#011F65', 'accent' => '#020C47',
                    'background' => '#F1F7FF', 'surface' => '#FFFFFF', 'text' => '#020C47',
                    'headerBg' => '#011F65', 'headerText' => '#FFFFFF',
                    'footerBg' => '#000521', 'footerText' => '#FFFFFF',
                    'buttonBg' => '#2078CF', 'buttonText' => '#FFFFFF', 'link' => '#0E4EB2',
                ],
            ],
        ];

        foreach ($presets as $preset) {
            self::query()->firstOrCreate(
                ['slug' => $preset['slug']],
                $preset,
            );
        }
    }
}
