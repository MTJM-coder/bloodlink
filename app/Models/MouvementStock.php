<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MouvementStock extends Model
{
    //
    protected $table = 'mouvement_stock';
    protected $fillable = [
        'type_mouvement',
        'motif',
        'commentaire',
        'date_mouvement',
        'quantite',
    ];

    // Relations
    public function pocheSang()
    {
        return $this->belongsTo(PocheSang::class, 'id_poche');
    }
    

}
