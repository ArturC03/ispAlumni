import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
    news: PaginatedData<NewsItem>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notícias',
        href: '/news',
    },
];

const CONTENT_PREVIEW_LENGTH = 200;
const CARD_GAP = 24; // Gap between cards in pixels

export default function NewsIndex({ news }: Props) {
    const [previewNews, setPreviewNews] = useState<NewsItem | null>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const masonryRef = useRef<HTMLDivElement>(null);

    // Function to apply masonry layout
    useEffect(() => {
        if (!masonryRef.current || news.data.length === 0) return;

        const resizeObserver = new ResizeObserver(() => {
            applyMasonryLayout();
        });

        resizeObserver.observe(masonryRef.current);

        // Initial layout
        applyMasonryLayout();

        return () => {
            if (masonryRef.current) {
                resizeObserver.unobserve(masonryRef.current);
            }
        };
    }, [news.data]);

    function applyMasonryLayout() {
        if (!masonryRef.current) return;

        const container = masonryRef.current;
        const items = Array.from(container.children) as HTMLElement[];
        const columnCount = window.innerWidth >= 768 ? 2 : 1;

        if (columnCount === 1) {
            items.forEach((item, index) => {
                item.style.removeProperty('position');
                item.style.removeProperty('top');
                item.style.removeProperty('left');
                item.style.removeProperty('width');
                item.style.marginBottom = `${CARD_GAP}px`;
                // Remove margin from the last item
                if (index === items.length - 1) {
                    item.style.marginBottom = '0';
                }
            });
            container.style.height = 'auto';
            return;
        }

        // Account for gap in column width calculation
        const availableWidth = container.clientWidth - (CARD_GAP * (columnCount - 1));
        const columnWidth = availableWidth / columnCount;
        const columnHeights = Array(columnCount).fill(0);

        items.forEach((item) => {
            // Find the shortest column
            const column = columnHeights.indexOf(Math.min(...columnHeights));

            // Calculate position with gaps
            const x = column * (columnWidth + CARD_GAP);
            const y = columnHeights[column];

            // Set position and width
            item.style.position = 'absolute';
            item.style.width = `${columnWidth}px`;
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;

            // Update column height (include gap for next item)
            columnHeights[column] += item.offsetHeight + CARD_GAP;
        });

        // Set container height to tallest column, but subtract the final gap
        const maxHeight = Math.max(...columnHeights);
        container.style.height = `${maxHeight > 0 ? maxHeight - CARD_GAP : 0}px`;
    }

    function handlePreview(e: React.MouseEvent, newsItem: NewsItem) {
        e.preventDefault();
        setPreviewNews(newsItem);
        setPreviewModalOpen(true);
    }

    function handleNewsClick(newsId: number) {
        router.visit(route('news.show', newsId));
    }

    function truncateContent(content: string): string {
        if (content.length <= CONTENT_PREVIEW_LENGTH) return content;
        return content.substring(0, CONTENT_PREVIEW_LENGTH) + '...';
    }

    function createMarkup(content: string) {
        return { __html: content };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notícias" />

            <div className="flex h-full flex-1 flex-col items-center gap-6 p-4 sm:p-6">
                <div className="w-full max-w-4xl">
                    <h1 className="mb-6 text-3xl font-bold">Notícias</h1>

                    {!news.data || news.data.length === 0 ? (
                        <Card className="rounded-xl border shadow-sm">
                            <CardContent className="py-12">
                                <p className="text-muted-foreground text-center font-medium">Não existem notícias para mostrar.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div
                            ref={masonryRef}
                            className="relative"
                            style={{ minHeight: '400px', marginBottom: `${CARD_GAP}px` }}
                        >
                            {news.data.map((newsItem) => (
                                <Card
                                    key={newsItem.id}
                                    className={`cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-md ${newsItem.image_url ? 'py-0 pb-6' : ''}`}
                                    onClick={() => handleNewsClick(newsItem.id)}
                                >
                                    {newsItem.image_url && (
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <img src={`/storage/${newsItem.image_url}`} alt={newsItem.title} className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle className="text-xl"><h3>{newsItem.title}</h3></CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="prose prose-sm max-w-none">
                                                <div dangerouslySetInnerHTML={createMarkup(truncateContent(newsItem.content))} />
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="text-muted-foreground flex items-center text-sm">
                                                    <Calendar className="mr-1 h-4 w-4" />
                                                    <span>{format(new Date(newsItem.published_at), "d 'de' MMM, yyyy", { locale: pt })}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button variant="link" onClick={(e) => handlePreview(e, newsItem)} className="text-primary">
                                                    Ler mais
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {news.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!news.prev_page_url}
                                    onClick={() => router.visit(news.prev_page_url || '')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="text-muted-foreground text-sm">
                                    Página {news.current_page} de {news.last_page}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={!news.next_page_url}
                                    onClick={() => router.visit(news.next_page_url || '')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* News Preview Modal */}
                <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
                    <DialogTrigger asChild>
                        <span></span>
                    </DialogTrigger>

                    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                        {previewNews && (
                            <div className="space-y-6">
                                {previewNews.image_url && (
                                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                                        <img
                                            src={`/storage/${previewNews.image_url}`}
                                            alt={previewNews.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}

                                <h2 className="text-2xl font-bold">{previewNews.title}</h2>

                                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        <span>{format(new Date(previewNews.published_at), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        <span>{format(new Date(previewNews.published_at), 'HH:mm', { locale: pt })}</span>
                                    </div>
                                </div>

                                <div className="prose prose-lg max-w-none">
                                    <div dangerouslySetInnerHTML={createMarkup(previewNews.content)} />
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button onClick={() => router.visit(route('news.show', previewNews.id))}>Ver notícia completa</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
