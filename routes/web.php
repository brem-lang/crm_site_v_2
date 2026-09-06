<?php

use App\Http\Controllers\SubmitLeadController;
use Illuminate\Support\Facades\Route;

// Normal homepage → welcome.tsx
Route::inertia('/nullypto', 'welcome')->name('home');

// Random redirect
Route::get('/', function () {
    return rand(0, 1)
        ? redirect('/articles')
        : redirect('/prime-zone');
})->name('landing');

Route::post('/submit-lead', [SubmitLeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('submit-lead');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/articles', function () {
    return redirect('/article-template/index.html');
});

Route::get('/prime-zone', function () {
    return redirect('/vortex-template/index.html');
});

require __DIR__.'/settings.php';
