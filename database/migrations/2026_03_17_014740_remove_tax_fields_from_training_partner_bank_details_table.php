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
        Schema::table('training_partner_bank_details', function (Blueprint $table) {
            $table->dropColumn([
                'gst_number',
                'pan_number',
                'tan_number',
                'cin_number',
                'msme_number',
                'udyam_number',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_partner_bank_details', function (Blueprint $table) {
            $table->string('gst_number')->nullable();
            $table->string('pan_number')->nullable();
            $table->string('tan_number')->nullable();
            $table->string('cin_number')->nullable();
            $table->string('msme_number')->nullable();
            $table->string('udyam_number')->nullable();
        });
    }
};
