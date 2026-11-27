<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table): void {
            $table->id();
            $table->string('group', 64)->index();
            $table->string('key', 120)->unique();
            $table->text('value')->nullable();
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();
        });

        Schema::create('theme_presets', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name_fa');
            $table->string('name_en');
            $table->boolean('is_default')->default(false);
            $table->string('design_style', 20)->default('modern');
            $table->string('button_shape', 20)->default('rounded');
            $table->string('button_effect', 20)->default('shimmer');
            $table->json('palette');
            $table->timestamps();
        });

        Schema::create('theme_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('active_preset_slug', 80)->default('industrial-crimson');
            $table->string('default_mode', 10)->default('light');
            $table->string('design_style', 20)->default('modern');
            $table->string('button_shape', 20)->default('rounded');
            $table->string('button_effect', 20)->default('shimmer');
            $table->json('active_palette');
            $table->boolean('landing_theme_enabled')->default(true);
            $table->json('landing_palette');
            $table->string('landing_design_style', 20)->default('modern');
            $table->string('landing_button_shape', 20)->default('rounded');
            $table->string('landing_button_effect', 20)->default('liquid');
            $table->json('admin_palette')->nullable();
            $table->string('admin_design_style', 20)->default('modern');
            $table->string('admin_button_shape', 20)->default('rounded');
            $table->string('admin_button_effect', 20)->default('glow');
            $table->json('landing_header_settings')->nullable();
            $table->json('public_page_title_settings')->nullable();
            $table->timestamps();
        });

        Schema::create('email_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('smtp_host');
            $table->unsignedInteger('smtp_port')->default(587);
            $table->string('smtp_user')->nullable();
            $table->text('smtp_password_encrypted')->nullable();
            $table->string('from_address');
            $table->string('from_name');
            $table->timestamps();
        });

        Schema::create('sms_provider_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('provider', 40)->default('kavenegar');
            $table->text('api_key_encrypted')->nullable();
            $table->string('sender_line', 40)->nullable();
            $table->boolean('enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_provider_settings');
        Schema::dropIfExists('email_settings');
        Schema::dropIfExists('theme_settings');
        Schema::dropIfExists('theme_presets');
        Schema::dropIfExists('settings');
    }
};
