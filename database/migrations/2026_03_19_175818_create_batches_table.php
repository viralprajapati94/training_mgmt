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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_center_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_partner_id')->constrained()->cascadeOnDelete();
            $table->string('training_type');
            $table->integer('batch_size');
            $table->string('batch_type');
            $table->foreignId('job_role_id')->constrained()->cascadeOnDelete();
            $table->string('qp_code')->nullable();
            $table->foreignId('sector_id')->constrained()->cascadeOnDelete();
            $table->string('nsqf_level')->nullable();
            $table->string('version')->nullable();
            $table->string('education_requirement')->nullable();
            $table->string('training_hours_per_day')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->date('freeze_date')->nullable();
            $table->integer('target_available')->default(0);
            $table->integer('eligible_to_create')->default(0);
            $table->integer('registered_to_enroll')->default(0);
            $table->integer('enrolled_so_far')->default(0);
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected', 'modified_by_tp'])->default('draft');
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
