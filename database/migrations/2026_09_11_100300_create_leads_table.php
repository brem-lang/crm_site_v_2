<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Local record of every lead submission, alongside the forward to the
     * external Mercari affiliate API (App\Http\Controllers\SubmitLeadController)
     * — so the funnel can be analyzed here even though the affiliate API is
     * the actual system of record for the lead itself.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_session_id')->nullable()->constrained('visitor_sessions')->nullOnDelete();
            $table->foreignId('visitor_id')->nullable()->constrained('visitors')->nullOnDelete();
            $table->foreignId('page_view_id')->nullable()->constrained('page_views')->nullOnDelete();
            $table->string('click_id')->nullable()->index();

            $table->string('firstname');
            $table->string('lastname');
            $table->string('email');
            $table->string('mobile');
            $table->string('country_code', 2);
            $table->string('ip_address')->nullable();

            $table->string('status'); // success | failed
            $table->json('external_response')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
