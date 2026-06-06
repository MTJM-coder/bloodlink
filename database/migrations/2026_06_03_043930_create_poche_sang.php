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
        Schema::create('poche_sang', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_banque');
            $table->unsignedBigInteger('id_don')->nullable();
            $table->unsignedBigInteger('id_banque_origine')->nullable();
            $table->enum('groupe_sanguin',['O','A','B','AB']);
            $table->enum('rhesus',['+','-']);
            $table->enum('type_produit',['CGR','plasma','plaquettes']);
            $table->date('date_prelevement')->nullable();
            $table->date('date_expiration')->nullable();
            $table->enum('statut',['disponible','utilisee','expiree','rejetee'])->default('disponible');
            $table->foreign('id_banque')->references('id')->on('banque_sang')->onDelete('cascade');
            $table->foreign('id_banque_origine')->references('id')->on('banque_sang')->onDelete('set null');
            $table->foreign('id_don')->references('id')->on('don')->onDelete('set null');
            $table->index('groupe_sanguin');
            $table->index('rhesus');
            $table->index('statut');
            $table->index('date_expiration');
            $table->index(['id_banque','statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poche_sang');
    }
};
