<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link each page view to the session/visitor that produced it, and
     * capture its position and timing within that session. Existing rows
     * (predating this migration) simply keep these columns null.
     */
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->foreignId('visitor_session_id')->nullable()->after('id')
                ->constrained('visitor_sessions')->nullOnDelete();
            $table->foreignId('visitor_id')->nullable()->after('visitor_session_id')
                ->constrained('visitors')->nullOnDelete();
            $table->unsignedInteger('sequence_number')->nullable()->after('visitor_id');

            $table->string('page_path')->nullable();
            $table->text('full_url')->nullable();
            $table->timestamp('entered_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->unsignedInteger('time_spent_seconds')->nullable();
            $table->unsignedTinyInteger('scroll_depth_max')->nullable();
            $table->unsignedInteger('load_time_ms')->nullable();
            $table->boolean('is_entry')->nullable();
            $table->boolean('is_exit')->nullable();

            // Persisted at write time so read-time UA re-parsing (and the
            // in-memory device filter it required) can go away.
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropForeign(['visitor_session_id']);
            $table->dropForeign(['visitor_id']);
            $table->dropColumn([
                'visitor_session_id', 'visitor_id', 'sequence_number',
                'page_path', 'full_url', 'entered_at', 'left_at',
                'time_spent_seconds', 'scroll_depth_max', 'load_time_ms',
                'is_entry', 'is_exit', 'device_type', 'browser', 'os',
            ]);
        });
    }
};
