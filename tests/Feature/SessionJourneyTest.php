<?php

use App\Models\PageView;
use App\Models\User;

test('guests cannot view a session journey', function () {
    $this->get('/articles');
    $session = PageView::query()->forKey('articles')->firstOrFail()->visitorSession()->firstOrFail();

    $this->get("/dashboard/sessions/{$session->id}")->assertRedirect('/login');
});

test('an authenticated user can view a session journey with its timeline', function () {
    $this->get('/articles');

    $pageView = PageView::query()->forKey('articles')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();

    $this->withCredentials()
        ->withCookie('vtr_id', $session->visitor()->firstOrFail()->uuid)
        ->withCookie('vsn_id', $session->uuid)
        ->postJson('/t/event', [
            'events' => [
                ['type' => 'cta_click', 'data' => ['text' => 'Sign up']],
            ],
        ])
        ->assertOk();

    $user = User::factory()->create();

    $response = $this->actingAs($user)->get("/dashboard/sessions/{$session->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/sessions/show')
        ->where('session.id', $session->id)
        ->where('session.uuid', $session->uuid)
        ->has('timeline', 2)
    );
});
