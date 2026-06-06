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
        Schema::create('reponse_alerte', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_alerte');
            $table->unsignedBigInteger('id_citoyen');
            $table->string('qr_code',191)->unique();
            $table->enum('statut',['en_attente','arrive','confirme','refuse'])->default('en_attente');
            $table->timestamp('date_arrivee')->nullable();
            $table->foreign('id_citoyen')->references('id')->on('citoyen')->onDelete('cascade');
            $table->foreign('id_alerte')->references('id')->on('alerte')->onDelete('cascade');
            $table->unique(['id_alerte','id_citoyen']);
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reponse_alerte');
    }
};
