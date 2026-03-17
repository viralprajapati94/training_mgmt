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
        Schema::table('trainer_addresses', function (Blueprint $table) {
            // Drop old string columns
            $table->dropColumn(['city', 'taluka', 'district', 'state']);
            
            // Add new foreign key columns
            $table->foreignId('state_id')->nullable()->after('address_line')->constrained('states')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->after('state_id')->constrained('districts')->nullOnDelete();
            $table->foreignId('taluka_id')->nullable()->after('district_id')->constrained('talukos')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->after('taluka_id')->constrained('cities')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainer_addresses', function (Blueprint $table) {
            // Drop new foreign key columns
            $table->dropForeign(['state_id']);
            $table->dropForeign(['district_id']);
            $table->dropForeign(['taluka_id']);
            $table->dropForeign(['city_id']);
            $table->dropColumn(['state_id', 'district_id', 'taluka_id', 'city_id']);
            
            // Re-add old string columns
            $table->string('state')->nullable()->after('address_line');
            $table->string('district')->nullable()->after('state');
            $table->string('taluka')->nullable()->after('district');
            $table->string('city')->nullable()->after('taluka');
        });
    }
};
