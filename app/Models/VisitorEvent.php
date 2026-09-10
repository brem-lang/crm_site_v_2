<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitorEvent extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'visitor_session_id',
        'page_view_id',
        'event_type',
        'event_data',
        'occurred_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'event_data' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<VisitorSession, $this>
     */
    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    /**
     * @return BelongsTo<PageView, $this>
     */
    public function pageView(): BelongsTo
    {
        return $this->belongsTo(PageView::class);
    }
}
