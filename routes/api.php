<?php

use App\Http\Controllers\authController;
use App\Http\Controllers\citoyenController;
use App\Http\Controllers\banqueController;
use App\Http\Controllers\stockController;
use App\Http\Controllers\pocheController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [authController::class, 'login'])->name('login');
Route::post('/auth/citizen/register', [citoyenController::class, 'register']);
Route::post('/auth/bank/register', [banqueController::class, 'register']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [authController::class, 'logout'])->name('logout');
    Route::get('/user/profile', [authController::class, 'profile'])->name('profile'); 


    // Routes protégées pour les banques de sang
    Route::middleware('banque')->group(function () {
        Route::get('/bank/stock', [stockController::class, 'getMyStock'])->name('bank.stock');
        Route::post('/bank/stock', [pocheController::class, 'addStock'])->name('bank.stock.add');
        Route::put('/bank/poches/{id}/status',[pocheController::class, 'updateStatusPoche'])->name('poches.status.update');
        Route::delete('/bank/poches/{id}', [pocheController::class, 'archivePoche'])->name('poches.archive');

    });
});