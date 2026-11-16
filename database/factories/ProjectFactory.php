<?php

namespace Database\Factories;

use App\Enums\ProjectStatusEnum;
use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(5);
        return [
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(100, 9999),
            'title_fa' => 'پروژه مهندسی و ساخت تجهیزات سرچاهی ' . $this->faker->city(),
            'title_en' => $title,
            'category_id' => ProjectCategory::factory(),
            'client_name_fa' => 'شرکت بهره‌برداری نفت و گاز کارون',
            'client_name_en' => 'Karoon Oil & Gas Production Co.',
            'contract_number' => 'PPA-' . $this->faker->numerify('403-###'),
            'year' => 1403,
            'status' => ProjectStatusEnum::COMPLETED,
            'summary_fa' => 'ساخت و آزمون تجهیزات سرچاهی بر اساس استاندارد API 6A',
            'standards' => ['API 6A', 'ISO 29001:2020'],
            'cover_image' => '/storage/products/wellhead-api6a.png',
            'is_featured' => true,
        ];
    }
}
