<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table): void {
            $table->id();
            $table->string('contract_number', 120)->index();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('client_fa')->index();
            $table->string('client_en');
            $table->decimal('amount_billion_irr', 12, 2)->default(0);
            $table->unsignedSmallInteger('start_year')->index();
            $table->unsignedSmallInteger('end_year')->nullable();
            $table->string('status', 32)->default('active')->index();
            $table->text('scope_fa')->nullable();
            $table->text('scope_en')->nullable();
            $table->string('document_url')->nullable();
            $table->boolean('requires_auth')->default(false);
            $table->timestamps();
        });

        Schema::create('contract_documents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('file_url');
            $table->string('document_type', 40)->default('contract_pdf');
            $table->boolean('requires_auth')->default(true);
            $table->timestamps();
        });

        Schema::create('licenses', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->index();
            $table->string('title_fa');
            $table->string('title_en');
            $table->string('issuer_fa');
            $table->string('issuer_en');
            $table->string('issue_date', 30);
            $table->string('expiry_date', 30)->nullable();
            $table->string('category', 40)->default('iso')->index();
            $table->string('image_url');
            $table->string('document_url')->nullable();
            $table->boolean('requires_auth')->default(false);
            $table->timestamps();
        });

        Schema::create('license_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('license_id')->constrained('licenses')->cascadeOnDelete();
            $table->string('title_fa');
            $table->string('file_url');
            $table->boolean('requires_auth')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('license_attachments');
        Schema::dropIfExists('licenses');
        Schema::dropIfExists('contract_documents');
        Schema::dropIfExists('contracts');
    }
};
