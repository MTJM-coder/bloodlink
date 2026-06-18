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
        Schema::create('alerte', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->unsignedBigInteger('id_banque');
            $table->enum('type_alerte',['urgence_immediate','reconstitution']);
            $table->enum('groupe_sanguin',['O','A','B','AB']);
            $table->enum('rhesus',['+','-']);
            $table->integer('rayon_km')->nullable();
            $table->string('type_don_accepte',50)->nullable();
            $table->text('message')->nullable();
            $table->enum('statut',['cloture','active'])->default('active');
            $table->foreign('id_banque')->references('id')->on('banque_sang')->onDelete('cascade');
            $table->index('type_alerte');
            $table->index('statut');
            $table->index(['groupe_sanguin','rhesus']);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerte');
    }
};
