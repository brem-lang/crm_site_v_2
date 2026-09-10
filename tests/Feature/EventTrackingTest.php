<?php

use App\Models\PageView;
use App\Models\VisitorEvent;

test('journey events are recorded and roll up onto the page view', function () {
    $this->get('/articles');

    $pageView = PageView::query()->forKey('articles')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();
    $visitor = $session->visitor()->firstOrFail();

    $this->withCredentials()
        ->withCookie('vtr_id', $visitor->uuid)
        ->withCookie('vsn_id', $session->uuid)
        ->postJson('/t/event', [
            'events' => [
                ['type' => 'scroll_depth', 'data' => ['depth' => 50]],
                ['type' => 'cta_click', 'data' => ['text' => 'Sign up']],
                ['type' => 'page_exit', 'data' => ['time_spent_seconds' => 42, 'scroll_depth_max' => 75]],
            ],
        ])
        ->assertOk();

    $pageView->refresh();

    expect($pageView->scroll_depth_max)->toBe(75);
    expect($pageView->time_spent_seconds)->toBe(42);
    expect($pageView->is_exit)->toBeTrue();
    expect(VisitorEvent::where('visitor_session_id', $session->id)->count())->toBe(3);
    expect(VisitorEvent::where('event_type', 'cta_click')->value('event_data'))
        ->toBe(['text' => 'Sign up']);
});

test('a higher scroll_depth event wins over a lower one already recorded', function () {
    $this->get('/prime-zone');

    $pageView = PageView::query()->forKey('prime-zone')->firstOrFail();
    $session = $pageView->visitorSession()->firstOrFail();
    $visitor = $session->visitor()->firstOrFail();

    $post = fn (int $depth) => $this->withCredentials()
        ->withCookie('vtr_id', $visitor->uuid)
        ->withCookie('vsn_id', $session->uuid)
        ->postJson('/t/event', ['events' => [['type' => 'scroll_depth', 'data' => ['depth' => $depth]]]])
        ->assertOk();

    $post(75);
    $post(25);

    expect($pageView->refresh()->scroll_depth_max)->toBe(75);
});
