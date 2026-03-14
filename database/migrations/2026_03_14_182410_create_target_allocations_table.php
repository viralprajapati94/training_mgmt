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
        Schema::create('target_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('training_partner_id');
            $table->string('work_order_no');
            $table->unsignedBigInteger('scheme_id');
            $table->string('project_type')->nullable();
            $table->unsignedBigInteger('assessment_body_id')->nullable();
            $table->date('project_duration_from')->nullable();
            $table->date('project_duration_to')->nullable();
            $table->date('agreement_date')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('target_allocations');
    }
};
