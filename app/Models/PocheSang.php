<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PocheSang extends Model
{
    //
    protected $table = 'poche_sang';
    protected $fillable = [
        'groupe_sanguin',
        'rhesus',
        'type_produit',
        'date_prelevement',
        'date_expiration',
        'statut',
    ];

    // Relations
    public function banqueSang()
    {
        return $this->belongsTo(BanqueSang::class, 'id_banque');
    }

    public function banqueOrigine()
    {
        return $this->belongsTo(BanqueSang::class, 'id_banque_origine');
    }
     public function mouvementsStock()
    {
        return $this->hasMany(MouvementStock::class, 'id_poche');
    }
    public function don(){
        return $this->belongsTo(Don::class, 'id_don');
    }
}
