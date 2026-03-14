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
        Schema::create('target_allocation_job_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('target_allocation_id');
            $table->unsignedBigInteger('sector_id');
            $table->unsignedBigInteger('job_role_id');
            $table->string('qp_code')->nullable();
            $table->string('nsqf_level')->nullable();
            $table->integer('training_hours')->nullable();
            $table->integer('target')->default(0);
            $table->integer('target_validity_months')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('target_allocation_job_roles');
    }
};
