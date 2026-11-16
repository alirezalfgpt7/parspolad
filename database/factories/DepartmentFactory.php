<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'parent_id' => null,
            'name_fa' => 'واحد ' . $this->faker->unique()->numberBetween(1, 99999),
            'name_en' => $this->faker->unique()->words(2, true),
            'head_name_fa' => $this->faker->name(),
            'head_name_en' => $this->faker->name(),
            'head_title_fa' => 'مدیر واحد',
            'head_title_en' => 'Department Manager',
            'color' => '#B91C1C',
            'member_count' => 0,
        ];
    }
}
