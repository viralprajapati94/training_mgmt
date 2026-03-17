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
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tp_id')->constrained('training_partners')->onDelete('cascade');
            $table->foreignId('tc_id')->constrained('training_centers')->onDelete('cascade');
            $table->string('gtr_id')->unique();
            $table->string('name');
            $table->string('aadhaar_number', 12)->unique();
            $table->string('pan_number', 10)->unique();
            $table->string('email')->nullable();
            $table->string('mobile', 15);
            $table->boolean('status')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainers');
    }
};
