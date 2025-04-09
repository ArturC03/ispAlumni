<?php

// app/Http/Middleware/AdminMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::check() || ! Auth::user()->is_admin) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Acesso não autorizado'], 403);
            }

            return redirect()->route('home')->with('error', 'Você não tem permissão para acessar esta área.');
        }

        return $next($request);
    }
}
