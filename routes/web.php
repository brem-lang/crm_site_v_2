<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GeoController;
use App\Http\Controllers\SubmitLeadController;
use App\Services\GeoLocator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Welcome page
Route::inertia('/nullypto', 'welcome')->name('home');

Route::get('/', function (Request $request, GeoLocator $geoLocator) {
    // Split articles/prime-zone traffic evenly, but keep a separate
    // even/odd counter per country bucket so, say, a run of Canadian
    // visitors doesn't skew which ad UK visitors land on next (and vice
    // versa).
    $bucket = $geoLocator->countryCode($request) === 'CA' ? 'CA' : 'default';
    $key = "landing_split:{$bucket}";

    // Ensure this bucket's counter row exists before we try to lock it.
    // insertOrIgnore is safe under concurrent first-hits for the same
    // bucket: the unique `key` constraint lets exactly one insert win and
    // silently drops the rest, instead of racing on a lockForUpdate
    // against a row that doesn't exist yet.
    DB::table('redirect_counters')->insertOrIgnore([
        'key' => $key,
        'count' => 0,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $destination = DB::transaction(function () use ($key) {
        $counter = DB::table('redirect_counters')
            ->where('key', $key)
            ->lockForUpdate()
            ->first();

        $isEven = $counter->count % 2 === 0;

        DB::table('redirect_counters')
            ->where('key', $key)
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

Route::get('/articles', function (Request $request, GeoLocator $geoLocator) {
    $template = $geoLocator->countryCode($request) === 'CA' ? 'article-template-canada' : 'article-template';

    return redirect("/{$template}/index.html?click_id=".$request->attributes->get('click_id'));
})->middleware('track.view:articles');

Route::get('/prime-zone', function (Request $request, GeoLocator $geoLocator) {
    $template = $geoLocator->countryCode($request) === 'CA' ? 'vortex-template-canada' : 'vortex-template';

    return redirect("/{$template}/index.html?click_id=".$request->attributes->get('click_id'));
})->middleware('track.view:prime-zone');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
