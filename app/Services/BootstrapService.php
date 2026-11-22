<?php

namespace App\Services;

use App\Http\Resources\ThemeSettingResource;
use App\Models\Banner;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Kpi;
use App\Models\License;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Slider;
use App\Models\TeamMember;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;
use Illuminate\Http\Request;

class BootstrapService
{
    public function getPublicBootstrap(Request $request): array
    {
        ThemePreset::ensureBuiltInPresets();
        $themeSettings = ThemeSetting::query()->first();

        return [
            'theme_presets' => ThemePreset::query()->orderBy('id')->get(),
            'theme_settings' => $themeSettings
                ? (new ThemeSettingResource($themeSettings))->toArray($request)
                : null,
            'sliders' => Slider::query()->with(['slides' => fn ($q) => $q->where('is_active', true)])->where('is_active', true)->get(),
            'menus' => Menu::query()->with('items')->get(),
            'kpis' => Kpi::query()->orderBy('sort_order')->get(),
            'project_categories' => ProjectCategory::query()->orderBy('id')->get(),
            'contracts' => Contract::query()->orderByDesc('start_year')->get()
                ->map(fn (Contract $contract): array => [
                    ...$contract->toArray(),
                    'document_url' => app(PrivateDownloadUrl::class)->resolve(
                        $contract->document_url,
                        (bool) $contract->requires_auth,
                        $request,
                    ),
                ]),
            'licenses' => License::query()->orderBy('id')->get()
                ->map(fn (License $license): array => [
                    ...$license->toArray(),
                    'document_url' => app(PrivateDownloadUrl::class)->resolve(
                        $license->document_url,
                        (bool) $license->requires_auth,
                        $request,
                    ),
                ]),
            'services' => Service::query()->orderBy('sort_order')->get(),
            'products' => Product::query()->orderBy('id')->get(),
            'departments' => Department::query()->orderBy('sort_order')->orderBy('id')->get(),
            'team_members' => TeamMember::query()->with('department')->orderBy('sort_order')->orderBy('id')->get(),
            'partners' => Partner::query()->where('is_active', true)->orderBy('id')->get(),
            'pages' => Page::query()->orderBy('id')->get(),
            'banners' => Banner::query()->where('is_active', true)->orderBy('id')->get(),
            'settings' => $this->groupedPublicSettings(),
        ];
    }

    private function groupedPublicSettings(): array
    {
        $rows = Setting::query()->whereIn('group', [
            'company',
            'map',
            'seo',
            'site',
            'login',
            'appearance',
            'logos',
            'pages_config',
        ])->get();
        $result = [];
        foreach ($rows as $row) {
            $decoded = json_decode((string) $row->value, true);
            $result[$row->group][$row->key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $row->value;
        }

        return $result;
    }
}
