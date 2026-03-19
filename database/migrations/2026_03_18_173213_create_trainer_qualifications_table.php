<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trainer_qualifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sector_id')->constrained()->cascadeOnDelete();
            $table->foreignId('job_role_id')->constrained()->cascadeOnDelete();
            $table->string('qp_code')->nullable();
            $table->string('version')->nullable();
            $table->string('training_type')->nullable(); // Online, Offline
            $table->boolean('is_certified')->default(false);
            $table->string('certificate_number')->nullable();
            $table->string('certificate_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainer_qualifications');
    }
};
