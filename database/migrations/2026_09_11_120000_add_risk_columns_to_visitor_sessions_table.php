<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Two more inputs to the traffic-quality scoring in App\Services\RiskScorer,
     * alongside the is_bot/is_proxy/is_hosting/risk_score columns already
     * added in the create_visitor_sessions_table migration:
     *
     *  - same_ip_recent_visits: how many sessions from this IP started in
     *    the preceding 24h (computed once, at session creation).
     *  - risk_reasons: which signals contributed to the current
     *    risk_score, so the dashboard can explain a flag rather than just
     *    showing a number.
     */
    public function up(): void
    {
        Schema::table('visitor_sessions', function (Blueprint $table) {
            $table->unsignedInteger('same_ip_recent_visits')->nullable()->after('risk_score');
            $table->json('risk_reasons')->nullable()->after('same_ip_recent_visits');
        });
    }

    public function down(): void
    {
        Schema::table('visitor_sessions', function (Blueprint $table) {
            $table->dropColumn(['same_ip_recent_visits', 'risk_reasons']);
        });
    }
};
