<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Citoyen extends Model
{
    //
     use HasFactory;

    protected $table = 'citoyen';

    protected $fillable = [
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'telephone',
        'email',
        'password',
        'groupe_sanguin',
        'rhesus',
        'disponible',
        'localisation_lat',
        'localisation_lng',
        'a_tatouage_recent',
        'douleurs_thoraciques',
        'consomme_alcool',
        'date_dernieres_regles'
    ];

    protected $hidden = [
        'password'
    ];

    protected $casts = [
        'disponible' => 'boolean',
        'a_tatouage_recent' => 'boolean',
        'douleurs_thoraciques' => 'boolean',
        'consomme_alcool' => 'boolean',
        'date_naissance' => 'date',
        'date_dernieres_regles' => 'date'
    ];

    // Relations
    

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function dons()
    {
        return $this->hasMany(Don::class, 'id_citoyen');
    }

    public function reponsesAlertes()
    {
        return $this->hasMany(ReponseAlerte::class, 'id_citoyen');
    }

}
