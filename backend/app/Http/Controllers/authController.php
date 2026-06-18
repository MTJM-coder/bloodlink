<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use App\Models\BanqueSang;


class authController extends Controller
{
    //
    public function login(Request $request)
    {
        // Validation des données de connexion
        $validatedData = $request->validate([
            'email_or_phone' => 'required|string|max:255',
            'password' => 'required|string|min:8',
        ]);


    $user= User::where('email', $validatedData['email_or_phone'])
    ->orWhere('telephone', $validatedData['email_or_phone'])
    ->first();

    if(!$user)
    {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    if(Hash::check($validatedData['password'], $user->password))
    {

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json(['message' => 'Connexion réussie', 'user' => $user, 'token' => $token], 200);
    }
    
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie'], 200);
    }

    public function profile()
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if ($user->role === 'banque') {
            $user->load('banqueSang');
        }
        else if ($user->role === 'citoyen') {
            $user->load('citoyen');
        }

        return response()->json(['user' => $user], 200);
    }
}