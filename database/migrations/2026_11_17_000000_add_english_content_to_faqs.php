<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faqs', function (Blueprint $table): void {
            $table->string('question_en', 500)->nullable()->after('question_fa');
            $table->text('answer_en')->nullable()->after('answer_fa');
        });
    }

    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table): void {
            $table->dropColumn(['question_en', 'answer_en']);
        });
    }
};
