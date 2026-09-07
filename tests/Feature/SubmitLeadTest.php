<?php

use App\Models\PageView;
use Illuminate\Support\Facades\Http;

test('submitting a lead forwards click_id to the affiliate API and marks the page view converted', function () {
    Http::fake([
        '*' => Http::response(['success' => true, 'autologin_url' => 'https://example.test/auto-login'], 200),
    ]);

    $view = PageView::create([
        'key' => 'articles',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
    ]);

    $response = $this->postJson('/submit-lead', [
        'firstname' => 'Jane',
        'lastname' => 'Doe',
        'email' => 'jane@example.com',
        'mobile' => '5551234567',
        'country_code' => 'ph',
        'click_id' => $view->click_id,
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    Http::assertSent(function ($request) use ($view) {
        return $request['click_id'] === $view->click_id;
    });

    expect($view->fresh()->converted_at)->not->toBeNull();
});

test('submitting a lead without a click_id still succeeds', function () {
    Http::fake([
        '*' => Http::response(['success' => true], 200),
    ]);

    $response = $this->postJson('/submit-lead', [
        'firstname' => 'Jane',
        'lastname' => 'Doe',
        'email' => 'jane@example.com',
        'mobile' => '5551234567',
        'country_code' => 'ph',
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);
});

test('a failed affiliate API response does not mark the page view converted', function () {
    Http::fake([
        '*' => Http::response(['success' => false], 200),
    ]);

    $view = PageView::create([
        'key' => 'articles',
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
    ]);

    $response = $this->postJson('/submit-lead', [
        'firstname' => 'Jane',
        'lastname' => 'Doe',
        'email' => 'jane@example.com',
        'mobile' => '5551234567',
        'country_code' => 'ph',
        'click_id' => $view->click_id,
    ]);

    $response->assertStatus(502);
    expect($view->fresh()->converted_at)->toBeNull();
});
