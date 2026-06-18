<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\BanqueSang;
use App\Models\PocheSang;


class PartenaireController extends Controller
{
    public function stocksPartenaires(Request $request)
    {
        $user = Auth::user();
        $maBanque = $user->banqueSang;

        $banques = BanqueSang::
            // where('id', '!=', $maBanque->id)
            where('statut', 'active')
            ->get();

        $resultats = [];

        foreach ($banques as $banque) {

            $stock = PocheSang::where('id_banque', $banque->id)
                ->where('statut', 'disponible');

            if ($request->groupe_sanguin) {
                $stock->where('groupe_sanguin', $request->groupe_sanguin);
            }

            if ($request->rhesus) {
                $stock->where('rhesus', $request->rhesus);
            }

            $poches = $stock->get();

            $parType = $poches
                ->groupBy('type_produit')
                ->map(fn($items) => $items->count());
            $parGroupe = [];

            foreach ($poches as $poche) {

                $groupe = $poche->groupe_sanguin . $poche->rhesus;

                if (!isset($parGroupe[$groupe])) {
                    $parGroupe[$groupe] = [
                        'total' => 0,
                        'types' => []
                    ];
                }

                $parGroupe[$groupe]['total']++;

                if (!isset($parGroupe[$groupe]['types'][$poche->type_produit])) {
                    $parGroupe[$groupe]['types'][$poche->type_produit] = 0;
                }

                $parGroupe[$groupe]['types'][$poche->type_produit]++;
            }
            $resultats[] = [
                'id' => $banque->id,
                'nom' => $banque->nom,
                'telephone' => $banque->telephone,
                'quartier' => $banque->quartier,
                'ville' => $banque->ville,
                'distance_km' => null,
                'type_banque' => $banque->type_banque,
                'stock' => [
                    'quantite_total' => $poches->count(),
                    'par_type' => $parType,
                    'statut' => $this->calculerStatut($poches->count()),
                    'par_groupe' => $parGroupe
                ]
            ];
        }


        return response()->json([
            'success' => true,
            'resultats' => $resultats
        ]);
    }

    private function calculerStatut($qte)
    {
        if ($qte >= 10) return 'OK';
        if ($qte >= 5) return 'FAIBLE';
        if ($qte > 0) return 'CRITIQUE';

        return 'RUPTURE';
    }
}
