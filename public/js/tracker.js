/**
 * Visitor journey/engagement tracker.
 *
 * The visitor/session identity itself is resolved server-side from cookies
 * (see App\Services\VisitorIdentityService) on the /articles, /prime-zone,
 * or /nullypto hit that led here. This script reports everything only the
 * browser can see:
 *
 *  - once per page load: screen/viewport size, language, timezone, page
 *    load time (POST /t/client-info)
 *  - throughout the page's life: scroll-depth checkpoints, CTA/link
 *    clicks, phone/WhatsApp/Telegram clicks, form start/submit, tab
 *    visibility, and a final page_exit (time on page + max scroll depth)
 *    on unload (POST /t/event, batched)
 *
 * Included on both the static ad-template pages (public/article-template*,
 * public/vortex-template*) and, via a <script> tag in <Head>, the Inertia
 * app's welcome page — see resources/js/pages/welcome.tsx.
 */
(function () {
    var pageStartedAt = Date.now();
    var maxScrollPercent = 0;
    var firedScrollThresholds = {};
    var startedForms = {};
    var eventQueue = [];
    var flushTimer = null;

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function resolveTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
        } catch (e) {
            return null;
        }
    }

    function resolvePageLoadMs() {
        try {
            var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
            if (nav && nav.loadEventEnd > 0) {
                return Math.round(nav.loadEventEnd - nav.startTime);
            }
            if (performance.timing && performance.timing.loadEventEnd > 0) {
                return performance.timing.loadEventEnd - performance.timing.navigationStart;
            }
        } catch (e) {
            // Ignore — page-load timing is a nice-to-have, not essential.
        }
        return null;
    }

    function sendClientInfo() {
        var payload = {
            screen_resolution: window.screen ? window.screen.width + 'x' + window.screen.height : null,
            viewport_size: window.innerWidth + 'x' + window.innerHeight,
            browser_language: navigator.language || null,
            site_language: document.documentElement.lang || null,
            timezone: resolveTimezone(),
            page_load_ms: resolvePageLoadMs(),
        };

        fetch('/t/client-info', {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: true,
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        }).catch(function () {});
    }

    // A small delay after `load` gives the browser a moment to finalize
    // `loadEventEnd` so resolvePageLoadMs() isn't racing the event itself.
    function whenLoaded(callback) {
        if (document.readyState === 'complete') {
            setTimeout(callback, 0);
        } else {
            window.addEventListener('load', function () {
                setTimeout(callback, 0);
            });
        }
    }

    // --- Event queue -------------------------------------------------

    function pushEvent(type, data) {
        eventQueue.push({ type: type, data: data || null, occurred_at: new Date().toISOString() });

        if (eventQueue.length >= 20) {
            flush(false);
        }
    }

    function flush(useBeacon) {
        if (! eventQueue.length) {
            return;
        }

        var body = JSON.stringify({ events: eventQueue });
        eventQueue = [];

        if (useBeacon && navigator.sendBeacon) {
            navigator.sendBeacon('/t/event', new Blob([body], { type: 'application/json' }));
            return;
        }

        fetch('/t/event', {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: true,
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: body,
        }).catch(function () {});
    }

    function scheduleFlush() {
        if (flushTimer) {
            return;
        }
        flushTimer = setInterval(function () {
            flush(false);
        }, 5000);
    }

    // --- Scroll depth --------------------------------------------------

    function checkScrollDepth() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var percent = scrollable > 0 ? Math.min(100, Math.round((scrollTop / scrollable) * 100)) : 100;

        if (percent > maxScrollPercent) {
            maxScrollPercent = percent;
        }

        [25, 50, 75, 100].forEach(function (threshold) {
            if (percent >= threshold && ! firedScrollThresholds[threshold]) {
                firedScrollThresholds[threshold] = true;
                pushEvent('scroll_depth', { depth: threshold });
            }
        });
    }

    var scrollTicking = false;
    window.addEventListener(
        'scroll',
        function () {
            if (scrollTicking) {
                return;
            }
            scrollTicking = true;
            requestAnimationFrame(function () {
                checkScrollDepth();
                scrollTicking = false;
            });
        },
        { passive: true },
    );

    // --- Clicks: CTAs, links, phone/WhatsApp/Telegram -------------------

    function textOf(el) {
        return ((el && el.textContent) || '').trim().slice(0, 80);
    }

    document.addEventListener(
        'click',
        function (event) {
            var el = event.target && event.target.closest && event.target.closest('a, button, [data-track-event]');
            if (! el) {
                return;
            }

            var explicitType = el.getAttribute('data-track-event');
            if (explicitType) {
                pushEvent(explicitType, { text: textOf(el) });
                return;
            }

            if (el.tagName === 'BUTTON') {
                pushEvent('cta_click', { text: textOf(el) });
                return;
            }

            var href = el.getAttribute('href') || '';

            if (href.indexOf('tel:') === 0) {
                pushEvent('phone_click', { href: href });
            } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
                pushEvent('whatsapp_click', { href: href });
            } else if (href.indexOf('t.me') !== -1 || href.indexOf('telegram') !== -1) {
                pushEvent('telegram_click', { href: href });
            } else if (el.className && String(el.className).indexOf('btn') !== -1) {
                pushEvent('cta_click', { href: href, text: textOf(el) });
            } else {
                pushEvent('link_click', { href: href, text: textOf(el) });
            }
        },
        true,
    );

    // --- Form lifecycle --------------------------------------------------

    function formKey(form) {
        return form.getAttribute('id') || form.getAttribute('name') || 'form';
    }

    document.addEventListener('focusin', function (event) {
        var form = event.target && event.target.closest && event.target.closest('form');
        if (! form) {
            return;
        }
        var key = formKey(form);
        if (! startedForms[key]) {
            startedForms[key] = true;
            pushEvent('form_start', { form: key });
        }
    });

    document.addEventListener('submit', function (event) {
        var form = event.target;
        if (! form || form.tagName !== 'FORM') {
            return;
        }
        pushEvent('form_submit', { form: formKey(form) });
        flush(false);
    });

    // --- Tab visibility --------------------------------------------------

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            pushEvent('tab_hidden');
            flush(true);
        } else {
            pushEvent('tab_visible');
        }
    });

    // --- Page exit ---------------------------------------------------

    function reportPageExit() {
        pushEvent('page_exit', {
            time_spent_seconds: Math.round((Date.now() - pageStartedAt) / 1000),
            scroll_depth_max: maxScrollPercent,
        });
        flush(true);
    }

    window.addEventListener('pagehide', reportPageExit);

    // --- Boot ---------------------------------------------------------

    whenLoaded(function () {
        sendClientInfo();
        checkScrollDepth();
        scheduleFlush();
    });

    // Public API for pages that want to report their own events directly
    // (e.g. a custom conversion step) instead of via data-track-event.
    window.Tracker = window.Tracker || {
        track: function (type, data) {
            pushEvent(type, data);
        },
    };
})();
