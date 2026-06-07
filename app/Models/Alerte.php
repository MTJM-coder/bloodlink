<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    //
    protected $table = 'alerte';
    protected $fillable = [
        'type_alerte',
        'groupe_sanguin',
        'rhesus',
        'rayon',
        'type_don_accepte',
        'message',
        'statut',
    ];

    // Relations
    public function banqueSang()
    {
        return $this->belongsTo(BanqueSang::class, 'id_banque');
    }

     public function reponsesAlertes()
    {
        return $this->hasMany(ReponseAlerte::class, 'id_alerte');
    }

    
}
