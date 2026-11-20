<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('name_fa', 100);
            $table->string('name_en', 100);
            $table->timestamps();
        });

        Schema::table('articles', function (Blueprint $table): void {
            $table->foreignId('article_category_id')
                ->nullable()
                ->constrained('article_categories')
                ->nullOnDelete();
        });

        $timestamp = date('Y-m-d H:i:s');
        DB::table('articles')
            ->select(['category_fa', 'category_en'])
            ->distinct()
            ->get()
            ->each(function (object $category) use ($timestamp): void {
                $slug = Str::slug($category->category_en) ?: 'category';
                $categoryId = DB::table('article_categories')->insertGetId([
                    'slug' => $slug.'-'.substr(sha1($category->category_fa.'|'.$category->category_en), 0, 8),
                    'name_fa' => $category->category_fa,
                    'name_en' => $category->category_en,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);

                DB::table('articles')
                    ->where('category_fa', $category->category_fa)
                    ->where('category_en', $category->category_en)
                    ->update(['article_category_id' => $categoryId]);
            });

        Schema::table('products', function (Blueprint $table): void {
            $table->json('specs_en')->nullable();
        });

        Schema::table('kpis', function (Blueprint $table): void {
            $table->string('icon', 60)->nullable();
            $table->string('background_color', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table): void {
            $table->dropColumn(['icon', 'background_color']);
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('specs_en');
        });

        Schema::table('articles', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('article_category_id');
        });

        Schema::dropIfExists('article_categories');
    }
};
