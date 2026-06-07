<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Citoyen;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class citoyenController extends Controller
{
    //
    public function register(Request $request)
    {
        //
        $validatedData = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'telephone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'groupe_sanguin' => 'nullable|string|max:3',
            'rhesus' => 'nullable|string|max:3',
            'sexe' => 'required|in:M,F',
            'date_naissance' => 'required|date',
        ]);

        DB::beginTransaction();
        try{
            $user=new User();
            $user->nom=$validatedData['nom'];
            $user->prenom=$validatedData['prenom'] ?? null;
            $user->email=$validatedData['email'] ?? null;
            $user->telephone=$validatedData['telephone'];
            $user->password=Hash::make($validatedData['password']);
            $user->role='citoyen';
            $user->save();

            $citoyen=new Citoyen();
            $citoyen->user_id=$user->id;
            $citoyen->groupe_sanguin=$validatedData['groupe_sanguin'] ?? null;
            $citoyen->rhesus=$validatedData['rhesus'] ?? null;
            $citoyen->sexe=$validatedData['sexe'];
            $citoyen->date_naissance=$validatedData['date_naissance'];
            $citoyen->save();
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
