<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SubmitLeadController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Welcome page
Route::inertia('/nullypto', 'welcome')->name('home');

Route::get('/', function () {
    $destination = DB::transaction(function () {
        $counter = DB::table('redirect_counters')
            ->where('key', 'landing_split')
            ->lockForUpdate()
            ->first();

        $isEven = $counter->count % 2 === 0;

        DB::table('redirect_counters')
            ->where('key', 'landing_split')
            ->increment('count');

        return $isEven ? '/articles' : '/prime-zone';
    });

    return redirect($destination);
})->name('landing');

Route::post('/submit-lead', [SubmitLeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('submit-lead');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::get('/articles', function () {
    return redirect('/article-template/index.html');
})->middleware('track.view:articles');

Route::get('/prime-zone', function () {
    return redirect('/vortex-template/index.html');
})->middleware('track.view:prime-zone');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
