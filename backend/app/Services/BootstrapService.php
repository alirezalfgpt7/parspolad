<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Banner;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Kpi;
use App\Models\License;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Slider;
use App\Models\TeamMember;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;

class BootstrapService
{
    public function getPublicBootstrap(): array
    {
        return [
            'theme_presets' => ThemePreset::query()->orderBy('id')->get(),
            'theme_settings' => ThemeSetting::query()->first(),
            'sliders' => Slider::query()->with(['slides' => fn ($q) => $q->where('is_active', true)])->where('is_active', true)->get(),
            'menus' => Menu::query()->with('items')->get(),
            'kpis' => Kpi::query()->orderBy('sort_order')->get(),
            'project_categories' => ProjectCategory::query()->orderBy('id')->get(),
            'projects' => Project::query()->with(['category', 'images', 'videos', 'documents'])->orderByDesc('year')->get(),
            'contracts' => Contract::query()->with('documents')->orderByDesc('start_year')->get(),
            'licenses' => License::query()->with('attachments')->orderBy('id')->get(),
            'services' => Service::query()->orderBy('sort_order')->get(),
            'products' => Product::query()->orderBy('id')->get(),
            'departments' => Department::query()->with('members')->orderBy('id')->get(),
            'team_members' => TeamMember::query()->with('department')->orderBy('id')->get(),
            'partners' => Partner::query()->where('is_active', true)->orderBy('id')->get(),
            'articles' => Article::query()->orderByDesc('published_at')->get(),
            'pages' => Page::query()->orderBy('id')->get(),
            'banners' => Banner::query()->where('is_active', true)->orderBy('id')->get(),
            'settings' => $this->groupedPublicSettings(),
        ];
    }

    private function groupedPublicSettings(): array
    {
        $rows = Setting::query()->whereIn('group', ['company', 'map', 'seo', 'site'])->get();
        $result = [];
        foreach ($rows as $row) {
            $decoded = json_decode((string) $row->value, true);
            $result[$row->group][$row->key] = json_last_error() === JSON_ERROR_NONE ? $decoded : $row->value;
        }
        return $result;
    }
}
