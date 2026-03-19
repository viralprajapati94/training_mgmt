<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents_master', function (Blueprint $table) {
            DB::statement("
                ALTER TABLE documents_master 
                MODIFY role_type 
                ENUM('training_partner', 'training_center', 'student', 'trainer')
            ");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents_master', function (Blueprint $table) {
            DB::statement("
                ALTER TABLE documents_master 
                MODIFY role_type 
                ENUM('training_partner', 'training_center', 'student')
            ");
        });
    }
};
