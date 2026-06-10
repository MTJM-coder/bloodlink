<?php

namespace App\Http\Controllers;

use App\Models\MouvementStock;
use Illuminate\Http\Request;
use App\Models\PocheSang;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Exception;

class pocheController extends Controller
{

    //app/Http/Controllers/PocheSangController.php

    public function addStock(Request $request)
    {
        $user = Auth::user();
        $banqueSang = $user->banqueSang;

        $validated = $request->validate([
            'groupe_sanguin' => 'required|in:O,A,B,AB',
            'rhesus' => 'required|in:+,-',
            'type_produit' => 'required|in:CGR,plasma,plaquettes',
            'date_prelevement' => 'required|date|before_or_equal:today',
            'id_banque_origine' => 'nullable|exists:banque_sang,id',
            'id_don' => 'nullable|exists:don,id',

        ]);

        //Calculer automatiquement la date d'expiration
        $datePrelevement = Carbon::parse($validated['date_prelevement']);
        $delaiExpiration = $this->obtenirDelaiExpiration($validated['type_produit']);
        $dateExpiration = $datePrelevement->addDays($delaiExpiration);

        // Créer la poche
        $poche = new PocheSang();
        $poche->id_banque = $banqueSang->id;
        $poche->id_banque_origine = $validated['id_banque_origine'] ?? null;
        $poche->id_don = $validated['id_don'] ?? null;
        $poche->groupe_sanguin = $validated['groupe_sanguin'];
        $poche->rhesus = $validated['rhesus'];
        $poche->type_produit = $validated['type_produit'];
        $poche->date_prelevement = $validated['date_prelevement'];
        $poche->date_expiration = $dateExpiration;
        $poche->statut = 'disponible';
        $poche->save();

        return response()->json([
            'success' => true,
            'message' => 'Poche créée',
            'poche' => [
                'id_poche' => $poche->id,
                'groupe' => $poche->groupe_sanguin . $poche->rhesus,
                'type' => $poche->type_produit,
                'date_prelevement' => $poche->date_prelevement,
                'date_expiration' => $poche->date_expiration->format('Y-m-d'),
                'jours_validite' => $poche->jourAvantExpiration(),
            ]
        ], 201);
    }




    // Méthode helper
    private function obtenirDelaiExpiration($typeProduit)
    {
        return [
            'CGR' => 35,           // 35 jours
            'plasma' => 2555,      // 7 ans
            'plaquettes' => 7,     // 7 jours
        ][$typeProduit] ?? 35;
    }

    // mettre a jour une poche

    public function updateStatusPoche(Request $request, $id)
    {
        $user = Auth::user();
        $banqueSang = $user->banqueSang;

        $poche = PocheSang::where('id', $id)->where('id_banque', $banqueSang->id)->first();

        if (!$poche) {
            return response()->json(['success' => false, 'message' => 'Poche non trouvée'], 404);
        }

        $validated = $request->validate([
            'statut' => 'required|in:disponible,utilisee,expiree,rejetee'
        ]);

        $ancienStatut = $poche->statut;
        $nouveauStatut = $validated['statut'];

        if (!$this->estTransitionValide($ancienStatut, $nouveauStatut)) {
            return response()->json(['success' => false, "message" => "Transition invalide : $ancienStatut → $nouveauStatut"], 422);
        }

        // verifier si la poche est espiree
        if (!$poche->nonExpiree() && $nouveauStatut == 'disponible') {
            response()->json([
                'success' => false,
                'message' => 'Impossible : poche expirée le ' . $poche->date_expiration
            ], 422);
        }

        //  mise a jour du statut
        DB::beginTransaction();
        try {
            $poche->statut = $nouveauStatut;
            $poche->save();

            $mvt = new MouvementStock();
            $mvt->id_poche = $poche->id;
            $mvt->type_mouvement = $this->obtenirTypeMouvement($nouveauStatut);
            $mvt->motif = $this->obtenirMotif($ancienStatut, $nouveauStatut);
            $mvt->date_mouvement = now()->toDateString();
            $mvt->quantite = 1;
            $mvt->save();

            DB::commit();

            return response()->json(['success' => false, 'message' => 'poche mis a jour', 'ancien_statut' => $ancienStatut, 'nouveau_statut' => $nouveauStatut], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'Message' => 'erreur survenue : ' . $e->getMessage()]);
        }
    }

    private function estTransitionValide($ancien, $nouveau)
    {
        $transitionsValides = [
            "disponible" => ['utilisee', 'expiree', 'rejetee'],
            "utilisee" => [],
            "expiree" => [],
            "rejetee" => [],
        ];

        return in_array($nouveau, $transitionsValides[$ancien] ?? []);
    }

    private function obtenirTypeMouvement($statut)
    {
        return match ($statut) {
            'utilisee', 'expiree', 'rejetee' => 'sortie',
            default => 'entree',
        };
    }

    private function obtenirMotif($ancien, $nouveau)
    {
        if ($nouveau === 'utilisee') return 'don_effectue';
        if ($nouveau === 'expiree') return 'expiration';
        if ($nouveau === 'rejetee') return 'destruction';
        return 'transfert';
    }



    // archiver une poche 

    public function archivePoche(Request $request, $id)
    {
        $user = Auth::user();
        $banqueSang = $user->banqueSang;
        $poche = PocheSang::where('id', $id)->where('id_banque', $banqueSang->id)->first();
        if (!$poche) {
            return response()->json(['success' => false, 'message' => 'Poche non trouvée'], 404);
        }
        $validated = $request->validate([
            'raison_archivage' => 'required|string|max:255'
        ]);
        DB::beginTransaction();
        try {
            $poche->delete();
            $mouvement = new MouvementStock();
            $mouvement->id_poche = $poche->id;
            $mouvement->type_mouvement = 'sortie';
            $mouvement->motif = 'archivage';
            $mouvement->raison_archivage = $validated['raison_archivage'];
            $mouvement->date_mouvement = now()->toDateString();
            $mouvement->quantite = 1;
            $mouvement->save();

            Log::info('Poche archivée', [
                'id_poche' => $id,
                'ancien_statut' => $poche->statut,
                'raison' => $validated['raison_archivage'],
                'user_id' => $user->id,
            ]);
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Poche archivée avec succès'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de l\'archivage : ' . $e->getMessage()], 500);
        }
    }
}
