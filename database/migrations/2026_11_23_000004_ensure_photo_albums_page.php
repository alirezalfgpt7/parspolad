<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('pages')->where('slug', 'albums')->exists()) {
            return;
        }

        DB::table('pages')->insert([
            'slug' => 'albums',
            'title_fa' => 'آلبوم تصاویر',
            'title_en' => 'Photo Albums',
            'subtitle_fa' => 'تصاویر پروژه‌ها، تجهیزات و فعالیت‌های اجرایی را در مجموعه‌های موضوعی مشاهده کنید.',
            'subtitle_en' => 'Explore projects, equipment and field operations through curated photo collections.',
            'content_fa' => '',
            'content_en' => '',
            'meta_title' => 'آلبوم تصاویر | پارس پولاد آقایی',
            'meta_description' => 'مجموعهٔ تصاویر پروژه‌ها و فعالیت‌های پارس پولاد آقایی.',
            'metadata' => json_encode(['path' => '/albums'], JSON_THROW_ON_ERROR),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void {}
};
