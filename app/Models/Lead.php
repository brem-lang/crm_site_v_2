<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'visitor_session_id',
        'visitor_id',
        'page_view_id',
        'click_id',
        'firstname',
        'lastname',
        'email',
        'mobile',
        'country_code',
        'ip_address',
        'status',
        'external_response',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'external_response' => 'array',
    ];

    /**
     * @return BelongsTo<VisitorSession, $this>
     */
    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    /**
     * @return BelongsTo<Visitor, $this>
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * @return BelongsTo<PageView, $this>
     */
    public function pageView(): BelongsTo
    {
        return $this->belongsTo(PageView::class);
    }
}
