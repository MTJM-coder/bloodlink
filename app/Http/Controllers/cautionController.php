<?php

namespace App\Http\Controllers;

use App\Models\Caution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class cautionController extends Controller
{
    //
    public function create(Request $request)
    {
        $user = Auth::user();
        $banque = $user->banqueSang;

        $validateData = $request->validate([
            'telephone' => '',
            'nom' => 'string',
            'groupe_sanguin' => 'nullable|in:O,A,B,AB',
            'rhesus' => 'nullable|in:+,-',
            'montant' => 'required',
            'nb_donneurs_ramenes' => '',
            'nb_donneurs_attendus' => ''

        ]);

        $caution = new Caution();
        $caution->id_banque = $banque->id;
        $caution->representant_telephone = $validateData['telephone'];
        $caution->representant_nom = $validateData['nom'];
        $caution->groupe_sanguin = $validateData['groupe_sanguin'] ?? null;
        $caution->rhesus = $validateData['rhesus'] ?? null;
        $caution->montant = $validateData['montant'];
        $caution->nb_donneurs_attendus = $validateData['nbre_donneurs_attendus'];
        $caution->nb_donneurs_ramenes = $validateData['nb_donneurs_ramenes'];
        $caution->date_remboursement = $validateData['date_remboursement'] ?? null;
        $caution->save();

        return response()->json([
            'success' => true,
            'message' => "Caution enregistré avec succes",
            "caution" => $caution
        ], 201);
    }

    public function index()
    {

        $user = Auth::user();
        $banque = $user->banqueSang;
        $cautions = Caution::where('id_banque', $banque->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'cautions' => $cautions
        ],200);
    }

    public function rembourser(Request $request, $id)
    {
        $user = Auth::user();
        $banque = $user->banqueSang;
        $validateData = $request->validate([
            'nb_donneurs_ramenes' => 'nullable|numeric',
            'date_remboursement' => 'nullable'
        ]);

        $caution = Caution::where('banque_id', $banque->id)->where('id', $id)->first();
        if (!$caution) {
            return response()->json(['success' => false, 'message' => "Caution non trouvé"], 404);
        }
        $caution->nb_donneurs_ramenes += $validateData['nb_donneurs_ramenes'];
        if ($caution->nb_donneurs_ramenes >= $caution->nb_donneurs_attendus) {
            $caution->nb_donneurs_attendus = 0;
            $caution->statut = 'remboursee';
            $caution->date_remboursement = $validateData['date_remboursement'] ?? now();
        } else {
            $caution->nb_donneurs_attendus -= $validateData['nb_donneurs_ramenes'];
            $caution->statut = 'partiellement_remboursee';
        }
        $caution->save();
        return response()->json(['success' => true, 'message' => 'caution mis a jour ', 'caution' => $caution], 200);
    }

    public function show($id)
    {
        $user = Auth::user();
        $banque = $user->banqueSang;
        $caution = Caution::where('id', $id)->where('id_banque', $banque->id)->first();
        if (!$caution) {
            return response()->json(['succes' => false, 'message' => 'caution non trouvé'], 404);
        }
        return response()->json(['success' => true, 'caution' => $caution], 200);
    }

    public function statistics()
    {
        $user = Auth::user();
        $banque = $user->banqueSang;

        return response()->json([
            'total_cautions' => Caution::where('id_banque', $banque->id)->count(),

            'en_attente' => Caution::where('id_banque', $banque->id)
                ->where('statut', 'en_attente')
                ->count(),

            'remboursees' => Caution::where('id_banque', $banque->id)
                ->where('statut', 'remboursee')
                ->count(),

            'montant_total' => Caution::where('id_banque', $banque->id)
                ->sum('montant'),
        ]);
    }
}
