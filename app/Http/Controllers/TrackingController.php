<?php

namespace App\Http\Controllers;

use App\Services\VisitorIdentityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    /**
     * Record client-only details (screen/viewport size, language, timezone,
     * page-load time) that the server can't see, and mark the session as
     * JS-enabled. Called once per page load by the tracker script/hook —
     * both the Inertia app and the static ad-template pages (which never
     * go through TrackPageView) hit this, so it's also the only tracking
     * touchpoint for those static pages.
     */
    public function clientInfo(Request $request, VisitorIdentityService $identity): JsonResponse
    {
        $validated = $request->validate([
            'screen_resolution' => ['nullable', 'string', 'max:32'],
            'viewport_size' => ['nullable', 'string', 'max:32'],
            'browser_language' => ['nullable', 'string', 'max:32'],
            'site_language' => ['nullable', 'string', 'max:16'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'page_load_ms' => ['nullable', 'integer', 'min:0', 'max:600000'],
        ]);

        $session = $identity->identify($request);

        $session->forceFill([
            ...array_filter($validated, fn ($value) => $value !== null),
            'js_enabled' => true,
        ])->save();

        return response()->json(['ok' => true]);
    }
}
