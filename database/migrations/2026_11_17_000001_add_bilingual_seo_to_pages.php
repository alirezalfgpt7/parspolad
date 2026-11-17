<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->string('meta_title_en')->nullable();
            $table->text('meta_description_en')->nullable();
            $table->string('meta_image')->nullable();
            $table->string('canonical_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropColumn(['meta_title_en', 'meta_description_en', 'meta_image', 'canonical_url']);
        });
    }
};
