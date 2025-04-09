<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FriendshipController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $user = Auth::user();

        $friends = $user->friends()->get();
        $pendingRequests = $user->pendingFriendRequests()->with('requester')->get();

        // Usando Inertia para renderizar a página de amigos
        return Inertia::render('Friendships/Index', [
            'friends' => $friends,
            'pendingRequests' => $pendingRequests,
        ]);
    }

    public function store(User $user)
    {
        $currentUser = Auth::user();

        // Verificar se já existe uma amizade
        $existingFriendship = Friendship::where(function ($query) use ($currentUser, $user) {
            $query->where('user_id1', $currentUser->id)
                ->where('user_id2', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('user_id1', $user->id)
                ->where('user_id2', $currentUser->id);
        })->first();

        if ($existingFriendship) {
            // Envia uma mensagem de info via Inertia
            return redirect()->back()->with('info', 'Já existe uma solicitação de amizade.');
        }

        // Criar novo pedido de amizade
        $friendship = new Friendship;
        $friendship->user_id1 = $currentUser->id; // solicitante
        $friendship->user_id2 = $user->id; // destinatário
        $friendship->status = 'pendente';
        $friendship->save();

        // Retornar uma resposta de sucesso
        return redirect()->back()->with('success', 'Solicitação de amizade enviada!');
    }

    public function accept(Friendship $friendship)
    {
        // Verificar se o usuário atual é o destinatário
        if (Auth::id() !== $friendship->user_id2) {
            return redirect()->back()
                ->with('error', 'Você não tem permissão para aceitar esta solicitação.');
        }

        $friendship->status = 'aceito';
        $friendship->save();

        return redirect()->back()
            ->with('success', 'Solicitação de amizade aceita!');
    }

    public function reject(Friendship $friendship)
    {
        // Verificar se o usuário atual é o destinatário
        if (Auth::id() !== $friendship->user_id2) {
            return redirect()->back()
                ->with('error', 'Você não tem permissão para rejeitar esta solicitação.');
        }

        $friendship->status = 'rejeitado';
        $friendship->save();

        return redirect()->back()
            ->with('success', 'Solicitação de amizade rejeitada!');
    }

    public function destroy(Friendship $friendship)
    {
        // Verificar se o usuário atual é parte da amizade
        if (Auth::id() !== $friendship->user_id1 && Auth::id() !== $friendship->user_id2) {
            return redirect()->back()
                ->with('error', 'Você não tem permissão para remover esta amizade.');
        }

        $friendship->delete();

        return redirect()->back()
            ->with('success', 'Amizade removida com sucesso!');
    }
}
