<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One browsing session (a new tab, or a gap of 30+ minutes of
     * inactivity, starts a new one — see VisitorIdentityService).
     *
     * Named `visitor_sessions` rather than `sessions` because that table
     * name is already taken by Laravel's own database session driver
     * (config/session.php).
     */
    public function up(): void
    {
        Schema::create('visitor_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('visitor_id')->nullable()->constrained('visitors')->nullOnDelete();
            $table->string('click_id')->nullable()->index();

            // Referrer / marketing attribution
            $table->text('referrer_url')->nullable();
            $table->string('referrer_domain')->nullable();
            $table->string('traffic_source')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('campaign_id')->nullable();
            $table->string('affiliate_id')->nullable();
            $table->string('external_click_id')->nullable();
            $table->string('search_keyword')->nullable();

            // Location
            $table->string('ip_address')->nullable();
            $table->string('country')->nullable();
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('timezone')->nullable();
            $table->string('isp')->nullable();
            $table->string('asn')->nullable();
            $table->boolean('is_mobile_carrier')->nullable();

            // Device
            $table->string('device_type')->nullable();
            $table->string('device_brand')->nullable();
            $table->string('device_model')->nullable();
            $table->string('os')->nullable();
            $table->string('os_version')->nullable();
            $table->string('browser')->nullable();
            $table->string('browser_version')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('screen_resolution')->nullable();
            $table->string('viewport_size')->nullable();
            $table->string('browser_language')->nullable();
            $table->string('site_language')->nullable();

            // Technical
            $table->text('landing_url')->nullable();
            $table->json('url_params')->nullable();
            $table->string('hostname')->nullable();
            $table->unsignedInteger('page_load_ms')->nullable();
            $table->boolean('js_enabled')->default(false);
            $table->string('consent_status')->default('unknown');

            // Traffic quality — populated in a later phase; columns added
            // now so this table doesn't need another migration for them.
            $table->boolean('is_bot')->nullable();
            $table->boolean('is_proxy')->nullable();
            $table->boolean('is_hosting')->nullable();
            $table->unsignedTinyInteger('risk_score')->nullable();

            // Rollup, maintained as page views come in during the session
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedInteger('pages_viewed')->default(0);
            $table->boolean('is_first_time_visitor')->nullable();
            $table->unsignedInteger('previous_visits_count')->nullable();
            $table->unsignedBigInteger('entry_page_view_id')->nullable();
            $table->unsignedBigInteger('exit_page_view_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_sessions');
    }
};
