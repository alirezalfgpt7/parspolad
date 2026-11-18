<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('article_comments', function (Blueprint $table): void {
            $table->foreignId('parent_id')
                ->nullable()
                ->after('article_id')
                ->constrained('article_comments')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('article_comments', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('parent_id');
        });
    }
};
