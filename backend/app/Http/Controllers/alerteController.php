<?php

namespace App\Http\Controllers;

use App\Models\Citoyen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Alerte;

class alerteController extends Controller
{
    //
    public function createAlert(Request $request)
    {

        $user = Auth::user();
        $banqueSang = $user->banqueSang;
        $validated = $request->validate([
            'groupe_sanguin' => 'required|in:O,A,B,AB',
            'rhesus' => 'required|in:+,-',
            'type_alerte' => 'required|in:urgence_immediate,reconstitution',
            // 'type_produit' => 'required|in:CGR,plasma,plaquettes',
            'type_don_accepte' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:255',
            'rayon' => 'nullable|integer|min:1'
        ]);

        // Logique de création d'alerte


        $alerte = new Alerte();
        $alerte->id_banque = $banqueSang->id;
        $alerte->groupe_sanguin = $validated['groupe_sanguin'];
        $alerte->rhesus = $validated['rhesus'];
        $alerte->type_alerte = $validated['type_alerte'];
        $alerte->type_don_accepte = $validated['type_don_accepte'] ?? null;
        $alerte->message = $validated['message'] ?? null;
        $alerte->save();

        // trouver des citoyens compatibles
        $citoyensCompatibles = $this->trouverCitoyensCompatibles($banqueSang, $validated['groupe_sanguin'], $validated['rhesus'], $validated['rayon']);

        // Envoyer des notifications aux citoyens compatibles

        $notificationsEnvoyees = $this->envoyerNotifications($citoyensCompatibles, $alerte);





        return response()->json([
            'success' => true,
            'message' => 'Alerte créée avec succès',
            'alert' => [
                'groupe_sanguin' => $alerte->groupe_sanguin . $alerte->rhesus,
                'type_alerte' => $alerte->type_alerte,
                'type_don_accepte' => $alerte->type_don_accepte,
                'message' => $alerte->message,
                'nb_citoyens_notifies' => count($citoyensCompatibles),
            ]
        ], 201);
    }

    private function trouverCitoyensCompatibles($banqueSang, $groupeSanguin, $rhesus, $rayon)
    {
        $citoyens = Citoyen::where('groupe_sanguin', $groupeSanguin)
            ->where('rhesus', $rhesus)
            ->where('disponible', true)
            ->get();
        $citoyensProches = [];
        foreach ($citoyens as $citoyen) {
            if ($citoyen->localisation_lat && $citoyen->localisation_lng) {
                $distance = $this->calculerDistance($banqueSang->latitude, $banqueSang->longitude, $citoyen->localisation_lat, $citoyen->localisation_lng);
                if ($distance <= $rayon) {
                    $citoyensProches[] = $citoyen;
                }
            }
        }

        return $citoyensProches;
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
    private function envoyerNotifications($citoyen, $alerte)
    {
        if (!$citoyen->fcm_token) {
            return;
        }

        try {
            $url = 'https://exp.host/--/api/v2/push/send';

            $data = [
                'to' => $citoyen->fcm_token,
                'title' => "Alerte BloodLink — {$alerte->groupe_sanguin}{$alerte->rhesus}",
                'body' => "Une banque près de vous a besoin de sang {$alerte->groupe_sanguin}{$alerte->rhesus}",
                'sound' => 'default',
                'data' => [
                    'alerte_id' => (string) $alerte->id_alerte,
                    'groupe' => $alerte->groupe_sanguin . $alerte->rhesus,
                    'type' => $alerte->type_alerte,
                ],
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            $result = curl_exec($ch);
            curl_close($ch);

            Log::info('Notification envoyée via Expo', ['result' => $result]);
        } catch (\Exception $e) {
            Log::error('Erreur Expo Push: ' . $e->getMessage());
        }
    }


    public function getAlerts()
    {
        $user = Auth::user();
        $banqueSang = $user->banqueSang;

        $alerts = Alerte::with('reponsesAlertes')->where('id_banque', $banqueSang->id)
            ->orderBy('created_at')
            ->get();
        return response()->json([
            'success' => true,
            'alertes' => $alerts
        ], 200);
    }

    public function close($id)
    {
        $user = Auth::user();
        $banqueSang = $user->banqueSang;
        $alerte = Alerte::where('id', $id)
            ->where('id_banque', $banqueSang->id)
            ->first();
        if (!$alerte) {
            return response()->json(['success' => false, 'message' => "alerte non trouvée"], 404);
        }
        $alerte->statut = 'cloture';
        $alerte->save();

        return response()->json([
            'success' => true,
            'message' => 'Alerte cloturée'
        ], 200);
    }
}
