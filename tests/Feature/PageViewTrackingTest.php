<?php

use App\Models\PageView;

test('visiting /articles logs a page view and redirects to the article template with its click_id', function () {
    $response = $this->get('/articles');

    $view = PageView::query()->forKey('articles')->firstOrFail();
    $response->assertRedirect("/article-template/index.html?click_id={$view->click_id}");
});

test('visiting /prime-zone logs a page view and redirects to the vortex template with its click_id', function () {
    $response = $this->get('/prime-zone');

    $view = PageView::query()->forKey('prime-zone')->firstOrFail();
    $response->assertRedirect("/vortex-template/index.html?click_id={$view->click_id}");
});

test('each visit is logged separately', function () {
    $this->get('/articles');
    $this->get('/articles');
    $this->get('/prime-zone');

    expect(PageView::query()->forKey('articles')->count())->toBe(2);
    expect(PageView::query()->forKey('prime-zone')->count())->toBe(1);
});
