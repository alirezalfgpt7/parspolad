<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name_fa');
            $table->string('name_en');
            $table->string('icon', 60)->default('Wrench');
            $table->string('color', 20)->default('#B91C1C');
            $table->text('description_fa')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->string('title_fa');
            $table->string('title_en');
            $table->foreignId('category_id')->constrained('project_categories')->restrictOnDelete();
            $table->string('client_name_fa')->index();
            $table->string('client_name_en');
            $table->string('contract_number', 120)->index();
            $table->string('contract_type_fa')->nullable();
            $table->string('contract_type_en')->nullable();
            $table->string('location_fa')->nullable();
            $table->string('location_en')->nullable();
            $table->unsignedSmallInteger('year')->index();
            $table->string('status', 32)->default('completed')->index();
            $table->text('summary_fa');
            $table->text('summary_en')->nullable();
            $table->longText('description_fa')->nullable();
            $table->longText('description_en')->nullable();
            $table->json('standards')->nullable();
            $table->string('cover_image');
            $table->boolean('is_featured')->default(false)->index();
            $table->index(['category_id', 'year'], 'projects_category_year_index');
            $table->index(['status', 'year'], 'projects_status_year_index');
            $table->index('location_fa', 'projects_location_fa_index');
            $table->index('location_en', 'projects_location_en_index');
            $table->index('contract_type_fa', 'projects_contract_type_fa_index');
            $table->index('contract_type_en', 'projects_contract_type_en_index');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('project_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('image_url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('project_videos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('video_url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('project_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('file_url');
            $table->string('file_type', 20)->default('pdf');
            $table->boolean('requires_auth')->default(false);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('title_fa');
            $table->string('title_en');
            $table->text('summary_fa');
            $table->text('summary_en')->nullable();
            $table->longText('description_fa')->nullable();
            $table->longText('description_en')->nullable();
            $table->string('icon', 60)->default('Settings');
            $table->string('image_url');
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('name_fa');
            $table->string('name_en');
            $table->string('category_fa')->index();
            $table->string('category_en');
            $table->string('model_code', 80)->index();
            $table->string('pressure_rating', 60)->nullable();
            $table->string('standard', 120);
            $table->text('summary_fa');
            $table->text('summary_en')->nullable();
            $table->json('specs')->nullable();
            $table->json('specs_en')->nullable();
            $table->string('image_url');
            $table->string('catalog_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('machinery_assets', function (Blueprint $table): void {
            $table->id();
            $table->string('source_key')->nullable()->unique();
            $table->string('name_fa')->nullable();
            $table->string('name_en')->nullable();
            $table->string('asset_code')->nullable();
            $table->string('model')->nullable();
            $table->string('year')->nullable();
            $table->string('location_fa')->nullable();
            $table->string('location_en')->nullable();
            $table->string('manufacturer_fa')->nullable();
            $table->string('manufacturer_en')->nullable();
            $table->string('serial_number')->nullable();
            $table->text('notes_fa')->nullable();
            $table->text('notes_en')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('machinery_assets');
        Schema::dropIfExists('products');
        Schema::dropIfExists('services');
        Schema::dropIfExists('project_documents');
        Schema::dropIfExists('project_videos');
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('project_categories');
    }
};
