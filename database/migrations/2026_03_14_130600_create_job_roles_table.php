<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sector_id')->constrained('sectors')->cascadeOnDelete();
            $table->string('name');
            $table->string('qp_code')->nullable();
            $table->string('qp_version')->nullable();
            $table->string('nsqf_level')->nullable();
            $table->string('category')->nullable();
            $table->integer('training_hours')->nullable();
            $table->integer('ojt_hours')->nullable();
            $table->integer('total_hours')->nullable();
            $table->decimal('cost_per_hour', 10, 2)->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('syllabus_file')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_roles');
    }
};
