<?php

namespace App\Http\Controllers;

use App\Models\BanqueSang;
use Illuminate\Http\Request;
use App\Models\PocheSang;

class searchController extends Controller
{
    //
    public function searchBlood(Request $request)
    {
        dd($request->all());
        $validated = $request->validate([
            'groupe_sanguin' => 'required|in:O,A,B,AB',
            'rhesus' => 'required|in:+,-',
            // 'type_produit' => 'required|in:CGR,plasma,plaquettes',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'rayon' => 'nullable|numeric|min:1',
        ]);

        // Logique de recherche dans la base de données

        $lat = $validated['lat'] ?? null;
        $lng = $validated['lng'] ?? null;
        $rayon = $validated['rayon'] ?? 10;

        if ($lat && $lng) {
            $banques = BanqueSang::where('statut', 'active')->get();
            $banquesProches = [];
            foreach ($banques as $banque) {
                $distance = $this->calculerDistance($lat, $lng, $banque->latitude, $banque->longitude);
                if ($distance <= $rayon) {
                    $stock = $this->obtenirStockDisponible($banque->id, $validated['groupe_sanguin'], $validated['rhesus']);

                    $banquesProches[] = [
                        'id_banque' => $banque->id,
                        'nom' => $banque->nom,
                        'ville' => $banque->ville,
                        'quartier' => $banque->quartier,
                        'latitude' => $banque->latitude,
                        'longitude' => $banque->longitude,
                        'type_banque' => $banque->type_banque,
                        'distance_km' => round($distance, 2),
                        'stock_disponible' => $stock,
                        'itineraire_url' => $this->genererItineraireUrl($validated['lat'], $validated['lng'], $banque->latitude, $banque->longitude)
                    ];
                }
            }
            usort($banquesProches, function ($a, $b) {
                return $a['distance_km'] <=> $b['distance_km'];
            });
        } else {
            $banques = BanqueSang::where('statut', 'active')->get();
            $banquesProches = [];
            foreach ($banques as $banque) {
                $stock = $this->obtenirStockDisponible($banque->id, $validated['groupe_sanguin'], $validated['rhesus']);

                if ($stock['disponible']) {
                    $banquesProches[] = [
                        'id_banque' => $banque->id,
                        'nom' => $banque->nom,
                        'ville' => $banque->ville,
                        'quartier' => $banque->quartier,
                        'latitude' => $banque->latitude,
                        'longitude' => $banque->longitude,
                        'type_banque' => $banque->type_banque,
                        'stock_disponible' => $stock,
                    ];
                }
            }
        }
        return response()->json([
            'success' => true,
            'message' => 'Résultats de la recherche',
            'data' => $banquesProches,
            'nb_results' => count($banquesProches)
        ], 200);
    }

    private function calculerDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius  = 6371; // Rayon de la Terre en kilomètres
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    private function obtenirStockDisponible($idBanque, $groupeSanguin, $rhesus)
    {
        $poches = PocheSang::where('id_banque', $idBanque)
            ->where('groupe_sanguin', $groupeSanguin)
            ->where('rhesus', $rhesus)
            ->where('statut', 'disponible')
            ->get();

        $quantite = $poches->count();
        $parType = [];
        foreach ($poches as $poche) {
            if (!isset($parType[$poche->type_produit])) {
                $parType[$poche->type_produit] = 0;
            }
            $parType[$poche->type_produit]++;
        }

        return [
            'quantite_total' => $quantite,
            'statut' => $quantite >= 5 ? 'OK' : ($quantite >= 3 ? 'FAIBLE' : ($quantite > 0 ? 'CRITIQUE' : 'RUPTURE')),
            'par_type' => $parType,
            'disponible' => $quantite > 0,
        ];
    }

    private function genererItineraireUrl($lat1, $lng1, $lat2, $lng2)
    {
        return "https://www.google.com/maps/dir/?api=1&origin={$lat1},{$lng1}&destination={$lat2},{$lng2}&travelmode=driving";
    }
}
