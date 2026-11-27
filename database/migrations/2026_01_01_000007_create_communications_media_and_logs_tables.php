<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 30);
            $table->string('company')->nullable();
            $table->string('subject');
            $table->longText('message');
            $table->string('type', 20)->default('contact')->index();
            $table->string('attachment_url')->nullable();
            $table->string('status', 20)->default('new')->index();
            $table->text('admin_note')->nullable();
            $table->index('created_at', 'contact_messages_created_at_index');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('title_en');
            $table->text('body_fa');
            $table->text('body_en');
            $table->string('channel', 20)->default('in_app')->index();
            $table->boolean('is_read')->default(false)->index();
            $table->index('created_at', 'notifications_created_at_index');
            $table->index(['user_id', 'created_at'], 'notifications_user_created_at_index');
            $table->timestamps();
        });

        Schema::create('notification_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('event_key', 80)->unique();
            $table->string('name_fa');
            $table->string('channel', 20)->default('email');
            $table->string('subject_fa');
            $table->longText('body_html')->nullable();
            $table->text('sms_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('media_files', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('storage_path')->nullable();
            $table->foreignId('source_media_id')->nullable()
                ->constrained('media_files')
                ->nullOnDelete();
            $table->string('variant', 32)->nullable();
            $table->string('mime_type', 100);
            $table->string('extension', 20)->index();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->string('folder', 80)->default('uploads')->index();
            $table->boolean('requires_auth')->default(false);
            $table->string('alt_text', 255)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['source_media_id', 'variant'], 'media_files_source_variant_unique');
            $table->index('created_at', 'media_files_created_at_index');
        });

        Schema::create('activity_log', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('log_name')->nullable()->index();
            $table->text('description');
            $table->nullableMorphs('subject', 'subject');
            $table->nullableMorphs('causer', 'causer');
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('event')->nullable();
            $table->uuid('batch_uuid')->nullable();
            $table->index('created_at', 'activity_log_created_at_index');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_log');
        Schema::dropIfExists('media_files');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('contact_messages');
    }
};
