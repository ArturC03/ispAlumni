<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EventController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
        $this->middleware('admin')->except(['index', 'show']);
    }

    public function index(Request $request)
    {
        $filter = $request->input('filter', 'all');

        switch ($filter) {
            case 'upcoming':
                $events = Event::upcoming();
                break;
            case 'ongoing':
                $events = Event::ongoing();
                break;
            case 'past':
                $events = Event::past();
                break;
            default:
                $events = Event::query()->orderBy('start_date');
        }

        $events = $events->paginate(10);

        return Inertia::render('Events/Index', [
            'events' => $events,
            'filter' => $filter,
        ]);
    }

    public function show(Event $event)
    {
        return Inertia::render('Events/Show', [
            'event' => $event,
        ]);
    }

    public function create()
    {
        return Inertia::render('Events/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'organizer_name' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'external_link' => 'nullable|url|max:255',
            'event_type' => 'required|string|max:255',
        ]);

        $event = new Event;
        $event->fill($validated);

        // Processar o status do evento
        if (now() < $validated['start_date']) {
            $event->status = 'agendado';
        } elseif (now() >= $validated['start_date'] && now() <= $validated['end_date']) {
            $event->status = 'em_andamento';
        } else {
            $event->status = 'concluido';
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $event->image_url = $path;
        }

        $event->save();

        return Inertia::render('Events/Index', [
            'events' => Event::paginate(10),
            'flash' => [
                'success' => 'Evento criado com sucesso!',
            ],
        ]);
    }

    public function edit(Event $event)
    {
        return Inertia::render('Events/Edit', [
            'event' => $event,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'organizer_name' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:255',
            'external_link' => 'nullable|url|max:255',
            'event_type' => 'required|string|max:255',
        ]);

        $event->fill($validated);

        // Processar o status do evento
        if (now() < $validated['start_date']) {
            $event->status = 'agendado';
        } elseif (now() >= $validated['start_date'] && now() <= $validated['end_date']) {
            $event->status = 'em_andamento';
        } else {
            $event->status = 'concluido';
        }

        if ($request->hasFile('image')) {
            // Excluir imagem anterior se existir
            if ($event->image_url) {
                Storage::disk('public')->delete($event->image_url);
            }

            $path = $request->file('image')->store('events', 'public');
            $event->image_url = $path;
        }

        $event->save();

        return Inertia::render('Events/Index', [
            'events' => Event::paginate(10),
            'flash' => [
                'success' => 'Evento atualizado com sucesso!',
            ],
        ]);
    }

    public function destroy(Event $event)
    {
        // Remover a imagem se existir
        if ($event->image_url) {
            Storage::disk('public')->delete($event->image_url);
        }

        $event->delete();

        return Inertia::render('Events/Index', [
            'events' => Event::paginate(10),
            'flash' => [
                'success' => 'Evento excluído com sucesso!',
            ],
        ]);
    }
}
