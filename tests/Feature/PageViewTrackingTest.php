<?php

use App\Models\PageView;

test('visiting /articles logs a page view and redirects to the article template with an empty click_id', function () {
    $response = $this->get('/articles');

    PageView::query()->forKey('articles')->firstOrFail();
    $response->assertRedirect('/article-template/index.html?click_id=');
});

test('visiting /prime-zone logs a page view and redirects to the vortex template with an empty click_id', function () {
    $response = $this->get('/prime-zone');

    PageView::query()->forKey('prime-zone')->firstOrFail();
    $response->assertRedirect('/vortex-template/index.html?click_id=');
});

test('each visit is logged separately', function () {
    $this->get('/articles');
    $this->get('/articles');
    $this->get('/prime-zone');

    expect(PageView::query()->forKey('articles')->count())->toBe(2);
    expect(PageView::query()->forKey('prime-zone')->count())->toBe(1);
});

test('an upstream click_id survives the landing-split redirect and is stored on the page view', function () {
    $response = $this->get('/?click_id=wf0ajvfrc6v8mv4ljohf3f4c');

    $target = $response->headers->get('Location');
    expect($target)->toContain('?click_id=wf0ajvfrc6v8mv4ljohf3f4c');

    $this->get($target);

    $view = PageView::query()->where('click_id', 'wf0ajvfrc6v8mv4ljohf3f4c')->firstOrFail();
    expect($view->click_id)->toBe('wf0ajvfrc6v8mv4ljohf3f4c');
});

test('revisiting with the same click_id reuses the existing page view instead of erroring', function () {
    $this->get('/articles?click_id=wf0ajvfrc6v8mv4ljohf3f4c');
    $this->get('/articles?click_id=wf0ajvfrc6v8mv4ljohf3f4c');

    expect(PageView::query()->where('click_id', 'wf0ajvfrc6v8mv4ljohf3f4c')->count())->toBe(1);
});
