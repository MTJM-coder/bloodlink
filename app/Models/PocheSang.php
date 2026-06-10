<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PocheSang extends Model
{
    //
    use softDeletes;
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
    public function don()
    {
        return $this->belongsTo(Don::class, 'id_don');
    }

    // Scope pour exclure les poches expirées
    public function scopeNonExpiree($query)
    {
        return $query->where(function ($q) {
            $q->where('date_expiration', '>', now());
        });
    }

    // Méthode pour calculer les jours avant expiration
   public function jourAvantExpiration()
{
    if (!$this->date_expiration) {
        return 0;
    }

    return max(0, (int) now()->diffInDays($this->date_expiration, false));
}


}
