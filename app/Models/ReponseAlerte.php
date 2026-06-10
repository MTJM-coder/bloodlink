<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReponseAlerte extends Model
{
    //
    use softDeletes;
    protected $table = 'reponse_alerte';
    protected $fillable = [
        'qr_code',
        'statut',
        'date_arrivee',
    ];

    // relations
    public function alerte()
    {
        return $this->belongsTo(Alerte::class, 'id_alerte');
    }

     public function citoyen()
    {
        return $this->belongsTo(Citoyen::class, 'id_citoyen');
    }

}
