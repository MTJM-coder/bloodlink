<?php

namespace App\Http\Controllers;

use App\Models\PocheSang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class stockController extends Controller
{
    //
  public function getMyStock(Request $request)
{
    $user = Auth::user();
    $banqueSang = $user->banqueSang;

    if (!$banqueSang) {
        return response()->json([
            'success' => false,
            'message' => 'Aucune banque associée'
        ], 403);
    }

    // Valider les filtres
    $validatedData = $request->validate([
        'groupe_sanguin' => 'nullable|string|in:A,B,AB,O',
        'rhesus' => 'nullable|string|in:+,-',
        'type_produit' => 'nullable|string|in:CGR,plasma,plaquettes'
    ]);

    // Chaîner les filtres 
    $query = PocheSang::where('id_banque', $banqueSang->id)
        ->where('statut', 'disponible');
        // ->nonExpiree();  

    // Appliquer les filtres optionnels
    if ($validatedData['groupe_sanguin'] ?? null) {
        $query = $query->where('groupe_sanguin', $validatedData['groupe_sanguin']);
    }

    if ($validatedData['rhesus'] ?? null) {
        $query = $query->where('rhesus', $validatedData['rhesus']);
    }

    if ($validatedData['type_produit'] ?? null) {
        $query = $query->where('type_produit', $validatedData['type_produit']);
    }

    $poches = $query->get();

    // Regrouper et calculer le statut
    $resume = $this->calculerStockResume($poches);
    $alertes = $this->detecterAlertes($poches);

    return response()->json([
        'success' => true,
        'banque' => $banqueSang->nom,
        'resume' => $resume,
        'alertes' => $alertes,
        'total_poches' => $poches->count(),
    ], 200);
}

// Méthode helper pour regrouper et calculer statut
private function calculerStockResume($poches)
{
    $resume = [];

    foreach ($poches as $poche) {
        $cle = $poche->groupe_sanguin . $poche->rhesus . '_' . $poche->type_produit;

        if (!isset($resume[$cle])) {
            $resume[$cle] = [
                'groupe' => $poche->groupe_sanguin,
                'rhesus' => $poche->rhesus,
                'type_produit' => $poche->type_produit,
                'quantite' => 0,
                'statut' => 'OK',
                'seuil_critique' => $this->obtenirSeuil($poche->type_produit),
            ];
        }

        $resume[$cle]['quantite']++;
        $resume[$cle]['statut'] = $this->calculerStatut(
            $resume[$cle]['quantite'],
            $resume[$cle]['seuil_critique']
        );
    }

    return array_values($resume);
}

private function calculerStatut($quantite, $seuil)
{
    if($quantite == 0){
    return 'RUPTURE';
}

if($quantite < ceil($seuil/2)){
    return 'CRITIQUE';
}

if($quantite < $seuil){
    return 'FAIBLE';
}

return 'OK';
}

private function obtenirSeuil($type)
{
    return [
        'CGR' => 5,
        'Plasma' => 3,
        'Plaquettes' => 2,
    ][$type] ?? 3;
}

private function detecterAlertes($poches)
{
    $alertes = [];

    foreach ($poches as $poche) {
        $jours = $poche->jourAvantExpiration();

        if ($jours <= 7 && $jours > 3) {
            $alertes[] = [
                'type' => 'EXPIRATION_J7',
                'id_poche' => $poche->id,
                'groupe' => $poche->groupe_sanguin . $poche->rhesus,
                'jours_restants' => $jours,
            ];
        }

        if ($jours <= 3 && $jours > 0) {
            $alertes[] = [
                'type' => 'EXPIRATION_J3_URGENT',
                'id_poche' => $poche->id,
                'groupe' => $poche->groupe_sanguin . $poche->rhesus,
                'jours_restants' => $jours,
            ];
        }
    }

    return $alertes;
}

// 
}