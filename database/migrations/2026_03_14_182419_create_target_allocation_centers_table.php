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
        Schema::create('target_allocation_centers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('target_allocation_id');
            $table->unsignedBigInteger('training_center_id');
            $table->integer('proposed_target')->default(0);
            $table->integer('target_validity_months')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('target_allocation_centers');
    }
};
