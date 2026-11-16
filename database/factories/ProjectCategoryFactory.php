<?php

namespace Database\Factories;

use App\Models\ProjectCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProjectCategoryFactory extends Factory
{
    protected $model = ProjectCategory::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'slug' => Str::slug($name),
            'name_fa' => 'دسته فنی '.$name,
            'name_en' => Str::title($name),
            'icon' => 'Wrench',
            'color' => '#B91C1C',
            'description_fa' => 'دسته‌بندی نمونه برای آزمون‌ها',
        ];
    }
}
