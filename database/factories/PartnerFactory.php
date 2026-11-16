<?php

namespace Database\Factories;

use App\Models\Partner;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerFactory extends Factory
{
    protected $model = Partner::class;

    public function definition(): array
    {
        return [
            'name_fa' => 'کارفرمای صنعتی ' . $this->faker->unique()->numberBetween(1, 99999),
            'name_en' => $this->faker->unique()->company(),
            'logo_url' => '/images/qc_testing_lab_1794834723950.jpg',
            'sector_fa' => 'نفت و گاز',
            'website' => null,
            'is_active' => true,
        ];
    }
}
