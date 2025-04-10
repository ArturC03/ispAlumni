<?php

namespace Database\Seeders;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::truncate(); // Limpa os dados antigos (opcional em dev)

        $events = [
            [
                'title' => 'Tech Meetup Lisboa',
                'description' => 'Encontro de entusiastas de tecnologia para partilhar ideias e projetos.',
                'location' => 'Lisboa, Portugal',
                'start_date' => Carbon::now()->addDays(3),
                'end_date' => Carbon::now()->addDays(4),
                'image_url' => 'https://example.com/images/tech-meetup.jpg',
                'organizer_name' => 'Comunidade Dev Lisboa',
                'contact_info' => 'devlisboa@email.com',
                'external_link' => 'https://devlisboa.com/eventos/meetup',
                'event_type' => 'Meetup',
                'status' => 'agendado',
            ],
            [
                'title' => 'Workshop Laravel Avançado',
                'description' => 'Aprende a construir aplicações complexas com Laravel.',
                'location' => 'Porto, Portugal',
                'start_date' => Carbon::now()->addDays(10),
                'end_date' => Carbon::now()->addDays(11),
                'image_url' => 'https://example.com/images/workshop-laravel.jpg',
                'organizer_name' => 'Academia PHP',
                'contact_info' => 'contato@academiaphp.pt',
                'external_link' => 'https://academiaphp.pt/workshop-laravel',
                'event_type' => 'Workshop',
                'status' => 'agendado',
            ],
            [
                'title' => 'Feira de Inovação Tecnológica',
                'description' => 'Evento que reúne startups e empresas para demonstração de novas tecnologias.',
                'location' => 'Coimbra, Portugal',
                'start_date' => Carbon::now()->subDays(5),
                'end_date' => Carbon::now()->subDays(3),
                'image_url' => 'https://example.com/images/tech-fair.jpg',
                'organizer_name' => 'Inova Portugal',
                'contact_info' => 'info@inovapt.pt',
                'external_link' => 'https://inovapt.pt/feira2025',
                'event_type' => 'Feira',
                'status' => 'concluido', // sem acento, como na migration
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
