<?php

use App\Models\PageView;
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

test('dashboard reports view counts for the Canada template variants separately', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    PageView::create(['key' => 'articles', 'country' => 'Canada']);
    PageView::create(['key' => 'articles', 'country' => 'United Kingdom']);
    PageView::create(['key' => 'prime-zone', 'country' => 'Canada']);

    $response = $this->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('pageViews.articles.total', 2)
        ->where('pageViews.articles-canada.total', 1)
        ->where('pageViews.prime-zone.total', 1)
        ->where('pageViews.prime-zone-canada.total', 1)
    );
});

test('the visit_page filter can narrow recent visits to a Canada template variant', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    PageView::create(['key' => 'articles', 'country' => 'Canada']);
    PageView::create(['key' => 'articles', 'country' => 'United Kingdom']);
    PageView::create(['key' => 'prime-zone', 'country' => 'Canada']);

    $response = $this->get(route('dashboard', ['visit_page' => 'articles-canada']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('recentVisits.total', 1)
        ->where('recentVisits.data.0.country', 'Canada')
        ->where('recentVisits.data.0.key', 'articles')
    );
});

test('the search filter matches by click ID as well as country', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    PageView::create(['key' => 'articles', 'click_id' => 'wf0ajvfrc6v8mv4ljohf3f4c', 'country' => 'United Kingdom']);
    PageView::create(['key' => 'articles', 'click_id' => 'someotherclickid', 'country' => 'Canada']);

    $response = $this->get(route('dashboard', ['search' => 'wf0ajvfrc6v8mv4']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('recentVisits.total', 1)
        ->where('recentVisits.data.0.click_id', 'wf0ajvfrc6v8mv4ljohf3f4c')
    );
});
