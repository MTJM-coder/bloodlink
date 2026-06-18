<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\BanqueSang;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class banqueController extends Controller
{
    // 
    
    public function register(Request $request)
    {
        // Validation des données d'entrée
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'ville' => 'required|string|max:255',
            'quartier' => 'required|string|max:255',
            'telephone' => 'required|string|unique:users,telephone|max:20',
            'type_banque' => 'required|in:reconnue,district',
        ]);

        DB::beginTransaction();
        try {
            // Création de l'utilisateur
            $user = new User();
            $user->nom = $validatedData['nom'];
            $user->email = $validatedData['email'] ?? null;
            $user->telephone = $validatedData['telephone'];
            $user->password = Hash::make($validatedData['password']);
            $user->role = 'banque';
            $user->save();

            // Création de la banque de sang associée à l'utilisateur
            $banqueSang = new BanqueSang();
            $banqueSang->nom = $validatedData['nom'];
            $banqueSang->ville = $validatedData['ville'];
            $banqueSang->quartier = $validatedData['quartier'];
            // $banqueSang->telephone = $validatedData['telephone'];
            $banqueSang->type_banque = $validatedData['type_banque'];
            $banqueSang->user_id = $user->id;
            $banqueSang->save();

            $token = $user->createToken('auth_token')->plainTextToken;

             // Commit de la transaction
             DB::commit();
             return response()->json(['message' => 'Inscription réussie', 'user' => $user, 'token' => $token], 201);
         } catch (\Exception $e) {
             DB::rollBack();
             return response()->json(['message' => 'Erreur lors de l\'inscription', 'error' => $e->getMessage()], 500);
         }
    } 
    
    // profil

    public function profil()
    {
        
        $user = Auth::user();
        $banque = $user->banqueSang;

        if (!$banque) {
            return response()->json(['success' => false, 'message' => 'Aucune banque associée'], 403);
        }

        return response()->json([
            'success' => true,
            'banque' => [
                'id' => $banque->id,
                'nom' => $banque->nom,
                'ville' => $banque->ville,
                'quartier' => $banque->quartier,
                'latitude' => $banque->latitude,
                'longitude' => $banque->longitude,
                'type_banque' => $banque->type_banque,
                'statut' => $banque->statut,
                'telephone' => $user->telephone,
                'email' => $user->email,
            ],
        ], 200);
    }

    public function updateProfil(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $banque = $user->banqueSang;

        if (!$banque) {
            return response()->json(['success' => false, 'message' => 'Aucune banque associée'], 403);
        }

        $validated = $request->validate([
            'quartier' => 'required|string|max:100',
            'ville' => 'required|string|max:100',
            'telephone' => 'required|string|max:20',
        ]);

        $banque->update([
            'quartier' => $validated['quartier'],
            'ville' => $validated['ville'],
        ]);

        $user->update([
            'telephone' => $validated['telephone'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour',
            'banque' => [
                'id' => $banque->id,
                'nom' => $banque->nom,
                'ville' => $banque->ville,
                'quartier' => $banque->quartier,
                'type_banque' => $banque->type_banque,
                'statut' => $banque->statut,
                'telephone' => $user->telephone,
                'email' => $user->email,
            ],
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'mot_de_passe_actuel' => 'required|string',
            'nouveau_mot_de_passe' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['mot_de_passe_actuel'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect',
            ], 422);
        }

        $user->password = Hash::make($validated['nouveau_mot_de_passe']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour',
        ], 200);
    }

}
