<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_albums', function (Blueprint $table): void {
            $table->id();
            $table->string('title_fa', 160);
            $table->string('title_en', 160);
            $table->string('slug', 100)->unique();
            $table->text('description_fa')->nullable();
            $table->text('description_en')->nullable();
            $table->foreignId('cover_media_id')->nullable()->constrained('media_files')->nullOnDelete();
            $table->string('layout', 20)->default('grid');
            $table->unsignedTinyInteger('columns')->default(3);
            $table->unsignedTinyInteger('rows')->default(2);
            $table->string('transition', 20)->default('fade');
            $table->unsignedSmallInteger('interval_ms')->default(5000);
            $table->string('image_effect', 20)->default('zoom');
            $table->string('card_effect', 20)->default('lift');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('photo_album_media', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('album_id')->constrained('photo_albums')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media_files')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['album_id', 'media_id']);
            $table->index(['album_id', 'sort_order']);
        });

        if (! DB::table('pages')->where('slug', 'albums')->exists()) {
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

        $headerMenuId = DB::table('menus')->where('key', 'header')->value('id');
        if ($headerMenuId && ! DB::table('menu_items')->where('menu_id', $headerMenuId)->where('url', '/albums')->exists()) {
            $sortOrder = (int) DB::table('menu_items')->where('menu_id', $headerMenuId)->max('sort_order') + 1;
            DB::table('menu_items')->insert([
                'menu_id' => $headerMenuId,
                'parent_id' => null,
                'title_fa' => 'آلبوم تصاویر',
                'title_en' => 'Photo Albums',
                'url' => '/albums',
                'icon' => 'Images',
                'sort_order' => $sortOrder,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('menu_items')
            ->where('url', '/albums')
            ->where('title_fa', 'آلبوم تصاویر')
            ->where('title_en', 'Photo Albums')
            ->where('icon', 'Images')
            ->delete();

        DB::table('pages')
            ->where('slug', 'albums')
            ->where('title_fa', 'آلبوم تصاویر')
            ->where('title_en', 'Photo Albums')
            ->delete();

        Schema::dropIfExists('photo_album_media');
        Schema::dropIfExists('photo_albums');
    }
};
