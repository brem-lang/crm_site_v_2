<?php

use App\Console\Commands\FlagNonJsVisitorSessions;
use App\Models\PageView;
use App\Models\VisitorSession;
use App\Services\GeoLocator;
use Illuminate\Support\Facades\Http;

test('a bot user agent is flagged and scored on the session', function () {
    $this->withHeaders(['User-Agent' => 'curl/8.4.0'])->get('/articles');

    $pageView = PageView::query()->forKey('articles')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();

    expect($session->is_bot)->toBeTrue();
    expect($session->risk_reasons)->toContain('bot_user_agent');
    expect($session->risk_score)->toBeGreaterThanOrEqual(50);
});

test('a proxy/hosting IP contributes to the risk score', function () {
    $this->mock(GeoLocator::class)
        ->shouldReceive('countryCode')->andReturn('US')
        ->shouldReceive('resolveClientIp')->andReturn('203.0.113.5')
        ->shouldReceive('geoDetails')->andReturn(['proxy' => true, 'hosting' => true])
        ->shouldReceive('cloudflareCountryCode')->andReturn(null);

    $this->get('/articles');

    $pageView = PageView::query()->forKey('articles')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();

    expect($session->is_proxy)->toBeTrue();
    expect($session->is_hosting)->toBeTrue();
    expect($session->risk_reasons)->toContain('proxy_or_vpn', 'hosting_provider');
    expect($session->risk_score)->toBe(40);
});

test('submitting a lead within seconds of the session starting is flagged as a fast submission', function () {
    Http::fake(['*' => Http::response(['success' => true], 200)]);

    $this->get('/articles');

    $pageView = PageView::query()->forKey('articles')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();
    $visitor = $session->visitor()->firstOrFail();

    $this->withCredentials()
        ->withCookie('vtr_id', $visitor->uuid)
        ->withCookie('vsn_id', $session->uuid)
        ->postJson('/submit-lead', [
            'firstname' => 'Jane',
            'lastname' => 'Doe',
            'email' => 'jane@example.com',
            'mobile' => '5551234567',
            'country_code' => 'ph',
        ])
        ->assertOk();

    expect($session->refresh()->risk_reasons)->toContain('fast_form_submission');
});

test('the flag-non-js-sessions command flags stale non-JS sessions as bots and rescoring their risk', function () {
    $this->get('/articles');

    $session = VisitorSession::query()->firstOrFail();
    $session->forceFill([
        'js_enabled' => false,
        'created_at' => now()->subMinutes(5),
    ])->save();

    $this->artisan(FlagNonJsVisitorSessions::class)->assertSuccessful();

    $session->refresh();
    expect($session->is_bot)->toBeTrue();
    expect($session->risk_reasons)->toContain('bot_user_agent');
});
