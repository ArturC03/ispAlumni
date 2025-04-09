<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('image_url')->nullable();
            $table->string('organizer_name');
            $table->string('contact_info')->nullable();
            $table->string('external_link')->nullable();
            $table->string('event_type');
            $table->enum('status', ['agendado', 'em_andamento', 'concluido'])->default('agendado');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
};
