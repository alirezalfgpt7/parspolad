<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->index('created_at', 'contact_messages_created_at_index');
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->index('created_at', 'notifications_created_at_index');
            $table->index(['user_id', 'created_at'], 'notifications_user_created_at_index');
        });

        Schema::table('media_files', function (Blueprint $table): void {
            $table->index('created_at', 'media_files_created_at_index');
        });

        Schema::table('activity_log', function (Blueprint $table): void {
            $table->index('created_at', 'activity_log_created_at_index');
        });

        Schema::table('article_comments', function (Blueprint $table): void {
            $table->index(['status', 'created_at'], 'article_comments_status_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('article_comments', function (Blueprint $table): void {
            $table->dropIndex('article_comments_status_created_at_index');
        });

        Schema::table('activity_log', function (Blueprint $table): void {
            $table->dropIndex('activity_log_created_at_index');
        });

        Schema::table('media_files', function (Blueprint $table): void {
            $table->dropIndex('media_files_created_at_index');
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropIndex('notifications_created_at_index');
            $table->dropIndex('notifications_user_created_at_index');
        });

        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropIndex('contact_messages_created_at_index');
        });
    }
};
