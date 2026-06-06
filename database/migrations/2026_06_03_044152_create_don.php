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
        Schema::create('don', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_citoyen');
            $table->unsignedBigInteger('id_banque');
            // $table->unsignedBigInteger('id_reponse_alerte')->nullable();
            $table->string('type_don',50)->nullable();
            $table->decimal('montant',10,2)->nullable();
            $table->date('date_don');
            $table->foreign('id_banque')->references('id')->on('banque_sang')->onDelete('cascade');
            $table->foreign('id_citoyen')->references('id')->on('citoyen')->onDelete('cascade');
            // $table->foreign('id_reponse_alerte')->references('id')->on('reponse_alerte')->onDelete('set null');
            $table->index('id_banque');
            $table->index('id_citoyen');
            $table->index('date_don');
       
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('don');
    }
};
