<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeamMemberFactory extends Factory
{
    protected $model = TeamMember::class;

    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'name_fa' => $this->faker->name(),
            'name_en' => $this->faker->name(),
            'role_fa' => 'کارشناس فنی',
            'role_en' => 'Technical Specialist',
            'experience_years' => $this->faker->numberBetween(1, 35),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('09#########'),
            'avatar_url' => '/images/qc_testing_lab_1794834723950.jpg',
        ];
    }
}
