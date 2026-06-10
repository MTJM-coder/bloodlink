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
        Schema::create('mouvement_stock', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_poche');
            $table->enum('type_mouvement', ['entree', 'sortie']);
            $table->enum('motif', [
                'don',
                'transfusion',
                'transfert',
                'expiration',
                'destruction',
                'archivage'
            ]);
            $table->text('commentaire')->nullable();
            $table->string('raison_archivage',255)->nullable();
            $table->date('date_mouvement');
            $table->integer('quantite')->default(1);
            $table->foreign('id_poche')->references('id')->on('poche_sang')->onDelete('cascade');
            $table->index('type_mouvement');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvement_stock');
    }
};
