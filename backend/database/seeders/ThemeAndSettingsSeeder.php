<?php

namespace Database\Seeders;

use App\Models\Kpi;
use App\Models\Setting;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;
use Illuminate\Database\Seeder;

class ThemeAndSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $crimsonPalette = [
            'primary' => '#B91C1C',
            'secondary' => '#0F172A',
            'accent' => '#D97706',
            'background' => '#F8FAFC',
            'surface' => '#FFFFFF',
            'text' => '#0F172A',
            'headerBg' => '#0B1120',
            'headerText' => '#F8FAFC',
            'footerBg' => '#090D16',
            'footerText' => '#CBD5E1',
            'buttonBg' => '#B91C1C',
            'buttonText' => '#FFFFFF',
            'link' => '#DC2626',
        ];

        ThemePreset::query()->firstOrCreate(
            ['slug' => 'industrial-crimson'],
            ['name_fa' => 'قرمز صنعتی (پیش‌فرض)', 'name_en' => 'Industrial Crimson', 'is_default' => true, 'palette' => $crimsonPalette]
        );

        ThemePreset::query()->firstOrCreate(
            ['slug' => 'petro-navy'],
            [
                'name_fa' => 'سرمه‌ای پتروشیمی',
                'name_en' => 'Petrochemical Navy',
                'is_default' => false,
                'palette' => array_merge($crimsonPalette, ['primary' => '#0369A1', 'buttonBg' => '#0369A1', 'link' => '#0284C7']),
            ]
        );

        ThemeSetting::query()->firstOrCreate([], [
            'active_preset_slug' => 'industrial-crimson',
            'default_mode' => 'light',
            'active_palette' => $crimsonPalette,
            'landing_theme_enabled' => true,
            'landing_palette' => $crimsonPalette,
        ]);

        $companySettings = [
            'name_fa' => 'شرکت دانش‌بنیان پارس پولاد آقایی',
            'name_en' => 'Pars Poolad Aghaee Knowledge-Based Co.',
            'factory_address_fa' => 'اهواز، شهرک صنعتی شماره ۳، بلوار تلاش، خیابان تولید ۲',
            'office_address_fa' => 'تهران / اهواز — دفتر مهندسی و بازرگانی پارس پولاد آقایی',
            'commercial_phone' => '09369520082',
            'factory_email' => 'info@parspooladaghaei.ir',
        ];

        foreach ($companySettings as $key => $val) {
            Setting::query()->firstOrCreate(['key' => $key], ['group' => 'company', 'value' => $val]);
        }

        $kpis = [
            ['key' => 'experience_years', 'label_fa' => 'سال سابقه مهندسی و ساخت', 'label_en' => 'Years Engineering Heritage', 'value' => 56, 'suffix_fa' => 'سال', 'suffix_en' => 'Yrs', 'sort_order' => 1],
            ['key' => 'wellhead_deliveries', 'label_fa' => 'پروژه و تجهیز سرچاهی و درون‌چاهی', 'label_en' => 'Delivered Wellhead Assemblies', 'value' => 1450, 'suffix_fa' => '+', 'suffix_en' => '+', 'sort_order' => 2],
            ['key' => 'iso_api_standards', 'label_fa' => 'گواهینامه بین‌المللی API و ISO', 'label_en' => 'API & ISO Certifications', 'value' => 7, 'suffix_fa' => 'استاندارد', 'suffix_en' => 'Certs', 'sort_order' => 3],
            ['key' => 'oil_clients', 'label_fa' => 'بهره‌بردار ملی نفت، گاز و حفاری', 'label_en' => 'National Oil & Gas Operators', 'value' => 14, 'suffix_fa' => '+', 'suffix_en' => '+', 'sort_order' => 4],
        ];

        foreach ($kpis as $kpi) {
            Kpi::query()->firstOrCreate(['key' => $kpi['key']], $kpi);
        }
    }
}
