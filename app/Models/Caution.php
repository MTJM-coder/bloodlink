<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Caution extends Model
{
    //
    use softDeletes;
    protected $table = 'caution';
    protected $fillable = [
        'representant_telephone',
        'representant_nom',
        'groupe_sanguin',
        'rhesus',
        'montant',
        'nb_donneurs_attendus',
        'nb_donneurs_ramenes',
        'statut',
        'date_remboursement',

    ];

        // Relations
    
        public function banqueSang()
        {
            return $this->belongsTo(BanqueSang::class, 'id_banque');
        }
        
}
