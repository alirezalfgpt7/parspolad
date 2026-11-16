<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'title_fa' => 'بنر اطلاع‌رسانی',
            'title_en' => 'Portal Announcement',
            'subtitle_fa' => '',
            'subtitle_en' => '',
            'cta_text_fa' => 'مشاهده پروژه‌ها',
            'cta_text_en' => 'View Projects',
            'cta_link' => '/projects',
            'image_url' => '/images/qc_testing_lab_1794834723950.jpg',
            'placement' => 'home',
            'is_active' => true,
        ];
    }
}
