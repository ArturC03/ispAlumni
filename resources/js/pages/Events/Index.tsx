
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Tag, Users, Link as LinkIcon, ExternalLink } from 'lucide-react';
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

interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props {
    events: PaginatedData<Event>;
    filter: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Eventos',
        href: '/events',
    },
];

const DESCRIPTION_PREVIEW_LENGTH = 150;

export default function EventsIndex({ events, filter }: Props) {
    const [activeTab, setActiveTab] = useState(filter || 'all');

    function handleTabChange(value: string) {
        setActiveTab(value);
        router.get(route('events.index', { filter: value }));
    }

    function handleEventClick(eventId: number) {
        router.visit(route('events.show', eventId));
    }

    function truncateDescription(description: string): string {
        if (description.length <= DESCRIPTION_PREVIEW_LENGTH) return description;
        return description.substring(0, DESCRIPTION_PREVIEW_LENGTH) + '...';
    }

    function getEventStatusBadge(event: Event) {
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

    function createMarkup(content: string) {
        return { __html: content };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Eventos" />

            <div className="flex h-full flex-1 flex-col items-center gap-6 p-4 sm:p-6">
                <div className="w-full max-w-4xl">
                    <h1 className="text-3xl font-bold mb-6">Eventos</h1>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                            <TabsTrigger value="ongoing">Em andamento</TabsTrigger>
                            <TabsTrigger value="past">Passados</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {!events.data || events.data.length === 0 ? (
                        <Card className="border shadow-sm rounded-xl">
                            <CardContent className="py-12">
                                <p className="text-center font-medium text-muted-foreground">Não existem eventos para mostrar.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {events.data.map((event) => (
                                <Card
                                    key={event.id}
                                    className={`cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-md ${event.image_url ? 'py-0' : ''}`}
                                    onClick={() => handleEventClick(event.id)}
                                >
                                    <div className="md:flex">
                                        {event.image_url && (
                                            <div className="relative h-48 md:h-auto md:w-1/3 overflow-hidden">
                                                <img
                                                    src={`/storage/${event.image_url}`}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className={`flex-1 ${event.image_url ? 'md:w-2/3 py-6' : 'w-full'}`}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-xl mb-2"><h3>{event.title}</h3></CardTitle>
                                                    {getEventStatusBadge(event)}
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-1 h-4 w-4" />
                                                        <span>
                                                            {format(new Date(event.start_date), "d 'de' MMM", { locale: pt })}
                                                            {format(new Date(event.start_date), "d MMM yyyy", { locale: pt }) !==
                                                                format(new Date(event.end_date), "d MMM yyyy", { locale: pt }) &&
                                                                ` - ${format(new Date(event.end_date), "d 'de' MMM", { locale: pt })}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="mr-1 h-4 w-4" />
                                                        <span>
                                                            {format(new Date(event.start_date), "HH:mm", { locale: pt })} -
                                                            {format(new Date(event.end_date), "HH:mm", { locale: pt })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MapPin className="mr-1 h-4 w-4" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-4">
                                                <div className="space-y-4">
                                                    <div className="prose prose-sm max-w-none">
                                                        <div dangerouslySetInnerHTML={createMarkup(truncateDescription(event.description))} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between border-t pt-4">
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Users className="mr-1 h-4 w-4" />
                                                    <span>{event.organizer_name}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Badge variant="secondary">{event.event_type}</Badge>
                                                </div>
                                            </CardFooter>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {events.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!events.prev_page_url}
                                    onClick={() => router.visit(`${events.prev_page_url}&filter=${activeTab}`)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="text-sm text-muted-foreground">
                                    Página {events.current_page} de {events.last_page}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!events.next_page_url}
                                    onClick={() => router.visit(`${events.next_page_url}&filter=${activeTab}`)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
