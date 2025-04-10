import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Clock, Eye, Share2, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    avatar_url: string;
}

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image_url: string;
    author: User;
    published_at: string;
    view_count: number;
}

interface Props {
    news: NewsItem;
}

export default function NewsShow({ news }: Props) {
    const [copied, setCopied] = useState(false);

    // Dynamically generate breadcrumbs based on the current news item
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Notícias',
            href: '/news',
        },
        {
            title: news.title,
            href: route('news.show', news.id),
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

    function handleBackToNews() {
        router.visit(route('news.index'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={news.title} />

            <div className="flex h-full flex-1 flex-col items-center gap-6 p-4 sm:p-6">
                <div className="w-full max-w-4xl">
                    <Button
                        variant="outline"
                        className="mb-6 flex items-center gap-2"
                        onClick={handleBackToNews}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Todas as notícias</span>
                    </Button>

                    <Card className={`overflow-hidden shadow-sm ${news.image_url ? 'py-0 pb-6' : ''}`}>
                        {news.image_url && (
                            <div className="relative h-72 w-full overflow-hidden sm:h-96">
                                <img
                                    src={`/storage/${news.image_url}`}
                                    alt={news.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <h1 className="text-2xl font-bold sm:text-3xl">{news.title}</h1>

                            <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={news.author.avatar_url} alt={news.author.name} />
                                        <AvatarFallback>{news.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{news.author.name}</span>
                                </div>

                                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        <span>{format(new Date(news.published_at), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>{format(new Date(news.published_at), 'HH:mm', { locale: pt })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Eye className="mr-1 h-4 w-4" />
                                        <span>{news.view_count} {news.view_count === 1 ? 'visualização' : 'visualizações'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <div dangerouslySetInnerHTML={createMarkup(news.content)} />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
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
