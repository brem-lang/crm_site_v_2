<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Journey/engagement events within a session: CTA/link clicks, form
     * lifecycle, phone/WhatsApp/Telegram clicks, scroll-depth checkpoints,
     * tab visibility, video progress, etc. — reported by the tracker
     * script/hook (public/js/tracker.js) via POST /t/event.
     */
    public function up(): void
    {
        Schema::create('visitor_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_session_id')->constrained('visitor_sessions')->cascadeOnDelete();
            $table->foreignId('page_view_id')->nullable()->constrained('page_views')->nullOnDelete();
            $table->string('event_type');
            $table->json('event_data')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['visitor_session_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_events');
    }
};
