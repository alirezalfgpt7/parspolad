<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('site_daily_page_views', function (Blueprint $table): void {
            $table->id();
            $table->date('view_date');
            $table->string('path', 255);
            $table->unsignedBigInteger('views')->default(0);
            $table->timestamps();
            $table->unique(['view_date', 'path']);
            $table->index('view_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_daily_page_views');
    }
};
