<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use App\Models\VisitorEvent;
use App\Models\VisitorSession;
use App\Services\VisitorIdentityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EventController extends Controller
{
    /**
     * The event types given specialized handling beyond just being stored
     * as a row — everything else (cta_click, link_click, form_start,
     * form_submit, phone_click, whatsapp_click, telegram_click,
     * tab_hidden, tab_visible, video_start/progress/complete, ...) is
     * simply recorded as-is for the journey timeline.
     */
    private const SCROLL_DEPTH = 'scroll_depth';

    private const PAGE_EXIT = 'page_exit';

    /**
     * Record a batch of journey/engagement events for the current session,
     * sent by the tracker script/hook (public/js/tracker.js,
     * resources/js/lib/tracker.ts) — typically flushed every few seconds
     * and on page unload via sendBeacon.
     */
    public function store(Request $request, VisitorIdentityService $identity): JsonResponse
    {
        $validated = $request->validate([
            'events' => ['required', 'array', 'min:1', 'max:50'],
            'events.*.type' => ['required', 'string', 'max:64'],
            'events.*.data' => ['nullable', 'array'],
            'events.*.occurred_at' => ['nullable', 'date'],
        ]);

        $session = $identity->identify($request);
        $pageViewId = $session->exit_page_view_id;

        $rows = [];
        $now = now();

        foreach ($validated['events'] as $event) {
            $rows[] = [
                'visitor_session_id' => $session->id,
                'page_view_id' => $pageViewId,
                'event_type' => $event['type'],
                'event_data' => isset($event['data']) ? json_encode($event['data']) : null,
                'occurred_at' => isset($event['occurred_at']) ? Carbon::parse($event['occurred_at']) : $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        VisitorEvent::insert($rows);

        foreach ($validated['events'] as $event) {
            $this->applyRollup($session, $pageViewId, $event['type'], $event['data'] ?? []);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Roll a handful of event types forward into the page_view/session
     * summary columns, so the dashboard doesn't need to replay the raw
     * event log just to show scroll depth or time-on-page.
     *
     * @param  array<string, mixed>  $data
     */
    private function applyRollup(VisitorSession $session, ?int $pageViewId, string $type, array $data): void
    {
        if (! $pageViewId) {
            return;
        }

        match ($type) {
            self::SCROLL_DEPTH => $this->applyScrollDepth($pageViewId, $data),
            self::PAGE_EXIT => $this->applyPageExit($pageViewId, $data),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyScrollDepth(int $pageViewId, array $data): void
    {
        $depth = (int) ($data['depth'] ?? 0);

        if ($depth <= 0) {
            return;
        }

        PageView::where('id', $pageViewId)
            ->where(function ($query) use ($depth) {
                $query->whereNull('scroll_depth_max')->orWhere('scroll_depth_max', '<', $depth);
            })
            ->update(['scroll_depth_max' => $depth]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function applyPageExit(int $pageViewId, array $data): void
    {
        $timeSpent = isset($data['time_spent_seconds']) ? max(0, (int) $data['time_spent_seconds']) : null;
        $scrollDepth = isset($data['scroll_depth_max']) ? (int) $data['scroll_depth_max'] : null;

        $updates = ['left_at' => now(), 'is_exit' => true];

        if ($timeSpent !== null) {
            $updates['time_spent_seconds'] = $timeSpent;
        }

        $pageView = PageView::find($pageViewId);

        if (! $pageView) {
            return;
        }

        if ($scrollDepth !== null && ($pageView->scroll_depth_max === null || $scrollDepth > $pageView->scroll_depth_max)) {
            $updates['scroll_depth_max'] = $scrollDepth;
        }

        $pageView->forceFill($updates)->save();
    }
}
