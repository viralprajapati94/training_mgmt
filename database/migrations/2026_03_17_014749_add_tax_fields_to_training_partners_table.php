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
        Schema::table('training_partners', function (Blueprint $table) {
            $table->string('gst_number')->nullable();
            $table->string('pan_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_partners', function (Blueprint $table) {
            $table->dropColumn(['gst_number', 'pan_number']);
        });
    }
};
