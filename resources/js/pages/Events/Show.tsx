
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Tag,
    ChevronLeft,
    Share2,
    ExternalLink,
    Phone,
    Mail
} from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    image_url: string;
    organizer_name: string;
    contact_info: string;
    external_link: string;
    event_type: string;
    status: 'agendado' | 'em_andamento' | 'concluido';
}

interface Props {
    event: Event;
}

export default function EventShow({ event }: Props) {
    const [copied, setCopied] = useState(false);

    // Dynamically generate breadcrumbs based on the current event
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Eventos',
            href: '/events',
        },
        {
            title: event.title,
            href: route('events.show', event.id),
        },
    ];

    function createMarkup(content: string) {
        return { __html: content };
    }

    function handleShare() {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    function handleBackToEvents() {
        router.visit(route('events.index'));
    }

    function getEventStatusBadge() {
        const now = new Date();
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        if (isBefore(now, startDate)) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Agendado</Badge>;
        } else if (isWithinInterval(now, { start: startDate, end: endDate })) {
            return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Em andamento</Badge>;
        } else {
            return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Concluído</Badge>;
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title} />

            <div className="flex h-full flex-1 flex-col items-center gap-6 p-4 sm:p-6">
                <div className="w-full max-w-4xl">
                    <Button
                        variant="outline"
                        className="mb-6 flex items-center gap-2"
                        onClick={handleBackToEvents}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Todos os eventos</span>
                    </Button>

                    <Card className={`overflow-hidden shadow-sm ${event.image_url ? 'py-0 pb-6' : ''}`}>
                        {event.image_url && (
                            <div className="relative h-72 w-full overflow-hidden sm:h-96">
                                <img
                                    src={`/storage/${event.image_url}`}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>
                                {getEventStatusBadge()}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <div className="flex items-center text-muted-foreground">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        <span className="font-medium">
                                            {format(new Date(event.start_date), "d 'de' MMMM, yyyy", { locale: pt })}
                                            {format(new Date(event.start_date), "d MMM yyyy", { locale: pt }) !==
                                                format(new Date(event.end_date), "d MMM yyyy", { locale: pt }) &&
                                                ` - ${format(new Date(event.end_date), "d 'de' MMMM, yyyy", { locale: pt })}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-muted-foreground">
                                        <Clock className="mr-2 h-5 w-5" />
                                        <span>
                                            {format(new Date(event.start_date), "HH:mm", { locale: pt })} -
                                            {format(new Date(event.end_date), "HH:mm", { locale: pt })}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-muted-foreground">
                                        <MapPin className="mr-2 h-5 w-5" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-muted-foreground">
                                        <Users className="mr-2 h-5 w-5" />
                                        <span>Organizado por: {event.organizer_name}</span>
                                    </div>

                                    {event.contact_info && (
                                        <div className="flex items-center text-muted-foreground">
                                            <Mail className="mr-2 h-5 w-5" />
                                            <span>{event.contact_info}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-muted-foreground">
                                        <Tag className="mr-2 h-5 w-5" />
                                        <span>Tipo: {event.event_type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h2 className="mb-4 text-xl font-semibold">Sobre o evento</h2>
                                <div className="prose prose-lg max-w-none">
                                    <div dangerouslySetInnerHTML={createMarkup(event.description)} />
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-between gap-4 border-t pt-6">
                                {event.external_link && (
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                        onClick={() => window.open(event.external_link, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Site oficial</span>
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 ml-auto"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>{copied ? 'Link copiado!' : 'Compartilhar'}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
