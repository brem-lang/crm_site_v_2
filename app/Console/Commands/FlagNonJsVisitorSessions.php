<?php

namespace App\Console\Commands;

use App\Models\VisitorSession;
use App\Services\RiskScorer;
use Illuminate\Console\Command;

class FlagNonJsVisitorSessions extends Command
{
    /**
     * A real browser fires the tracker's client-info ping (POST
     * /t/client-info) within moments of loading the page; a session still
     * showing js_enabled=false this long after it started almost
     * certainly never ran JavaScript at all — i.e. it's a non-JS bot or
     * crawler, not a slow human.
     */
    private const GRACE_PERIOD_SECONDS = 60;

    protected $signature = 'tracking:flag-non-js-sessions';

    protected $description = 'Flag sessions that never confirmed JavaScript as bots, and recompute their risk score';

    public function handle(RiskScorer $riskScorer): int
    {
        $sessions = VisitorSession::query()
            ->where('js_enabled', false)
            ->where('is_bot', false)
            ->where('created_at', '<=', now()->subSeconds(self::GRACE_PERIOD_SECONDS))
            ->get();

        foreach ($sessions as $session) {
            $session->forceFill(['is_bot' => true])->save();
            $riskScorer->recompute($session);
        }

        $this->info("Flagged {$sessions->count()} non-JS session(s) as bots.");

        return self::SUCCESS;
    }
}
