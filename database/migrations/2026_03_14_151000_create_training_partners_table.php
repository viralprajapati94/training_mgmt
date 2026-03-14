<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('tp_id', 50)->unique();
            $table->string('sip_id', 50)->nullable();
            $table->string('tp_name', 191);
            $table->text('address')->nullable();
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->foreignId('taluka_id')->nullable()->constrained('talukas')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->string('pin_code', 10)->nullable();
            $table->string('email', 191)->unique();
            $table->string('mobile', 20);
            $table->string('website', 191)->nullable();
            $table->string('spoc_name', 191)->nullable();
            $table->string('spoc_mobile', 20)->nullable();
            $table->string('authorized_person_name', 191)->nullable();
            $table->string('authorized_person_mobile', 20)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_partners');
    }
};
