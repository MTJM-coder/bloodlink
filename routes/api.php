<?php

use App\Http\Controllers\authController;
use App\Http\Controllers\citoyenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/auth/login', [authController::class, 'login']);
Route::post('/auth/citizen/register', [citoyenController::class, 'register']);