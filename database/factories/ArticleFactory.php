<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(5);

        return [
            'slug' => Str::slug($title),
            'title_fa' => 'گزارش فنی ' . $this->faker->unique()->numberBetween(1, 99999),
            'title_en' => $title,
            'excerpt_fa' => $this->faker->sentence(),
            'excerpt_en' => $this->faker->sentence(),
            'content_fa' => $this->faker->paragraphs(3, true),
            'content_en' => $this->faker->paragraphs(3, true),
            'category_fa' => 'اخبار',
            'category_en' => 'News',
            'cover_image' => '/images/qc_testing_lab_1794834723950.jpg',
            'author_fa' => 'واحد روابط عمومی',
            'published_at' => now(),
            'read_minutes' => $this->faker->numberBetween(2, 12),
        ];
    }
}
