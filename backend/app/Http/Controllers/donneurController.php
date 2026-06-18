<?php

namespace App\Http\Controllers;

use App\Models\Citoyen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class donneurController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $banque = $user->banqueSang;

        if (!$banque) {
            return response()->json(['success' => false, 'message' => 'Aucune banque associée'], 403);
        }

        $validated = $request->validate([
            'groupe_sanguin' => 'nullable|string|in:A,B,AB,O',
            'rhesus' => 'nullable|string|in:+,-',
            'eligibilite' => 'nullable|string|in:eligible,non_eligible,indisponible',
            'recherche' => 'nullable|string|max:100',
        ]);

        $citoyens = Citoyen::where(function ($query) use ($banque) {
            $query->whereHas('dons', function ($q) use ($banque) {
                $q->where('id_banque', $banque->id);
            })->orWhereHas('reponsesAlertes.alerte', function ($q) use ($banque) {
                $q->where('id_banque', $banque->id);
            });
        })
            ->with('user')
            ->withCount(['dons' => function ($q) use ($banque) {
                $q->where('id_banque', $banque->id);
            }])
            ->get();

        if ($validated['groupe_sanguin'] ?? null) {
            $citoyens = $citoyens->where('groupe_sanguin', $validated['groupe_sanguin']);
        }
        if ($validated['rhesus'] ?? null) {
            $citoyens = $citoyens->where('rhesus', $validated['rhesus']);
        }
        if ($validated['recherche'] ?? null) {
            $terme = strtolower($validated['recherche']);
            $citoyens = $citoyens->filter(function ($c) use ($terme) {
                $nomComplet = strtolower(($c->user->nom ?? '') . ' ' . ($c->user->prenom ?? ''));
                return str_contains($nomComplet, $terme) || str_contains($c->telephone ?? '', $terme);
            });
        }

        $donneurs = $citoyens->map(function ($citoyen) {
            $eligibilite = $this->calculerEligibilite($citoyen);
            return [
                'id_citoyen' => $citoyen->id_citoyen,
                'nom' => $citoyen->user->nom ?? '',
                'prenom' => $citoyen->user->prenom ?? '',
                'telephone' => $citoyen->telephone,
                'groupe_sanguin' => $citoyen->groupe_sanguin,
                'rhesus' => $citoyen->rhesus,
                'date_dernier_don' => $citoyen->date_dernier_don,
                'nb_dons_total' => $citoyen->dons_count,
                'eligibilite' => $eligibilite['statut'],
                'raison' => $eligibilite['raison'],
            ];
        });

        if ($validated['eligibilite'] ?? null) {
            $donneurs = $donneurs->where('eligibilite', $validated['eligibilite']);
        }

        $donneurs = $donneurs->values();

        return response()->json([
            'success' => true,
            'donneurs' => $donneurs,
            'total' => $donneurs->count(),
            'nb_eligibles' => $donneurs->where('eligibilite', 'eligible')->count(),
            'nb_non_eligibles' => $donneurs->whereIn('eligibilite', ['non_eligible', 'indisponible'])->count(),
        ], 200);
    }

    public function show(Request $request, $id)
    {
        $user = Auth::user();
        $banque = $user->banqueSang;

        $citoyen = Citoyen::where('id_citoyen', $id)
            ->with('user')
            ->with(['dons' => function ($q) use ($banque) {
                $q->where('id_banque', $banque->id)->orderByDesc('date_don');
            }])
            ->first();

        if (!$citoyen) {
            return response()->json(['success' => false, 'message' => 'Donneur non trouvé'], 404);
        }

        $eligibilite = $this->calculerEligibilite($citoyen);

        return response()->json([
            'success' => true,
            'donneur' => [
                'id_citoyen' => $citoyen->id_citoyen,
                'nom' => $citoyen->user->nom ?? '',
                'prenom' => $citoyen->user->prenom ?? '',
                'email' => $citoyen->user->email ?? '',
                'telephone' => $citoyen->telephone,
                'age' => $citoyen->age,
                'groupe_sanguin' => $citoyen->groupe_sanguin,
                'rhesus' => $citoyen->rhesus,
                'date_dernier_don' => $citoyen->date_dernier_don,
                'disponible' => $citoyen->disponible,
                'eligibilite' => $eligibilite['statut'],
                'raison' => $eligibilite['raison'],
                'localisation_lat' => $citoyen->localisation_lat,
                'localisation_lng' => $citoyen->localisation_lng,
                'historique_dons' => $citoyen->dons->map(fn($d) => [
                    'id_don' => $d->id_don,
                    'type_don' => $d->type_don,
                    'date_don' => $d->date_don,
                ]),
            ],
        ], 200);
    }

    private function calculerEligibilite($citoyen)
    {
        if (!$citoyen->disponible) {
            return ['statut' => 'indisponible', 'raison' => "Le donneur s'est marqué indisponible"];
        }

        if ($citoyen->date_dernier_don) {
            $delai = in_array($citoyen->genre ?? null, ['F', 'femme']) ? 4 : 3;
            $dateMinimale = Carbon::parse($citoyen->date_dernier_don)->addMonths($delai);

            if (now()->lessThan($dateMinimale)) {
                return [
                    'statut' => 'non_eligible',
                    'raison' => "Dernier don le " . Carbon::parse($citoyen->date_dernier_don)->format('d/m/Y') . ", éligible à partir du " . $dateMinimale->format('d/m/Y'),
                ];
            }
        }

        return ['statut' => 'eligible', 'raison' => null];
    }
}
