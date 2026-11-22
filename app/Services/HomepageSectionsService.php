<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Banner;
use App\Models\Kpi;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Project;
use App\Models\Service;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class HomepageSectionsService
{
    public function get(): array
    {
        $metadata = Page::query()->where('slug', 'home-spotlight')->first()?->metadata ?? [];
        $sections = is_array($metadata) && is_array($metadata['home_sections'] ?? null)
            ? $metadata['home_sections']
            : [];

        return [
            'projects' => $this->projects($this->section($sections, 'projects', ['latest', 'oldest', 'featured', 'selected'], 6)),
            'articles' => $this->articles($this->section($sections, 'articles', ['latest', 'oldest', 'selected'], 3)),
            'services' => $this->services($this->section($sections, 'services', ['ordered', 'selected'], 4)),
            'partners' => $this->partners($this->section($sections, 'partners', ['ordered', 'selected'], 50)),
            'kpis' => $this->kpis($this->section($sections, 'kpis', ['ordered', 'selected'], 50)),
            'banners' => $this->banners($this->section($sections, 'banners', ['ordered', 'selected'], 50)),
        ];
    }

    private function section(array $sections, string $key, array $allowedModes, int $defaultLimit): array
    {
        $value = $sections[$key] ?? [];
        $value = is_array($value) ? $value : [];
        $mode = in_array($value['mode'] ?? null, $allowedModes, true) ? $value['mode'] : $allowedModes[0];
        $limit = filter_var($value['limit'] ?? $defaultLimit, FILTER_VALIDATE_INT);

        return [
            'mode' => $mode,
            'limit' => max(0, min(50, $limit === false ? $defaultLimit : $limit)),
            'selected_items' => is_array($value['selected_items'] ?? null) ? $value['selected_items'] : [],
        ];
    }

    private function projects(array $settings): Collection
    {
        $query = Project::query()
            ->select([
                'id', 'slug', 'title_fa', 'title_en', 'category_id', 'client_name_fa',
                'client_name_en', 'contract_number', 'year', 'status', 'summary_fa',
                'summary_en', 'cover_image',
            ])
            ->with('category:id,slug,name_fa,name_en,icon,color');

        if ($settings['mode'] === 'featured') {
            $query->where('is_featured', true);
        }

        return $this->selectRecords($query, $settings, match ($settings['mode']) {
            'oldest' => ['year', 'asc'],
            default => ['year', 'desc'],
        });
    }

    private function articles(array $settings): Collection
    {
        $query = Article::query()->select([
            'id', 'slug', 'title_fa', 'title_en', 'excerpt_fa', 'excerpt_en',
            'category_fa', 'category_en', 'cover_image', 'image_fit', 'author_fa',
            'published_at', 'read_minutes',
        ]);

        return $this->selectRecords($query, $settings, [
            'published_at',
            $settings['mode'] === 'oldest' ? 'asc' : 'desc',
        ]);
    }

    private function services(array $settings): Collection
    {
        $query = Service::query()->select([
            'id', 'slug', 'title_fa', 'title_en', 'summary_fa', 'summary_en', 'image_url', 'sort_order',
        ]);

        return $this->selectRecords($query, $settings, ['sort_order', 'asc']);
    }

    private function partners(array $settings): Collection
    {
        $query = Partner::query()
            ->where('is_active', true)
            ->select(['id', 'name_fa', 'name_en', 'logo_url', 'sector_fa', 'is_active']);

        return $this->selectRecords($query, $settings, ['id', 'asc']);
    }

    private function kpis(array $settings): Collection
    {
        $query = Kpi::query()->select([
            'id', 'key', 'label_fa', 'label_en', 'value', 'suffix_fa', 'suffix_en',
            'icon', 'background_color', 'sort_order',
        ]);

        return $this->selectRecords($query, $settings, ['sort_order', 'asc']);
    }

    private function banners(array $settings): Collection
    {
        $query = Banner::query()
            ->where('is_active', true)
            ->where('placement', 'landing_mid')
            ->select([
                'id', 'title_fa', 'title_en', 'subtitle_fa', 'subtitle_en',
                'image_url', 'cta_text_fa', 'cta_text_en', 'cta_link', 'placement', 'is_active',
            ]);

        return $this->selectRecords($query, $settings, ['id', 'asc']);
    }

    private function selectRecords(Builder $query, array $settings, array $ordering): Collection
    {
        if ($settings['limit'] === 0) {
            return collect();
        }

        if ($settings['mode'] === 'selected') {
            $ids = collect($settings['selected_items'])
                ->map(fn (mixed $item): mixed => is_array($item) ? ($item['id'] ?? null) : $item)
                ->filter(fn (mixed $id): bool => filter_var($id, FILTER_VALIDATE_INT) !== false && (int) $id > 0)
                ->map(fn (mixed $id): int => (int) $id)
                ->unique()
                ->take(100)
                ->values();

            if ($ids->isEmpty()) {
                return collect();
            }

            $records = $query->whereIn('id', $ids)->get()->keyBy('id');

            return $ids->map(fn (int $id) => $records->get($id))
                ->filter()
                ->take($settings['limit'])
                ->values();
        }

        return $query
            ->orderBy($ordering[0], $ordering[1])
            ->orderBy('id', $ordering[1])
            ->limit($settings['limit'])
            ->get();
    }
}
