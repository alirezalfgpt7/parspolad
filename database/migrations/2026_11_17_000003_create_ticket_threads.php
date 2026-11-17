<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->string('tracking_number', 24)->nullable()->unique();
            $table->string('ticket_status', 32)->nullable()->index();
            $table->string('priority', 16)->nullable()->index();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::create('ticket_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contact_message_id')->constrained('contact_messages')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name', 120);
            $table->string('author_type', 16)->default('customer');
            $table->longText('body');
            $table->boolean('is_internal')->default(false);
            $table->timestamps();
            $table->index(['contact_message_id', 'created_at']);
        });

        Schema::create('ticket_histories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contact_message_id')->constrained('contact_messages')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_histories');
        Schema::dropIfExists('ticket_messages');
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropForeign(['assignee_id']);
            $table->dropUnique(['tracking_number']);
            $table->dropIndex(['ticket_status']);
            $table->dropIndex(['priority']);
            $table->dropColumn(['tracking_number', 'ticket_status', 'priority', 'assignee_id']);
        });
    }
};
