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
        Schema::create('citoyen', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->enum('groupe_sanguin', ['O', 'A', 'B', 'AB']);
            $table->enum('rhesus', ['+', '-']);
            $table->boolean('disponible')->default(false);
            $table->decimal('localisation_lat', 10, 8)->nullable();
            $table->decimal('localisation_lng', 11, 8)->nullable();
            $table->boolean('a_tatouage_recent')->default(false);
            $table->boolean('douleurs_thoraciques')->default(false);
            $table->boolean('consomme_alcool')->default(false);
            $table->date('date_dernieres_regles')->nullable();
            $table->string('fcm_token')->nullable();
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->onDelete('cascade');
            $table->index('groupe_sanguin');
            $table->index('rhesus');
            $table->index('disponible');
            $table->index(['localisation_lat', 'localisation_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citoyen');
    }
};
