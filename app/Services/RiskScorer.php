<?php

namespace App\Services;

use App\Models\VisitorSession;

class RiskScorer
{
    /**
     * Points added per contributing signal. Free/no-paid-provider signals
     * only — see the traffic-quality section of the visitor-tracking plan
     * for what's explicitly out of scope without a paid IP-intelligence
     * API (reliable VPN detection, device fingerprinting, Tor exit lists
     * beyond Cloudflare's own CF-IPCountry: T1).
     *
     * @var array<string, int>
     */
    private const WEIGHTS = [
        'bot_user_agent' => 50,
        'proxy_or_vpn' => 20,
        'hosting_provider' => 20,
        'repeated_ip' => 15,
        'fast_form_submission' => 25,
    ];

    /**
     * How many sessions from the same IP within the lookback window (see
     * VisitorIdentityService::createSession()) count as "repeated".
     */
    private const REPEATED_IP_THRESHOLD = 5;

    /**
     * Recompute and persist a session's risk_score/risk_reasons from its
     * currently-stored signals (is_bot, is_proxy, is_hosting,
     * same_ip_recent_visits), plus any additional reason the caller knows
     * about right now but that isn't itself a persisted column (e.g.
     * "fast_form_submission", only knowable at the moment a lead is
     * submitted). Reasons like that are preserved on future recomputes —
     * e.g. when a later page view flips is_bot — since they can't be
     * re-derived from the session's current state.
     *
     * @param  list<string>  $additionalReasons
     */
    public function recompute(VisitorSession $session, array $additionalReasons = []): void
    {
        $reasons = [];

        if ($session->is_bot) {
            $reasons[] = 'bot_user_agent';
        }

        if ($session->is_proxy) {
            $reasons[] = 'proxy_or_vpn';
        }

        if ($session->is_hosting) {
            $reasons[] = 'hosting_provider';
        }

        if (($session->same_ip_recent_visits ?? 0) >= self::REPEATED_IP_THRESHOLD) {
            $reasons[] = 'repeated_ip';
        }

        $existingReasons = is_array($session->risk_reasons) ? $session->risk_reasons : [];
        $preserved = array_values(array_intersect($existingReasons, ['fast_form_submission']));

        $reasons = array_values(array_unique([...$reasons, ...$preserved, ...$additionalReasons]));

        $score = array_sum(array_map(fn (string $reason) => self::WEIGHTS[$reason] ?? 0, $reasons));

        $session->forceFill([
            'risk_reasons' => $reasons,
            'risk_score' => min(100, $score),
        ])->save();
    }
}
