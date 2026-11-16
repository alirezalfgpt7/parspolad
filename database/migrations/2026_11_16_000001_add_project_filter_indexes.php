<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->index(['category_id', 'year'], 'projects_category_year_index');
            $table->index(['status', 'year'], 'projects_status_year_index');
            $table->index('location_fa', 'projects_location_fa_index');
            $table->index('location_en', 'projects_location_en_index');
            $table->index('contract_type_fa', 'projects_contract_type_fa_index');
            $table->index('contract_type_en', 'projects_contract_type_en_index');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropIndex('projects_category_year_index');
            $table->dropIndex('projects_status_year_index');
            $table->dropIndex('projects_location_fa_index');
            $table->dropIndex('projects_location_en_index');
            $table->dropIndex('projects_contract_type_fa_index');
            $table->dropIndex('projects_contract_type_en_index');
        });
    }
};
