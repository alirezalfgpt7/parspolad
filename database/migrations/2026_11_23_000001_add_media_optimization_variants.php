<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media_files', function (Blueprint $table): void {
            $table->foreignId('source_media_id')->nullable()->after('storage_path')
                ->constrained('media_files')->nullOnDelete();
            $table->string('variant', 32)->nullable()->after('source_media_id');
            $table->unique(['source_media_id', 'variant'], 'media_files_source_variant_unique');
        });
    }

    public function down(): void
    {
        Schema::table('media_files', function (Blueprint $table): void {
            $table->dropUnique('media_files_source_variant_unique');
            $table->dropConstrainedForeignId('source_media_id');
            $table->dropColumn('variant');
        });
    }
};
