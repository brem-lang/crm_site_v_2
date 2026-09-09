<?php

use App\Services\GeoLocator;
use Illuminate\Http\Request;

test('the landing route strictly alternates between articles and prime-zone', function () {
    $expected = ['/articles', '/prime-zone', '/articles', '/prime-zone', '/articles', '/prime-zone'];

    foreach ($expected as $destination) {
        $this->get(route('landing'))->assertRedirect($destination);
    }
});

test('the landing route resumes alternation from wherever the counter left off', function () {
    $this->get(route('landing'))->assertRedirect('/articles');
    $this->get(route('landing'))->assertRedirect('/prime-zone');

    // A fresh "session" of requests should keep alternating, not reset.
    $this->get(route('landing'))->assertRedirect('/articles');
});

test('the landing split alternates independently per country bucket', function () {
    // Stub the country lookup rather than relying on the local-only
    // ?debug_country override, which is disabled in the testing
    // environment: report CA only for requests that ask for it, so the
    // "default" bucket assertions below exercise the real (null) country
    // path.
    $this->mock(GeoLocator::class)
        ->shouldReceive('countryCode')
        ->andReturnUsing(fn (Request $request) => $request->query('debug_country') === 'CA' ? 'CA' : null);

    // Burn through a couple of default-bucket visits first, so the two
    // buckets are out of step with each other.
    $this->get(route('landing'))->assertRedirect('/articles');
    $this->get(route('landing'))->assertRedirect('/prime-zone');

    // Canada visitors get their own counter, starting fresh at /articles
    // regardless of where the default bucket currently is.
    $this->get(route('landing', ['debug_country' => 'CA']))->assertRedirect('/articles');
    $this->get(route('landing', ['debug_country' => 'CA']))->assertRedirect('/prime-zone');
    $this->get(route('landing', ['debug_country' => 'CA']))->assertRedirect('/articles');

    // The default bucket keeps alternating undisturbed by the Canada hits.
    $this->get(route('landing'))->assertRedirect('/articles');
});
