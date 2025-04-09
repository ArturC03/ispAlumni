<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id1')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id2')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pendente', 'aceito', 'rejeitado'])->default('pendente');
            $table->timestamps();

            // Garantir que não existam entradas duplicadas para o mesmo par de usuários
            $table->unique(['user_id1', 'user_id2']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('friendships');
    }
};
