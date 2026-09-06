<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard reports view counts for the tracked pages', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get('/articles');
    $this->get('/articles');
    $this->get('/prime-zone');

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('pageViews.articles.total', 2)
        ->where('pageViews.prime-zone.total', 1)
    );
});
