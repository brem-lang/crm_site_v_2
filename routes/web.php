<?php

use App\Http\Controllers\GeoController;
use App\Http\Controllers\SubmitLeadController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('/submit-lead', [SubmitLeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('submit-lead');

Route::get('/geo/country-code', [GeoController::class, 'countryCode'])
    ->middleware('throttle:30,1')
    ->name('geo.country-code');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
