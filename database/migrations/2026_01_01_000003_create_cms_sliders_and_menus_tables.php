<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('subtitle_fa')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->longText('content_fa');
            $table->longText('content_en')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('meta_title_en')->nullable();
            $table->text('meta_description_en')->nullable();
            $table->string('meta_image')->nullable();
            $table->string('canonical_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('menus', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('title_fa');
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('url');
            $table->string('icon', 60)->nullable();
            $table->string('image')->nullable();
            $table->string('description_fa')->nullable();
            $table->string('description_en')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('sliders', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 60)->unique();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('page_slug', 80)->default('home');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('slides', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('slider_id')->constrained('sliders')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('subtitle_fa')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('cta_text_fa', 120)->nullable();
            $table->string('cta_text_en', 120)->nullable();
            $table->string('cta_link')->default('/projects');
            $table->string('media_type', 16)->default('image');
            $table->string('desktop_media');
            $table->string('mobile_media')->nullable();
            $table->string('text_position', 16)->default('right');
            $table->string('text_color', 20)->default('#FFFFFF');
            $table->string('button_color', 20)->default('#B91C1C');
            $table->string('overlay_gradient')->nullable();
            $table->unsignedInteger('duration_ms')->default(6000);
            $table->string('effect', 32)->default('ken-burns');
            $table->string('text_animation', 32)->default('fade-up');
            $table->boolean('particles_enabled')->default(true);
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('subtitle_fa')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('cta_text_fa', 120)->nullable();
            $table->string('cta_text_en', 120)->nullable();
            $table->string('cta_link')->default('/rfq');
            $table->string('image_url');
            $table->string('placement', 40)->default('landing_mid')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('kpis', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 60)->unique();
            $table->string('label_fa');
            $table->string('label_en');
            $table->unsignedInteger('value')->default(0);
            $table->string('suffix_fa', 30)->default('+');
            $table->string('suffix_en', 30)->default('+');
            $table->string('icon', 60)->nullable();
            $table->string('background_color', 20)->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('kpis');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('slides');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('pages');
    }
};
