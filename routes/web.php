<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GeoController;
use App\Http\Controllers\SubmitLeadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Welcome page
Route::inertia('/nullypto', 'welcome')->name('home');

Route::get('/', function (Request $request) {
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

    // Preserve the click_id an upstream ad-tracking redirect (e.g. koventrax)
    // handed us, so it survives the internal landing-split redirect.
    if ($clickId = $request->query('click_id')) {
        $destination .= '?click_id='.urlencode($clickId);
    }

    return redirect($destination);
})->name('landing');

Route::post('/submit-lead', [SubmitLeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('submit-lead');

Route::get('/geo/country-code', [GeoController::class, 'countryCode'])
    ->middleware('throttle:30,1')
    ->name('geo.country-code');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::get('/articles', function (Request $request) {
    return redirect('/article-template/index.html?click_id='.$request->attributes->get('click_id'));
})->middleware('track.view:articles');

Route::get('/prime-zone', function (Request $request) {
    return redirect('/vortex-template/index.html?click_id='.$request->attributes->get('click_id'));
})->middleware('track.view:prime-zone');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
