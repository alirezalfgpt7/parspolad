<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);

        return [
            'slug' => Str::slug($name),
            'name_fa' => 'تجهیزات صنعتی ' . $this->faker->unique()->numberBetween(1, 99999),
            'name_en' => $name,
            'category_fa' => 'تجهیزات سرچاهی',
            'category_en' => 'Wellhead Equipment',
            'model_code' => 'PPA-' . $this->faker->unique()->numerify('###-####'),
            'pressure_rating' => '5000 PSI',
            'standard' => 'API 6A',
            'summary_fa' => $this->faker->sentence(),
            'summary_en' => $this->faker->sentence(),
            'specs' => [],
            'image_url' => '/images/qc_testing_lab_1794834723950.jpg',
            'catalog_url' => null,
        ];
    }
}
