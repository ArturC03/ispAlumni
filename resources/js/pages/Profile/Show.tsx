import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Users, Image as ImageIcon, Edit3, MapPin, Mail, Link, X, Ghost } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    avatar_url: string;
    profile_image?: string;
    email?: string;
    created_at: string;
    bio?: string;
    location?: string;
    website?: string;
    cover_image?: string;
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
    views: View[] | number;
    media: PostMedia[];
}

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    user: User;
    posts: PaginatedPosts;
    friendshipStatus: 'pending' | 'accepted' | 'rejected' | null;
}

interface SharedData {
    auth: {
        user: User;
    };
}

export default function ProfileShow({ user, posts, friendshipStatus }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isOwnProfile = auth.user.id === user.id;
    const [activeTab, setActiveTab] = useState('posts');
    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<PostMedia | null>(null);
    const [mediaIndex, setMediaIndex] = useState(0);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const handleMediaClick = (post: Post, media: PostMedia, index: number) => {
        setSelectedPost(post);
        setSelectedMedia(media);
        setMediaIndex(index);
        setMediaPreviewOpen(true);
    };

    const handleFriendshipAction = (action: 'send' | 'accept' | 'reject' | 'unfriend') => {
        router.post(route('friendship.action', { action, user: user.id }), {}, {
            preserveScroll: true,
        });
    };

    const handleLike = (postId: number) => {
        router.post(
            route('likes.toggle', postId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleShare = (postId: number) => {
        console.log('Share post:', postId);
    };

    const getFriendshipButton = () => {
        if (isOwnProfile) return null;

        switch (friendshipStatus) {
            case 'pending':
                return (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleFriendshipAction('accept')}>
                            Aceitar Pedido
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleFriendshipAction('reject')}>
                            Recusar
                        </Button>
                    </div>
                );
            case 'accepted':
                return (
                    <Button variant="outline" size="sm" onClick={() => handleFriendshipAction('unfriend')}>
                        Desfazer Amizade
                    </Button>
                );
            default:
                return (
                    <Button size="sm" onClick={() => handleFriendshipAction('send')}>
                        Adicionar Amigo
                    </Button>
                );
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Início',
            href: '/',
        },
        {
            title: user.name,
            href: route('profile.show', user.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Perfil de ${user.name}`} />

            <div className="flex h-full flex-col">
                {/* Cover image */}
                <div className="relative h-64 w-full bg-gradient-to-r from-primary to-secondary">
                    {user.cover_image && (
                        <img
                            src={`/storage/${user.cover_image}`}
                            alt="Capa"
                            className="h-full w-full object-cover"
                        />
                    )}

                    {isOwnProfile && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="absolute right-4 top-4 bg-white/80"
                            onClick={() => router.get(route('profile.edit'))}
                        >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar Perfil
                        </Button>
                    )}
                </div>

                {/* Profile header */}
                <div className="mx-auto w-full max-w-5xl px-4">
                    <div className="relative flex flex-col sm:flex-row sm:items-end">
                        {/* Profile avatar */}
                        <div className="absolute -top-20 left-4 h-36 w-36 sm:static sm:-mt-16">
                            <Avatar className="h-36 w-36 border-4 border-white shadow-md">
                                <AvatarImage src={user.avatar_url} alt={user.name} />
                                <AvatarFallback className="text-3xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Profile info and actions */}
                        <div className="mt-16 flex flex-1 flex-col sm:mt-0 sm:ml-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>42 amigos</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Membro desde {format(new Date(user.created_at), "MMMM 'de' yyyy", { locale: pt })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                {getFriendshipButton()}
                            </div>
                        </div>
                    </div>

                    {/* Profile bio and details */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Left column - Bio and info */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-xl font-semibold">Sobre</h2>

                                    {user.bio ? (
                                        <p className="mb-4 text-sm">{user.bio}</p>
                                    ) : (
                                        <p className="mb-4 text-sm text-muted-foreground">{isOwnProfile ? 'Adicione uma biografia ao seu perfil' : 'Sem biografia'}</p>
                                    )}

                                    <div className="space-y-3">
                                        {user.email && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span>{user.email}</span>
                                            </div>
                                        )}

                                        {user.location && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{user.location}</span>
                                            </div>
                                        )}

                                        {user.website && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Link className="h-4 w-4 text-muted-foreground" />
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {user.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="mb-4 text-xl font-semibold">Amigos</h2>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* This would come from your API, using placeholders for now */}
                                        {Array(6).fill(0).map((_, i) => (
                                            <div key={i} className="text-center">
                                                <Avatar className="mx-auto h-16 w-16">
                                                    <AvatarFallback>U{i + 1}</AvatarFallback>
                                                </Avatar>
                                                <p className="mt-1 truncate text-xs">Usuário {i + 1}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-center">
                                        <Button variant="link" size="sm">Ver Todos</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right column - Posts */}
                        <div className="md:col-span-2">
                            {/* Tabs */}
                            <Card className="mb-6">
                                <div className="flex border-b">
                                    <Button
                                        variant="ghost"
                                        className={`flex-1 rounded-none ${activeTab === 'posts' ? 'border-b-2 border-primary font-medium' : ''}`}
                                        onClick={() => setActiveTab('posts')}
                                    >
                                        Publicações
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className={`flex-1 rounded-none ${activeTab === 'photos' ? 'border-b-2 border-primary font-medium' : ''}`}
                                        onClick={() => setActiveTab('photos')}
                                    >
                                        Fotos
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className={`flex-1 rounded-none ${activeTab === 'videos' ? 'border-b-2 border-primary font-medium' : ''}`}
                                        onClick={() => setActiveTab('videos')}
                                    >
                                        Vídeos
                                    </Button>
                                </div>
                            </Card>

                            {/* Post creation button for own profile */}
                            {isOwnProfile && (
                                <Card className="mb-6 cursor-pointer shadow-md hover:shadow-lg" onClick={() => router.get(route('posts.create'))}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={auth.user.avatar_url} alt={auth.user.name} />
                                                <AvatarFallback>{auth.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <Button variant='outline' className="flex-1 rounded-full ">
                                                No que estás a pensar, {auth.user.name.split(' ')[0]}?
                                            </Button>
                                        </div>
                                        <div className="mt-4 flex items-center justify-around border-t pt-2">
                                            <Button variant="ghost" className="gap-2">
                                                <ImageIcon className="h-5 w-5 text-green-500" />
                                                <span>Foto</span>
                                            </Button>
                                            <Button variant="ghost" className="gap-2">
                                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                                <span>Texto</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Content based on active tab */}
                            {activeTab === 'posts' && (
                                <div className="space-y-6">
                                    {posts.data.length === 0 ? (
                                        <Card className="shadow-md">
                                            <CardContent className="p-8 text-center">
                                                <p className="text-muted-foreground text-lg">
                                                    {isOwnProfile
                                                        ? 'Você ainda não criou nenhuma publicação.'
                                                        : `${user.name} ainda não criou nenhuma publicação.`}
                                                </p>
                                                {isOwnProfile && (
                                                    <Button className="mt-4" onClick={() => router.get(route('posts.create'))}>
                                                        Criar Publicação
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        posts.data.map((post) => (
                                            <Card key={post.id} className="shadow-md transition-all duration-300 hover:shadow-lg">
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
                                                                            onClick={() => handleMediaClick(post, media, index)}
                                                                        >
                                                                            {media.type === 'image' ? (
                                                                                <img
                                                                                    src={`/storage/${media.url}`}
                                                                                    alt=""
                                                                                    className={`h-full w-full ${post.media.length === 1 ? 'object-contain' : 'object-cover'}`}
                                                                                />
                                                                            ) : (
                                                                                <video
                                                                                    src={`/storage/${media.url}`}
                                                                                    controls
                                                                                    className="h-full w-full rounded-xl object-cover"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="border-t p-4">
                                                    <div className="flex w-full flex-wrap items-center justify-between">
                                                        <div className="text-muted-foreground flex gap-4 text-sm">
                                                            <span>{post.likes.length} gostos</span>
                                                            <span>{post.comments.length} comentários</span>
                                                            <span>
                                                                {typeof post.views === 'number'
                                                                    ? post.views
                                                                    : post.views?.length || 0} visualizações
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="group hover:bg-transparent hover:text-red-500"
                                                                onClick={() => handleLike(post.id)}
                                                            >
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
                                                                onClick={() => router.get(route('posts.show', post.id))}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className="group-hover:bg-primary/10 rounded-full p-2 transition-colors">
                                                                        <MessageCircle className="h-5 w-5" />
                                                                    </div>
                                                                    <span>Comentar</span>
                                                                </div>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="group hover:bg-transparent hover:text-green-500"
                                                                onClick={() => handleShare(post.id)}
                                                            >
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
                                        ))
                                    )}

                                    {/* Pagination */}
                                    {posts.data.length > 0 && posts.last_page > 1 && (
                                        <div className="mt-8 flex justify-center">
                                            <div className="flex gap-2">
                                                {posts.current_page > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(route('profile.show', {
                                                            user: user.id,
                                                            page: posts.current_page - 1
                                                        }))}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Anterior
                                                    </Button>
                                                )}

                                                {posts.current_page < posts.last_page && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.get(route('profile.show', {
                                                            user: user.id,
                                                            page: posts.current_page + 1
                                                        }))}
                                                    >
                                                        Próximo
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'photos' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h2 className="mb-4 text-xl font-semibold">Fotos</h2>

                                        {posts.data.some(post => post.media.some(media => media.type === 'image')) ? (
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                                {posts.data.flatMap(post =>
                                                    post.media
                                                        .filter(media => media.type === 'image')
                                                        .map(media => (
                                                            <div
                                                                key={media.id}
                                                                className="aspect-square cursor-pointer overflow-hidden rounded-lg"
                                                                onClick={() => handleMediaClick(post, media, 0)}
                                                            >
                                                                <img
                                                                    src={`/storage/${media.url}`}
                                                                    alt=""
                                                                    className="h-full w-full object-cover transition-transform hover:scale-105"
                                                                />
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        ) : (
                                            <p className="py-6 text-center text-muted-foreground">
                                                {isOwnProfile
                                                    ? 'Você ainda não publicou nenhuma foto.'
                                                    : `${user.name} ainda não publicou nenhuma foto.`}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === 'videos' && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h2 className="mb-4 text-xl font-semibold">Vídeos</h2>

                                        {posts.data.some(post => post.media.some(media => media.type === 'video')) ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {posts.data.flatMap(post =>
                                                    post.media
                                                        .filter(media => media.type === 'video')
                                                        .map(media => (
                                                            <div
                                                                key={media.id}
                                                                className="cursor-pointer overflow-hidden rounded-lg"
                                                                onClick={() => handleMediaClick(post, media, 0)}
                                                            >
                                                                <video
                                                                    src={`/storage/${media.url}`}
                                                                    className="h-full w-full object-cover"
                                                                    poster={`/storage/${media.url.replace(/\.[^/.]+$/, "")}_thumbnail.jpg`}
                                                                />
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        ) : (
                                            <p className="py-6 text-center text-muted-foreground">
                                                {isOwnProfile
                                                    ? 'Você ainda não publicou nenhum vídeo.'
                                                    : `${user.name} ainda não publicou nenhum vídeo.`}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                                <div className="relative cursor-pointer overflow-hidden border">
                                    {selectedMedia?.type === 'image' ? (
                                        <img src={`/storage/${selectedMedia.url}`} alt="" className="max-w-content object-cover" />
                                    ) : selectedMedia?.type === 'video' ? (
                                        <video
                                            src={`/storage/${selectedMedia.url}`}
                                            controls
                                            className="h-full w-full rounded-xl object-cover"
                                            autoPlay
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Navigation buttons (only if the post has multiple media) */}
                        {selectedPost && selectedPost.media.length > 1 && (
                            <>
                                <Button
                                    onClick={() => {
                                        const newIndex = (mediaIndex - 1 + selectedPost.media.length) % selectedPost.media.length;
                                        setMediaIndex(newIndex);
                                        setSelectedMedia(selectedPost.media[newIndex]);
                                    }}
                                    className="absolute left-4 h-8 w-8 rounded-full bg-black/50 p-2 text-white"
                                >
                                    <ChevronLeft size={24} />
                                </Button>
                                <Button
                                    onClick={() => {
                                        const newIndex = (mediaIndex + 1) % selectedPost.media.length;
                                        setMediaIndex(newIndex);
                                        setSelectedMedia(selectedPost.media[newIndex]);
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
        </AppLayout >
    );
}
