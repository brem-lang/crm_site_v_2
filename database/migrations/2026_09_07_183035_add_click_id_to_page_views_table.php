<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->string('click_id')->nullable()->unique()->after('id');
        });

        // Backfill click_id for any rows that predate this column, using
        // each row's own auto-increment id.
        DB::statement("UPDATE page_views SET click_id = CONCAT('click_id_', id) WHERE click_id IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropColumn('click_id');
        });
    }
};
