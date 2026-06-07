<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

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

    //     DB::beginTransaction();
    //     try{
    //         $user=new User();
    //         $user->nom=$validatedData['nom'];
    //         $user->email=$validatedData['email'];
    //         $user->role=$validatedData['role'];
    //         $user->password=Hash::make($validatedData['password']);
    //         $user->telephone=$validatedData['telephone'];
    //         $user->save();
    //         if($validatedData['role']=='citoyen'){
    //             $citoyen=new Citoyen();
    //             $citoyen->user_id=$user->id;
    //             $citoyen->save();
    //         }elseif($validatedData['role']=='banque'){
    //     }

    // }

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
}