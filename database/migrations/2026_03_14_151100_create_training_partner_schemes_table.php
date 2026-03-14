<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_partner_schemes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_partner_id')->constrained('training_partners')->cascadeOnDelete();
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->foreignId('scheme_id')->constrained('schemes')->cascadeOnDelete();
            $table->date('approval_date');
            $table->date('expiry_date')->nullable();
            $table->timestamps();
            $table->unique(['training_partner_id', 'scheme_id', 'state_id'], 'tp_scheme_state_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_partner_schemes');
    }
};
