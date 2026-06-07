<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BanqueSang extends Model
{
    //
    use HasFactory;

    protected $table = 'banque_sang';

    protected $fillable = [
        'nom',
        'ville',
        'quartier',
        'latitude',
        'longitude',
        'telephone',
        'email',
        'password',
        'type_banque',
        'statut'
    ];

    protected $hidden = [
        'password'
    ];

    //  les relations
    
        public function user()
        {
            return $this->belongsTo(User::class, 'user_id');
        }

    public function dons()
    {
        return $this->hasMany(Don::class, 'id_banque');
    }

    public function poches()
    {
        return $this->hasMany(PocheSang::class, 'id_banque');
    }

    public function alertes()
    {
        return $this->hasMany(Alerte::class, 'id_banque');
    }

    public function cautions()
    {
        return $this->hasMany(Caution::class, 'id_banque');
    }
}
