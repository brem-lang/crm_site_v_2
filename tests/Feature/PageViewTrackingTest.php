<?php

use App\Models\PageView;

test('visiting /articles logs a page view and redirects to the article template', function () {
    $response = $this->get('/articles');

    $response->assertRedirect('/article-template/index.html');
    expect(PageView::query()->forKey('articles')->count())->toBe(1);
});

test('visiting /prime-zone logs a page view and redirects to the vortex template', function () {
    $response = $this->get('/prime-zone');

    $response->assertRedirect('/vortex-template/index.html');
    expect(PageView::query()->forKey('prime-zone')->count())->toBe(1);
});

test('each visit is logged separately', function () {
    $this->get('/articles');
    $this->get('/articles');
    $this->get('/prime-zone');

    expect(PageView::query()->forKey('articles')->count())->toBe(2);
    expect(PageView::query()->forKey('prime-zone')->count())->toBe(1);
});
