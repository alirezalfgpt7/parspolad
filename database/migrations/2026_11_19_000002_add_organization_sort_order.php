<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::table('team_members', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table): void {
            $table->dropColumn('sort_order');
        });

        Schema::table('departments', function (Blueprint $table): void {
            $table->dropColumn('sort_order');
        });
    }
};
