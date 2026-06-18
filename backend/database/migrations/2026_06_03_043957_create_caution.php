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
        Schema::create('caution', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_banque');
            $table->string('representant_telephone',20);
            $table->string('representant_nom');
            $table->enum('groupe_sanguin',['O','A','B','AB'])->nullable();
            $table->enum('rhesus',['+','-'])->nullable();
            $table->decimal('montant',10,2);
            $table->integer('nb_donneurs_attendus')->nullable();
            $table->integer('nb_donneurs_ramenes')->default(0);
            $table->enum('statut',['en_attente','partiellement_remboursee','remboursee'])->default('en_attente');
            $table->date('date_remboursement')->nullable();
            $table->foreign('id_banque')->references('id')->on('banque_sang')->onDelete('cascade');
            $table->index(['id_banque','statut']);
            $table->index('statut');
            $table->softDeletes();
            // $table->index('date_enregistement');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('caution');
    }
};
