import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, X } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    avatar_url: string;
}

interface Like {
    id: number;
    user_id: number;
}

interface Comment {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

interface PostMedia {
    id: number;
    url: string;
    type: 'image' | 'video';
}

interface View {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

interface Post {
    id: number;
    content: string;
    created_at: string;
    user: User;
    likes: Like[];
    comments: Comment[];
    shares: number;
    views: View[];
    media: PostMedia[];
}

interface Props {
    post: Post;
}

interface SharedData {
    auth: {
        user: User;
    };
}

export default function PostShow({ post }: Props) {
    console.log(post);
    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<PostMedia | null>(null);
    const [mediaIndex, setMediaIndex] = useState(0);

    const { auth } = usePage<SharedData>().props;

    const {
        data,
        setData,
        post: postComment,
        processing,
        reset,
    } = useForm({
        content: '',
        post_id: post.id,
    });

    const handleMediaClick = (media: PostMedia, index: number) => {
        setSelectedMedia(media);
        setMediaIndex(index);
        setMediaPreviewOpen(true);
    };

    const handleLike = () => {
        router.post(
            route('likes.toggle', post.id),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleShare = () => {
        // Share functionality can be implemented here
        // For now, log the action
        console.log('Share post:', post.id);
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();

        postComment(route('comments.store', post.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('content');
                router.reload({ only: ['post'] });
            },
        });
    };

    const handleMediaLoad = (postId: number) => {
        // Placeholder function for handling media load events
        console.log(`Media loaded for post ${postId}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Publicações',
            href: '/',
        },
        {
            title: 'Detalhes da Publicação',
            href: route('posts.show', post.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalhes da Publicação" />

            <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
                {/* Main post card */}
                <Card className="rounded-xl border shadow-sm">
                    <CardContent className="p-6">
                        {/* Post header with user info */}
                        <div className="mb-6 flex items-center gap-4">
                            <Avatar className="h-12 w-12 ring-2 ring-offset-2">
                                <AvatarImage src={post.user.avatar_url} alt={post.user.name} />
                                <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">{post.user.name}</h3>
                                <p className="text-muted-foreground text-sm font-medium">
                                    {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
                                </p>
                            </div>
                        </div>

                        {/* Post content */}
                        <div className="space-y-4">
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>

                            {/* Post media */}
                            {post.media && post.media.length > 0 && (
                                <div className="mt-6">
                                    <div className={`grid gap-4 ${post.media.length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                                        {post.media.map((media, index) => (
                                            <div
                                                key={media.id}
                                                className={`relative cursor-pointer overflow-hidden rounded-xl border ${post.media.length === 1 ? 'col-span-full max-h-[500px]' : 'aspect-square'
                                                    }`}
                                                onClick={() => handleMediaClick(media, index)}
                                            >
                                                {media.type === 'image' ? (
                                                    <img
                                                        src={`/storage/${media.url}`}
                                                        alt=""
                                                        className={`max-w-content rounded-xl ${post.media.length === 1 ? 'object-contain' : 'object-cover'}`}
                                                    />
                                                ) : (
                                                    <video src={`/storage/${media.url}`} controls className="h-full w-full rounded-xl object-cover" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="border-t p-6">
                        <div className="flex w-full flex-wrap items-center justify-between">
                            <div className="text-muted-foreground flex gap-4 text-sm">
                                <span>{post.likes.length} gostos</span>
                                <span>{post.comments.length} comentários</span>
                                <span>{post.views.length} visualizações</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button variant="ghost" size="sm" className="group hover:bg-transparent hover:text-red-500" onClick={handleLike}>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full p-2 transition-colors group-hover:bg-red-500/10">
                                            <Heart
                                                className={`h-5 w-5 ${post.likes.some((like) => like.user_id === auth.user.id) ? 'fill-current text-red-500' : ''}`}
                                            />
                                        </div>
                                        <span>Gostar</span>
                                    </div>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="group hover:text-primary hover:bg-transparent"
                                    onClick={() => document.getElementById('comment-input')?.focus()}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="group-hover:bg-primary/10 rounded-full p-2 transition-colors">
                                            <MessageCircle className="h-5 w-5" />
                                        </div>
                                        <span>Comentar</span>
                                    </div>
                                </Button>

                                <Button variant="ghost" size="sm" className="group hover:bg-transparent hover:text-green-500" onClick={handleShare}>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full p-2 transition-colors group-hover:bg-green-500/10">
                                            <Share2 className="h-5 w-5" />
                                        </div>
                                        <span>Compartilhar</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Comments section */}
                <Card className="rounded-xl border shadow-sm">
                    <CardContent className="p-6">
                        <h3 className="mb-6 text-xl font-semibold">Comentários ({post.comments.length})</h3>

                        {/* Comment form */}
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={auth.user.avatar_url} alt={auth.user.name} />
                                    <AvatarFallback>{auth.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Textarea
                                        id="comment-input"
                                        placeholder="Escreva um comentário..."
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="mb-2 min-h-[100px] w-full resize-y rounded-lg"
                                    />
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={!data.content.trim() || processing} size="sm">
                                            Comentar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Comments list */}
                        <div className="space-y-6">
                            {post.comments.length === 0 ? (
                                <p className="text-muted-foreground py-6 text-center">Seja o primeiro a comentar nesta publicação.</p>
                            ) : (
                                post.comments
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Ordenar os comentários pela data
                                    .map((comment) => (
                                        <div key={comment.id} className="group">
                                            <div className="flex gap-4">
                                                <Avatar className="h-10 w-10 flex-shrink-0">
                                                    <AvatarImage src={comment.user.avatar_url} alt={comment.user.name} />
                                                    <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="rounded-md border bg-muted/5 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{comment.user.name}</h4>
                                                            <span className="text-muted-foreground text-xs">
                                                                {format(new Date(comment.created_at), "d MMM 'às' HH:mm", { locale: pt })}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <Separator className="mt-6" /> */}
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Media preview dialog */}
                <Dialog open={mediaPreviewOpen} onOpenChange={setMediaPreviewOpen}>
                    <DialogContent className="max-w-4xl p-0">
                        <div className="h-content w-content relative flex max-h-[90vh] min-h-36 items-center justify-center">
                            {/* Close button */}
                            <Button onClick={() => setMediaPreviewOpen(false)} className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full p-1">
                                <X size={20} />
                            </Button>

                            {/* Media content */}
                            <div className="w-max-content rounded-xl">
                                <div className={`grid ${selectedMedia ? 'grid-cols-1' : ''}`}>
                                    <div
                                        className="relative  cursor-pointer overflow-hidden border"
                                    // onClick={() => handleMediaClick(selectedMedia)} // Pode ser descomentado se necessário
                                    >
                                        {selectedMedia?.type === 'image' ? (
                                            <img src={`/storage/${selectedMedia.url}`} alt="" className="max-w-content object-cover" />
                                        ) : selectedMedia?.type === 'video' ? (
                                            <video
                                                src={`/storage/${selectedMedia.url}`}
                                                controls
                                                className="h-full w-full rounded-xl object-cover"
                                                onLoadedMetadata={() => handleMediaLoad(post.id)}
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation buttons */}
                            {post.media.length > 1 && (
                                <>
                                    <Button
                                        onClick={() => {
                                            const newIndex = (mediaIndex - 1 + post.media.length) % post.media.length;
                                            setMediaIndex(newIndex);
                                            setSelectedMedia(post.media[newIndex]);
                                        }}
                                        className="absolute left-4 h-8 w-8 rounded-full bg-black/50 p-2 text-white"
                                    >
                                        <ChevronLeft size={24} />
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const newIndex = (mediaIndex + 1) % post.media.length;
                                            setMediaIndex(newIndex);
                                            setSelectedMedia(post.media[newIndex]);
                                        }}
                                        className="absolute right-4 h-8 w-8 rounded-full bg-black/50 p-2 text-white"
                                    >
                                        <ChevronRight size={24} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
