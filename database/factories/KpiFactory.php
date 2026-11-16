<?php

namespace Database\Factories;

use App\Models\Kpi;
use Illuminate\Database\Eloquent\Factories\Factory;

class KpiFactory extends Factory
{
    protected $model = Kpi::class;

    public function definition(): array
    {
        return [
            'key' => 'kpi-' . $this->faker->unique()->numberBetween(1, 99999),
            'label_fa' => 'شاخص فنی',
            'label_en' => 'Technical Metric',
            'value' => $this->faker->numberBetween(1, 1000),
            'suffix_fa' => '+',
            'suffix_en' => '+',
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }
}
