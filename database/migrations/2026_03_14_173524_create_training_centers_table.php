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
        Schema::create('training_centers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tp_id');
            $table->string('tc_id', 50)->unique();
            $table->string('sip_id', 50)->nullable();
            $table->string('name', 191);
            $table->text('address')->nullable();
            $table->unsignedBigInteger('state_id')->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->unsignedBigInteger('taluka_id')->nullable();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->string('pin_code', 20)->nullable();
            $table->string('email', 191);
            $table->string('mobile', 20);
            $table->string('website', 191)->nullable();
            $table->string('spoc_name', 100)->nullable();
            $table->string('spoc_mobile', 20)->nullable();
            $table->string('authorized_person_name', 100)->nullable();
            $table->string('authorized_mobile', 20)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_centers');
    }
};
