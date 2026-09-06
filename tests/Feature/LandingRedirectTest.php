<?php

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
