<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('category');
            $table->string('target_scope')->nullable();
            $table->string('target_phase')->nullable();
            $table->string('target_block')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->string('status');
            $table->timestamps();

            $table->index(['status', 'start_at', 'end_at']);
            $table->index(['target_scope', 'target_phase', 'target_block']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
