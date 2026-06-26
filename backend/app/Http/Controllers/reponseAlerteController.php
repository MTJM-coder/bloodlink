<?php

namespace App\Http\Controllers;

use App\Models\Alerte;
use App\Models\ReponseAlerte;
use App\Models\Citoyen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class reponseAlerteController extends Controller
{
    // GET /api/alertes/actives?lat=X&lng=Y
    public function alertesActives(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'rayon' => 'nullable|integer|min:1|max:50',
        ]);

        $rayon = $validated['rayon'] ?? 10;
        $userLat = $validated['lat'];
        $userLng = $validated['lng'];
        $user = Auth::user();
        $citoyen = $user->citoyen;

        // Récupérer les alertes actives
        $alertes = Alerte::where('statut', 'active')->get();
        $alertesProches = [];
        
        foreach ($alertes as $alerte) {
            $banque = $alerte->banqueSang;
            $distance = $this->calculerDistance(
                $userLat,
                $userLng,
                $banque->latitude,
                $banque->longitude
            );

            if ($distance <= $alerte->rayon_km) {
                
                $eligibilite = $this->verifierEligibilite($citoyen, $alerte);
                $alertesProches[] = [
                    'id_alerte' => $alerte->id,
                    'type_alerte' => $alerte->type_alerte,
                    'groupe' => $alerte->groupe_sanguin . $alerte->rhesus,
                    'banque' => [
                        'id' => $banque->id,
                        'nom' => $banque->nom,
                        'adresse' => $banque->adresse,
                        'telephone' => $banque->telephone,
                    ],
                    'distance_km' => round($distance, 2),
                    'message' => $alerte->message,
                    'eligible' => $eligibilite['eligible'],
                    'raison_ineligibilite' => $eligibilite['raison'] ?? null,
                ];
            }
        }

        usort($alertesProches, function ($a, $b) {
            return $a['distance_km'] <=> $b['distance_km'];
        });

        return response()->json([
            'success' => true,
            'alertes' => $alertesProches,
            'nb_alertes' => count($alertesProches),
        ], 200);
    }

    // POST /api/alertes/{id}/repondre
    public function repondre(Request $request, $id)
    {
        $user = Auth::user();
        $citoyen = $user->citoyen;

        $alerte = Alerte::find($id);
        if (!$alerte || $alerte->statut !== 'actvie') {
            return response()->json(['success' => false, 'message' => 'Alerte non trouvée'], 404);
        }

        // Vérifier éligibilité
        $eligibilite = $this->verifierEligibilite($citoyen, $alerte);
        if (!$eligibilite['eligible']) {
            return response()->json([
                'success' => false,
                'message' => $eligibilite['raison']
            ], 422);
        }

        // Générer QR code unique
        // $qrCode = $this->genererQRCode($citoyen->id_citoyen, $alerte->id_alerte);
        $qrCode = 'YAB-'.date('Y') . '-' . str_pad($alerte->id, 4, '0', STR_PAD_LEFT) . '-' . str_pad($citoyen->id, 4, '0', STR_PAD_LEFT);

        // Créer la réponse
        $reponse = new ReponseAlerte();
        $reponse->id_alerte=$alerte->id;
        $reponse->id_citoyen = $citoyen->id;
        $reponse->qr_code = $qrCode;
        $reponse->date_reponse = now();
        $reponse->save();
        

        // Notifier la banque 
        Log::info('Citoyen a répondu à alerte', [
            'citoyen' => $user->nom . ' ' . $user->prenom,
            'telephone' => $user->telephone,
            'alerte_id' => $alerte->id,
            'qr_code' => $qrCode,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réponse enregistrée',
            'reponse' => [
                'id_reponse' => $reponse->id,
                'numeroReponse' => $qrCode,
                'banque' => $alerte->banque->nom,
                'adresse' => $alerte->banque->adresse,
                'telephone' => $alerte->banque->telephone,
                'groupe' => $alerte->groupe_sanguin . $alerte->rhesus,
                'instructions' => 'Présentez votre QR Code en arrivant à la banque',
            ]
        ], 201);
    }

    private function verifierEligibilite($citoyen, $alerte)
    {
        // Vérifier groupe sanguin
        if ($citoyen->groupe_sanguin !== $alerte->groupe_sanguin || 
            $citoyen->rhesus !== $alerte->rhesus) {
            return [
                'eligible' => false,
                'raison' => 'Groupe sanguin incompatible',
            ];
        }

        // Vérifier 4 mois depuis dernier don
        if ($citoyen->date_dernier_don) {
            $dateMinimale = $citoyen->date_dernier_don->addMonths(4);
            if (now()->lessThan($dateMinimale)) {
                return [
                    'eligible' => false,
                    'raison' => "Vous pouvez donner à partir du {$dateMinimale->format('d/m/Y')}",
                ];
            }
        }

        // Vérifier questionnaire santé
        if ($citoyen->a_tatouage_recent || 
            $citoyen->maladies_cardiovasculaires || 
            $citoyen->douleurs_thoraciques || 
            $citoyen->consomme_alcool) {
            return [
                'eligible' => false,
                'raison' => 'Vous ne remplissez pas les critères de santé actuellement',
            ];
        }

        return ['eligible' => true];
    }

    private function genererQRCode($citoyenId, $alerteId)
    {
        
        $timestamp = time();
        $data = "{$citoyenId}|{$alerteId}|{$timestamp}";
        $hash = hash('sha256', $data . config('app.key'));
        
        return base64_encode("{$data}|" . substr($hash, 0, 16));
    }

    private function calculerDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}