<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('theme_settings', function (Blueprint $table): void {
            $table->string('button_effect', 20)->default('shimmer');
            $table->string('landing_design_style', 20)->default('modern');
            $table->string('landing_button_shape', 20)->default('rounded');
            $table->string('landing_button_effect', 20)->default('liquid');
            $table->json('admin_palette')->nullable();
            $table->string('admin_design_style', 20)->default('modern');
            $table->string('admin_button_shape', 20)->default('rounded');
            $table->string('admin_button_effect', 20)->default('glow');
        });

        Schema::table('theme_presets', function (Blueprint $table): void {
            $table->string('button_effect', 20)->default('shimmer');
        });
    }

    public function down(): void
    {
        Schema::table('theme_presets', function (Blueprint $table): void {
            $table->dropColumn('button_effect');
        });

        Schema::table('theme_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'button_effect',
                'landing_design_style',
                'landing_button_shape',
                'landing_button_effect',
                'admin_palette',
                'admin_design_style',
                'admin_button_shape',
                'admin_button_effect',
            ]);
        });
    }
};
