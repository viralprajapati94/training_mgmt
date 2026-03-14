<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_partner_bank_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_partner_id')->constrained('training_partners')->cascadeOnDelete();
            $table->string('bank_name', 191)->nullable();
            $table->string('branch_name', 191)->nullable();
            $table->string('account_holder_name', 191)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('ifsc_code', 50)->nullable();
            $table->string('account_type', 50)->nullable();
            $table->string('gst_number', 30)->nullable();
            $table->string('pan_number', 30)->nullable();
            $table->string('tan_number', 30)->nullable();
            $table->string('cin_number', 30)->nullable();
            $table->string('msme_number', 30)->nullable();
            $table->string('udyam_number', 30)->nullable();
            $table->string('financial_year_1', 15)->nullable();
            $table->decimal('financial_turnover_1', 15, 2)->nullable();
            $table->string('financial_year_2', 15)->nullable();
            $table->decimal('financial_turnover_2', 15, 2)->nullable();
            $table->string('financial_year_3', 15)->nullable();
            $table->decimal('financial_turnover_3', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_partner_bank_details');
    }
};
