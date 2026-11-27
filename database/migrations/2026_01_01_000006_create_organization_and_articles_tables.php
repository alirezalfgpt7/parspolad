<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('name_fa');
            $table->string('name_en');
            $table->string('head_name_fa');
            $table->string('head_name_en');
            $table->string('head_title_fa');
            $table->string('head_title_en');
            $table->string('color', 20)->default('#B91C1C');
            $table->unsignedInteger('member_count')->default(1);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('team_members', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->string('name_fa');
            $table->string('name_en');
            $table->string('role_fa');
            $table->string('role_en');
            $table->unsignedSmallInteger('experience_years')->default(5);
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('avatar_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('partners', function (Blueprint $table): void {
            $table->id();
            $table->string('name_fa');
            $table->string('name_en');
            $table->string('logo_url');
            $table->string('sector_fa')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('article_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('name_fa', 100);
            $table->string('name_en', 100);
            $table->timestamps();
        });

        Schema::create('articles', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->foreignId('article_category_id')
                ->nullable()
                ->constrained('article_categories')
                ->nullOnDelete();
            $table->string('title_fa');
            $table->string('title_en');
            $table->text('excerpt_fa');
            $table->text('excerpt_en')->nullable();
            $table->longText('content_fa');
            $table->longText('content_en')->nullable();
            $table->string('category_fa', 80)->index();
            $table->string('category_en', 80);
            $table->string('cover_image');
            $table->string('image_fit', 16)->default('cover');
            $table->string('author_fa', 120);
            $table->string('published_at', 30)->index();
            $table->unsignedSmallInteger('read_minutes')->default(5);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
        Schema::dropIfExists('article_categories');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('departments');
    }
};
