<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\BanqueSang;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

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
}
