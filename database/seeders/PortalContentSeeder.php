<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Banner;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Faq;
use App\Models\Kpi;
use App\Models\License;
use App\Models\MediaFile;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\NotificationTemplate;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\ProjectDocument;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Slide;
use App\Models\Slider;
use App\Models\TeamMember;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use RuntimeException;

class PortalContentSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/portal-content.json');
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Unable to read portal seed data at [{$path}].");
        }

        $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);

        $this->seedThemes($data);
        $this->seedSettings($data['settings']);
        $this->seedMenus($data['menus']);
        $this->seedSliders($data['sliders']);
        $this->seedCatalog($data);
        $this->seedOrganization($data);
        $this->seedCms($data);
        $this->seedFaqs($data['faqs']);
    }

    private function seedFaqs(array $faqs): void
    {
        foreach ($faqs as $faq) {
            $this->upsert(Faq::class, 'question_fa', $faq);
        }
    }

    private function seedThemes(array $data): void
    {
        foreach ($data['theme_presets'] as $preset) {
            $this->upsert(ThemePreset::class, 'slug', $preset);
        }

        $settings = ThemeSetting::query()->first() ?? new ThemeSetting;
        $settings->fill(Arr::only($data['theme_settings'], $settings->getFillable()));
        $settings->save();
    }

    private function seedSettings(array $groups): void
    {
        foreach ($groups as $group => $values) {
            foreach ($values as $key => $value) {
                Setting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $group,
                        'value' => is_scalar($value) ? (string) $value : json_encode($value, JSON_THROW_ON_ERROR),
                        'is_encrypted' => false,
                    ],
                );
            }
        }

    }

    private function seedMenus(array $menus): void
    {
        foreach ($menus as $menuData) {
            $menu = $this->upsert(Menu::class, 'key', $menuData);

            foreach ($menuData['items'] as $item) {
                $this->seedMenuItem($menu, $item, null);
            }
        }
    }

    private function seedMenuItem(Menu $menu, array $itemData, ?int $parentId): void
    {
        $attributes = Arr::only($itemData, (new MenuItem)->getFillable());
        unset($attributes['menu_id'], $attributes['parent_id']);

        $item = MenuItem::query()->updateOrCreate(
            [
                'menu_id' => $menu->id,
                'parent_id' => $parentId,
                'title_fa' => $itemData['title_fa'],
                'url' => $itemData['url'],
            ],
            $attributes,
        );

        foreach ($itemData['children'] ?? [] as $child) {
            $this->seedMenuItem($menu, $child, $item->id);
        }
    }

    private function seedSliders(array $sliders): void
    {
        foreach ($sliders as $sliderData) {
            $slider = $this->upsert(Slider::class, 'key', $sliderData);

            foreach ($sliderData['slides'] as $sortOrder => $slideData) {
                $attributes = Arr::only($slideData, (new Slide)->getFillable());
                unset($attributes['slider_id']);
                $attributes['sort_order'] = $slideData['sort_order'] ?? $sortOrder + 1;

                $this->queryFor(Slide::class)->updateOrCreate(
                    [
                        'slider_id' => $slider->id,
                        'title_fa' => $slideData['title_fa'],
                        'sort_order' => $attributes['sort_order'],
                    ],
                    $attributes + ['slider_id' => $slider->id],
                );
            }
        }
    }

    private function seedCatalog(array $data): void
    {
        $categoryIds = [];
        foreach ($data['project_categories'] as $categoryData) {
            $category = $this->upsert(ProjectCategory::class, 'slug', $categoryData);
            $categoryIds[$categoryData['id']] = $category->id;
        }

        foreach ($data['projects'] as $projectData) {
            $projectData['category_id'] = $categoryIds[$projectData['category_id']];
            $project = $this->upsert(Project::class, 'slug', $projectData);

            foreach ($projectData['images'] as $sortOrder => $image) {
                $project->images()->updateOrCreate(
                    ['image_url' => $image],
                    ['sort_order' => $sortOrder],
                );
            }

            foreach ($projectData['videos'] as $sortOrder => $video) {
                $project->videos()->updateOrCreate(
                    ['video_url' => $video],
                    ['sort_order' => $sortOrder],
                );
            }

            foreach ($projectData['documents'] as $document) {
                $project->documents()->updateOrCreate(
                    ['file_url' => $document['file_url']],
                    Arr::only($document, (new ProjectDocument)->getFillable()),
                );
            }
        }

        foreach ($data['contracts'] as $contract) {
            $this->upsert(Contract::class, 'contract_number', $contract);
        }

        foreach ($data['licenses'] as $license) {
            $this->upsert(License::class, 'code', $license);
        }

        foreach ($data['services'] as $service) {
            $this->upsert(Service::class, 'slug', $service);
        }

        foreach ($data['products'] as $product) {
            $this->upsert(Product::class, 'slug', $product);
        }
    }

    private function seedOrganization(array $data): void
    {
        $departmentIds = [];

        foreach ($data['departments'] as $departmentData) {
            if ($departmentData['parent_id'] !== null) {
                continue;
            }

            $department = $this->upsert(Department::class, 'name_en', $departmentData);
            $departmentIds[$departmentData['id']] = $department->id;
        }

        foreach ($data['departments'] as $departmentData) {
            if ($departmentData['parent_id'] === null) {
                continue;
            }

            $departmentData['parent_id'] = $departmentIds[$departmentData['parent_id']];
            $department = $this->upsert(Department::class, 'name_en', $departmentData);
            $departmentIds[$departmentData['id']] = $department->id;
        }

        foreach ($data['team_members'] as $memberData) {
            $memberData['department_id'] = $departmentIds[$memberData['department_id']];
            $member = new TeamMember;
            $this->queryFor(TeamMember::class)->updateOrCreate(
                [
                    'department_id' => $memberData['department_id'],
                    'name_en' => $memberData['name_en'],
                ],
                Arr::only($memberData, $member->getFillable()),
            );
        }

        foreach ($data['partners'] as $partner) {
            $this->queryFor(Partner::class)->updateOrCreate(
                ['name_en' => $partner['name_en']],
                Arr::only($partner, (new Partner)->getFillable()),
            );
        }
    }

    private function seedCms(array $data): void
    {
        foreach ($data['banners'] as $banner) {
            $this->queryFor(Banner::class)->updateOrCreate(
                ['placement' => $banner['placement'], 'title_fa' => $banner['title_fa']],
                Arr::only($banner, (new Banner)->getFillable()),
            );
        }

        foreach ($data['kpis'] as $kpi) {
            $this->upsert(Kpi::class, 'key', $kpi);
        }

        foreach ($data['articles'] as $article) {
            $this->upsert(Article::class, 'slug', $article);
        }

        foreach ($data['pages'] as $page) {
            $this->upsert(Page::class, 'slug', $page);
        }

        foreach ($data['notification_templates'] as $template) {
            $this->upsert(NotificationTemplate::class, 'event_key', $template);
        }

        foreach ($data['media'] as $media) {
            $this->queryFor(MediaFile::class)->updateOrCreate(
                ['url' => $media['url']],
                Arr::only($media, (new MediaFile)->getFillable()),
            );
        }
    }

    private function upsert(string $modelClass, string $key, array $attributes): Model
    {
        $model = new $modelClass;

        return $this->queryFor($modelClass)->updateOrCreate(
            [$key => $attributes[$key]],
            Arr::only($attributes, $model->getFillable()),
        );
    }

    private function queryFor(string $modelClass): Builder
    {
        return in_array(SoftDeletes::class, class_uses_recursive($modelClass), true)
            ? $modelClass::withTrashed()
            : $modelClass::query();
    }
}
