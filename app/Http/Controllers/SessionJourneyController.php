<?php

namespace App\Http\Controllers;

use App\Models\VisitorSession;
use Carbon\CarbonInterface;
use Inertia\Inertia;
use Inertia\Response;

class SessionJourneyController extends Controller
{
    /**
     * Display a single visitor session's full journey: its identity/geo/
     * device/UTM summary plus a chronological timeline merging page views,
     * journey/engagement events, and any lead submitted during it.
     */
    public function show(VisitorSession $visitorSession): Response
    {
        $visitorSession->load(['visitor', 'pageViews', 'events', 'leads']);

        return Inertia::render('dashboard/sessions/show', [
            'session' => $this->presentSession($visitorSession),
            'timeline' => $this->buildTimeline($visitorSession),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function presentSession(VisitorSession $session): array
    {
        return [
            'id' => $session->id,
            'uuid' => $session->uuid,
            'visitor' => [
                'uuid' => $session->visitor?->uuid,
                'total_visits' => $session->visitor?->total_visits,
                'first_seen_at' => $session->visitor?->first_seen_at,
            ],

            'started_at' => $session->started_at,
            'last_activity_at' => $session->last_activity_at,
            'duration_seconds' => $session->duration_seconds,
            'pages_viewed' => $session->pages_viewed,
            'is_first_time_visitor' => $session->is_first_time_visitor,
            'previous_visits_count' => $session->previous_visits_count,

            'ip_address' => $session->ip_address,
            'country' => $session->country,
            'region' => $session->region,
            'city' => $session->city,
            'timezone' => $session->timezone,
            'isp' => $session->isp,
            'asn' => $session->asn,
            'is_mobile_carrier' => $session->is_mobile_carrier,

            'device_type' => $session->device_type,
            'device_brand' => $session->device_brand,
            'device_model' => $session->device_model,
            'os' => $session->os,
            'os_version' => $session->os_version,
            'browser' => $session->browser,
            'browser_version' => $session->browser_version,
            'screen_resolution' => $session->screen_resolution,
            'viewport_size' => $session->viewport_size,
            'browser_language' => $session->browser_language,
            'site_language' => $session->site_language,

            'referrer_url' => $session->referrer_url,
            'referrer_domain' => $session->referrer_domain,
            'traffic_source' => $session->traffic_source,
            'utm_source' => $session->utm_source,
            'utm_medium' => $session->utm_medium,
            'utm_campaign' => $session->utm_campaign,
            'utm_content' => $session->utm_content,
            'utm_term' => $session->utm_term,
            'campaign_id' => $session->campaign_id,
            'affiliate_id' => $session->affiliate_id,
            'click_id' => $session->click_id,
            'landing_url' => $session->landing_url,

            'js_enabled' => $session->js_enabled,
            'is_bot' => $session->is_bot,
            'is_proxy' => $session->is_proxy,
            'is_hosting' => $session->is_hosting,
            'same_ip_recent_visits' => $session->same_ip_recent_visits,
            'risk_score' => $session->risk_score,
            'risk_reasons' => $session->risk_reasons ?? [],
        ];
    }

    /**
     * Merge page views, journey/engagement events, and leads into one
     * chronologically ordered list for the timeline UI.
     *
     * @return list<array{type: string, at: ?CarbonInterface, data: array<string, mixed>}>
     */
    private function buildTimeline(VisitorSession $session): array
    {
        $entries = [];

        foreach ($session->pageViews as $pageView) {
            $entries[] = [
                'type' => 'page_view',
                'at' => $pageView->entered_at ?? $pageView->created_at,
                'data' => [
                    'key' => $pageView->key,
                    'page_path' => $pageView->page_path,
                    'sequence_number' => $pageView->sequence_number,
                    'is_entry' => $pageView->is_entry,
                    'is_exit' => $pageView->is_exit,
                    'time_spent_seconds' => $pageView->time_spent_seconds,
                    'scroll_depth_max' => $pageView->scroll_depth_max,
                    'converted_at' => $pageView->converted_at,
                ],
            ];
        }

        foreach ($session->events as $event) {
            $entries[] = [
                'type' => 'event',
                'at' => $event->occurred_at,
                'data' => [
                    'event_type' => $event->event_type,
                    'event_data' => $event->event_data,
                ],
            ];
        }

        foreach ($session->leads as $lead) {
            $entries[] = [
                'type' => 'lead',
                'at' => $lead->created_at,
                'data' => [
                    'status' => $lead->status,
                    'email' => $lead->email,
                ],
            ];
        }

        usort($entries, fn (array $a, array $b) => ($a['at']?->getTimestamp() ?? 0) <=> ($b['at']?->getTimestamp() ?? 0));

        return $entries;
    }
}
