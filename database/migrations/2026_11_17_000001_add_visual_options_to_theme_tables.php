<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('theme_settings', function (Blueprint $table): void {
            $table->string('design_style', 20)->default('modern');
            $table->string('button_shape', 20)->default('rounded');
        });

        Schema::table('theme_presets', function (Blueprint $table): void {
            $table->string('design_style', 20)->default('modern');
            $table->string('button_shape', 20)->default('rounded');
        });
    }

    public function down(): void
    {
        Schema::table('theme_settings', function (Blueprint $table): void {
            $table->dropColumn(['design_style', 'button_shape']);
        });

        Schema::table('theme_presets', function (Blueprint $table): void {
            $table->dropColumn(['design_style', 'button_shape']);
        });
    }
};
