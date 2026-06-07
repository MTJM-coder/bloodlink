<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Don extends Model
{
    //
    protected $table = 'don';
    protected $fillable = [
        'type_don',
        'montant',
        'date_don',
    ];

    // Relations
    public function citoyen()
    {
        return $this->belongsTo(Citoyen::class, 'id_citoyen');
    }

    public function banqueSang()
    {
        return $this->belongsTo(BanqueSang::class, 'id_banque');
    }

    

}
