<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(4);

        return [
            'slug' => Str::slug($title),
            'title_fa' => 'صفحه ' . $this->faker->unique()->numberBetween(1, 99999),
            'title_en' => $title,
            'subtitle_fa' => '',
            'subtitle_en' => '',
            'content_fa' => $this->faker->paragraph(),
            'content_en' => $this->faker->paragraph(),
            'meta_title' => $title,
            'meta_description' => $this->faker->sentence(),
            'metadata' => [],
        ];
    }
}
