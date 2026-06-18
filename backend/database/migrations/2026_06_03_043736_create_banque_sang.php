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
        Schema::create('banque_sang', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nom', 150);
            $table->string('ville', 100)->nullable();
            $table->string('quartier', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('type_banque', ['reconnue', 'district']);
            $table->enum('statut', ['en_attente', 'active', 'suspendue'])->default('en_attente');
            $table->string('fcm_token')->nullable();
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->onDelete('cascade');
            $table->index('statut');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banque_sang');
    }
};
