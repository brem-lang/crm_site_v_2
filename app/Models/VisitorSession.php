<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisitorSession extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'visitor_id',
        'click_id',

        'referrer_url',
        'referrer_domain',
        'traffic_source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'campaign_id',
        'affiliate_id',
        'external_click_id',
        'search_keyword',

        'ip_address',
        'country',
        'region',
        'city',
        'timezone',
        'isp',
        'asn',
        'is_mobile_carrier',

        'device_type',
        'device_brand',
        'device_model',
        'os',
        'os_version',
        'browser',
        'browser_version',
        'user_agent',
        'screen_resolution',
        'viewport_size',
        'browser_language',
        'site_language',

        'landing_url',
        'url_params',
        'hostname',
        'page_load_ms',
        'js_enabled',
        'consent_status',

        'is_bot',
        'is_proxy',
        'is_hosting',
        'risk_score',
        'same_ip_recent_visits',
        'risk_reasons',

        'started_at',
        'last_activity_at',
        'ended_at',
        'duration_seconds',
        'pages_viewed',
        'is_first_time_visitor',
        'previous_visits_count',
        'entry_page_view_id',
        'exit_page_view_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * A plain $casts property rather than the casts() method Laravel also
     * supports — Larastan's static analysis reads this reliably, whereas
     * it doesn't always pick up a method-based cast map (seen causing
     * false-positive type errors on last_activity_at/risk_reasons
     * elsewhere in this codebase).
     *
     * @var array<string, string>
     */
    protected $casts = [
        'url_params' => 'array',
        'is_mobile_carrier' => 'boolean',
        'js_enabled' => 'boolean',
        'is_bot' => 'boolean',
        'is_proxy' => 'boolean',
        'is_hosting' => 'boolean',
        'risk_reasons' => 'array',
        'is_first_time_visitor' => 'boolean',
        'started_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Visitor, $this>
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * @return HasMany<PageView, $this>
     */
    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    /**
     * @return HasMany<Lead, $this>
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * @return HasMany<VisitorEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(VisitorEvent::class);
    }
}
