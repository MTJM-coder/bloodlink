<?php

use App\Http\Controllers\alerteController;
use App\Http\Controllers\authController;
use App\Http\Controllers\citoyenController;
use App\Http\Controllers\banqueController;
use App\Http\Controllers\stockController;
use App\Http\Controllers\pocheController;
use App\Http\Controllers\searchController;
use App\Http\Controllers\reponseAlerteController;
use App\Http\Controllers\cautionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [authController::class, 'login'])->name('login');
Route::post('/auth/citizen/register', [citoyenController::class, 'register']);
Route::post('/auth/bank/register', [banqueController::class, 'register']);

Route::get('/blood/search', [searchController::class, 'searchBlood'])->name('blood.search');


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [authController::class, 'logout'])->name('logout');
    Route::get('/user/profile', [authController::class, 'profile'])->name('profile');

    Route::get('/alertes/actives', [ReponseAlerteController::class, 'alertesActives']);
    Route::post('/alertes/{id}/repondre', [ReponseAlerteController::class, 'repondre']);

    // Routes protégées pour les banques de sang
    Route::middleware('banque')->group(function () {
        Route::get('/bank/stock', [stockController::class, 'getMyStock'])->name('bank.stock');
        Route::post('/bank/stock', [pocheController::class, 'addStock'])->name('bank.stock.add');
        Route::put('/bank/poches/{id}/status', [pocheController::class, 'updateStatusPoche'])->name('poches.status.update');
        Route::delete('/bank/poches/{id}', [pocheController::class, 'archivePoche'])->name('poches.archive');


        // alerte

        Route::post('/bank/alerts', [alerteController::class, 'createAlert'])->name('bank.alerts.create');
        Route::get('/bank/alerts', [alerteController::class, 'getAlerts']);
        Route::put('/bank/alerts{id}/close', [alerteController::class, 'close']);

        // caution

        Route::post('/bank/cautions',[cautionController::class, 'store']);
        Route::get('/bank/cautions',[cautionController::class, 'index']);
        Route::get('/bank/cautions/{id}',[cautionController::class, 'show']);
        Route::put('/bank/cautions/{id}/rembourser',[cautionController::class, 'rembourser']);
        Route::get('/bank/cautions/statistics',[cautionController::class, 'statistics']);
    });
});
