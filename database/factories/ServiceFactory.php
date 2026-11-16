<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(3);

        return [
            'slug' => Str::slug($title),
            'title_fa' => 'خدمت مهندسی ' . $this->faker->unique()->numberBetween(1, 99999),
            'title_en' => $title,
            'summary_fa' => $this->faker->sentence(),
            'summary_en' => $this->faker->sentence(),
            'description_fa' => $this->faker->paragraph(),
            'description_en' => $this->faker->paragraph(),
            'icon' => 'Factory',
            'image_url' => '/images/qc_testing_lab_1794834723950.jpg',
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }
}
