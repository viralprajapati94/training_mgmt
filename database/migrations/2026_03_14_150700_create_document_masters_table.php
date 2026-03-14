<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents_master', function (Blueprint $table) {
            $table->id();
            $table->string('document_name', 125);
            $table->enum('role_type', ['training_partner', 'training_center', 'student']);    
            $table->boolean('is_required')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents_master');
    }
};
