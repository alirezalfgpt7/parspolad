<?php

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

class FaqFactory extends Factory
{
    protected $model = Faq::class;

    public function definition(): array
    {
        return [
            'question_fa' => 'پرسش ' . $this->faker->unique()->numberBetween(1, 99999),
            'question_en' => $this->faker->sentence() . '?',
            'answer_fa' => $this->faker->paragraph(),
            'answer_en' => $this->faker->paragraph(),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'is_active' => true,
        ];
    }
}
