<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_partner_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_partner_id')->constrained('training_partners')->cascadeOnDelete();
            $table->foreignId('document_master_id')->constrained('documents_master')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->timestamps();
            $table->unique(['training_partner_id', 'document_master_id'], 'tp_document_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_partner_documents');
    }
};
