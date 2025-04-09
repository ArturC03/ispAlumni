import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Film, Heart, Image, MessageCircle, PenSquare, Share2, Smile, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

interface Post {
    id: number;
    content: string;
    created_at: string;
    user: User;
    likes: Like[];
    comments: Comment[];
    shares: number;
    views: number;
    media: PostMedia[];
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
    posts: PaginatedData<Post>;
}

interface SharedData {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Publicações',
        href: '/',
    },
];

// Define um limite máximo de ficheiros
const MAX_FILES = 10;
const CONTENT_PREVIEW_LENGTH = 300;
const MAX_POST_HEIGHT = 800; // Maximum height in pixels before collapsing

export default function Home({ posts }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
    const [collapsedPosts, setCollapsedPosts] = useState<number[]>([]);
    const postRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // State for media preview modal
    const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

    // Guarda todos os ficheiros (imagens e vídeos) selecionados
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [embedURL, setEmbedURL] = useState<string | null>(null);

    // Estados para o modal de preview dos ficheiros
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewGroup, setPreviewGroup] = useState<'image' | 'video' | null>(null);
    const [previewIndex, setPreviewIndex] = useState(0);

    const { data, setData, post, processing } = useForm({
        content: '',
        files: [] as File[],
    });

    const { auth } = usePage<SharedData>().props;
    const MAX_CHARS = 300;

    // Separa os ficheiros por tipo
    const imageFiles = useMemo(() => uploadedFiles.filter((file) => file.type.startsWith('image/')), [uploadedFiles]);
    const videoFiles = useMemo(() => uploadedFiles.filter((file) => file.type.startsWith('video/')), [uploadedFiles]);

    // Handle opening media preview
    const handleMediaClick = (e: React.MouseEvent, media: PostMedia) => {
        e.stopPropagation();
        setSelectedMedia(media);
        setMediaPreviewOpen(true);
    };

    // Função para extrair o primeiro URL do texto
    function extractFirstURL(text: string): string | null {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        return matches ? matches[0] : null;
    }

    useEffect(() => {
        const url = extractFirstURL(data.content);
        setEmbedURL(url);
    }, [data.content]);

    // Check post heights after render and media load
    useEffect(() => {
        posts.data.forEach((post) => {
            const postElement = postRefs.current[post.id];
            if (postElement && postElement.offsetHeight > MAX_POST_HEIGHT && !collapsedPosts.includes(post.id)) {
                setCollapsedPosts((prev) => [...prev, post.id]);
            }
        });
    }, [posts.data, collapsedPosts]);

    // Handle media load to check height
    const handleMediaLoad = (postId: number) => {
        const postElement = postRefs.current[postId];
        if (postElement && postElement.offsetHeight > MAX_POST_HEIGHT && !collapsedPosts.includes(postId)) {
            setCollapsedPosts((prev) => [...prev, postId]);
        }
    };

    // Toggle post collapse state
    const togglePostCollapse = (e: React.MouseEvent, postId: number) => {
        e.stopPropagation();
        if (collapsedPosts.includes(postId)) {
            setCollapsedPosts((prev) => prev.filter((id) => id !== postId));
        } else {
            setCollapsedPosts((prev) => [...prev, postId]);
        }
    };

    // Verifica se o limite foi atingido ou excedido
    function canAddFiles(newFilesCount: number): boolean {
        return uploadedFiles.length + newFilesCount <= MAX_FILES;
    }

    // Handlers para adicionar ficheiros (imagens e vídeos)
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (!canAddFiles(newFiles.length)) {
                alert(`Só podes adicionar até ${MAX_FILES} ficheiros por publicação.`);
                return;
            }
            setUploadedFiles((prev) => [...prev, ...newFiles]);
            setData('files', [...data.files, ...newFiles]);
        }
    }

    function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (!canAddFiles(newFiles.length)) {
                alert(`Só podes adicionar até ${MAX_FILES} ficheiros por publicação.`);
                return;
            }
            setUploadedFiles((prev) => [...prev, ...newFiles]);
            setData('files', [...data.files, ...newFiles]);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', data.content);

        data.files.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        post(route('posts.store'), {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                setData('content', '');
                setData('files', []);
                setUploadedFiles([]);
                setEmbedURL(null);
                setIsOpen(false);
            },
        });
    }

    function handleLike(e: React.MouseEvent, postId: number) {
        e.stopPropagation();
        post(route('likes.toggle', postId), {
            preserveScroll: true,
            preserveState: true,
            only: ['posts'], // ou 'post' se estiveres a passar um único post
        });
    }

    function handlePostClick(postId: number) {
        router.visit(route('posts.show', postId));
    }

    function handleComment(e: React.MouseEvent, postId: number) {
        e.stopPropagation();
        // Implementação do modal/form de comentário
        console.log('Comment:', postId);
    }

    function handleShare(e: React.MouseEvent, postId: number) {
        e.stopPropagation();
        // Implementação da funcionalidade de partilha
        console.log('Share:', postId);
    }

    function togglePostExpansion(e: React.MouseEvent, postId: number) {
        e.stopPropagation();
        setExpandedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]));
    }

    // Revoga URLs de objecto para evitar memory leaks
    useEffect(() => {
        return () => {
            uploadedFiles.forEach((file) => URL.revokeObjectURL(file.name));
        };
    }, [uploadedFiles]);

    // Abre o modal de preview dos ficheiros
    function openPreview(group: 'image' | 'video', index: number) {
        setPreviewGroup(group);
        setPreviewIndex(index);
        setPreviewModalOpen(true);
    }

    // Calcula o total dos ficheiros do grupo em preview
    const totalItems = previewGroup === 'image' ? imageFiles.length : previewGroup === 'video' ? videoFiles.length : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Publicações" />

            <div className="flex h-full flex-1 flex-col items-center gap-6 p-4 sm:p-6">
                {/* Dialog para criar publicação */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        {/* Trigger oculto; utilizamos o botão circular abaixo */}
                        <span></span>
                    </DialogTrigger>

                    <DialogContent className="bg-background text-foreground mx-4 rounded-xl border-none p-0 sm:mx-0 sm:max-w-2xl">
                        <div className="flex h-full flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b p-4">
                                <Button variant="link" className="text-primary hover:bg-transparent" onClick={() => setIsOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    className="rounded-full px-6"
                                    disabled={!data.content.trim() || processing}
                                    onClick={handleSubmit}
                                    type="submit"
                                >
                                    Publicar
                                </Button>
                            </div>

                            {/* Área de Conteúdo */}
                            <form onSubmit={handleSubmit} className="flex-1 p-4">
                                <div className="flex gap-3">
                                    <div className="bg-primary mr-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                        <Avatar className="h-12 w-12 ring-2">
                                            <AvatarImage src={auth.user.avatar_url} alt={auth.user.name} />
                                            <AvatarFallback>{auth.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <textarea
                                        placeholder="No que estás a pensar?"
                                        className="placeholder:text-muted-foreground w-full resize-none bg-transparent text-base outline-none"
                                        rows={8}
                                        value={data.content}
                                        onChange={(e) => {
                                            if (e.target.value.length <= MAX_CHARS) {
                                                setData('content', e.target.value);
                                            }
                                        }}
                                        autoFocus
                                    />
                                </div>
                            </form>

                            {/* Área para embed de links */}
                            {embedURL && (
                                <div className="px-4 pb-2">
                                    <div className="rounded-md border bg-gray-50 p-2">
                                        <p className="text-sm font-medium text-gray-700">Preview do link:</p>
                                        <a href={embedURL} target="_blank" rel="noopener noreferrer" className="break-all text-blue-600 underline">
                                            {embedURL}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Área para pré-visualização dos ficheiros */}
                            <div className="flex flex-wrap gap-4 px-4 pb-2">
                                {imageFiles.length > 0 && (
                                    <div
                                        className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border"
                                        onClick={() => openPreview('image', 0)}
                                    >
                                        <img src={URL.createObjectURL(imageFiles[0])} alt="preview" className="h-full w-full object-cover" />
                                        {imageFiles.length > 1 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <span className="text-lg font-bold text-white">+{imageFiles.length - 1}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {videoFiles.length > 0 && (
                                    <div
                                        className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border"
                                        onClick={() => openPreview('video', 0)}
                                    >
                                        <video
                                            src={URL.createObjectURL(videoFiles[0])}
                                            className="h-full w-full object-cover"
                                            muted
                                            playsInline
                                            loop
                                        />
                                        {videoFiles.length > 1 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <span className="text-lg font-bold text-white">+{videoFiles.length - 1}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="ghost"
                                            className="hover:bg-muted/90 hover:text-muted-foreground relative h-10 w-10 rounded-full p-2 transition-colors duration-200"
                                        >
                                            <Image size={20} />
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                onChange={handleImageChange}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="hover:bg-muted/90 hover:text-muted-foreground relative h-10 w-10 rounded-full p-2 transition-colors duration-200"
                                        >
                                            <Film size={20} />
                                            <input
                                                type="file"
                                                multiple
                                                accept="video/*"
                                                className="absolute inset-0 cursor-pointer opacity-0"
                                                onChange={handleVideoChange}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="hover:bg-muted/90 hover:text-muted-foreground h-10 w-10 rounded-full p-2 transition-colors duration-200"
                                        >
                                            <Smile size={20} />
                                        </Button>
                                    </div>
                                    {/* Indicador de Contagem de Caracteres */}
                                    <div className="relative h-8 w-8">
                                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                                            <circle
                                                className="text-muted stroke-muted-foreground/20 fill-none"
                                                strokeWidth="3"
                                                cx="18"
                                                cy="18"
                                                r="16"
                                            />
                                            <circle
                                                className="text-primary fill-none stroke-current transition-all duration-300"
                                                strokeWidth="3"
                                                strokeDasharray="100"
                                                strokeDashoffset={100 - (data.content.length / MAX_CHARS) * 100}
                                                cx="18"
                                                cy="18"
                                                r="16"
                                            />
                                        </svg>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-muted-foreground absolute inset-0 flex cursor-default items-center justify-center text-[10px] font-bold">
                                                    {MAX_CHARS - data.content.length}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" sideOffset={4}>
                                                Ainda podes usar <b>{MAX_CHARS - data.content.length}</b> caracteres
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Botão circular no canto inferior direito */}
                <Button
                    className="bg-primary hover:bg-primary/80 fixed right-4 bottom-4 h-12 w-12 rounded-full p-4 text-white shadow-lg sm:right-6 sm:bottom-6"
                    onClick={() => setIsOpen(true)}
                >
                    <PenSquare size={20} />
                </Button>

                {/* Modal de preview dos ficheiros */}
                {previewModalOpen && previewGroup && (
                    <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
                        <DialogContent className="mx-4 p-0 sm:mx-0">
                            <div className="h-content w-content max-w-80vh relative flex min-h-36 items-center justify-center">
                                {/* Botão fechar */}
                                <Button onClick={() => setPreviewModalOpen(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full p-1">
                                    <X size={20} />
                                </Button>
                                {/* Conteúdo do preview */}
                                <div className="flex w-full items-center justify-center">
                                    {previewGroup === 'image' && imageFiles[previewIndex] && (
                                        <img
                                            src={URL.createObjectURL(imageFiles[previewIndex])}
                                            alt="preview"
                                            className="max-h-[80vh] max-w-full object-contain"
                                        />
                                    )}
                                    {previewGroup === 'video' && videoFiles[previewIndex] && (
                                        <video
                                            src={URL.createObjectURL(videoFiles[previewIndex])}
                                            className="max-h-[80vh] max-w-full object-contain"
                                            controls
                                            autoPlay
                                            muted
                                        />
                                    )}
                                </div>
                                {/* Botões de navegação */}
                                {totalItems > 1 && (
                                    <>
                                        <Button
                                            onClick={() => setPreviewIndex((prev) => (prev - 1 + totalItems) % totalItems)}
                                            className="absolute left-4 h-8 w-8 rounded-full p-2"
                                        >
                                            <ChevronLeft size={24} />
                                        </Button>
                                        <Button
                                            onClick={() => setPreviewIndex((prev) => (prev + 1) % totalItems)}
                                            className="absolute right-4 h-8 w-8 rounded-full p-2"
                                        >
                                            <ChevronRight size={24} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Modal for media preview */}
                <Dialog open={mediaPreviewOpen} onOpenChange={setMediaPreviewOpen}>
                    <DialogContent className="mx-4 p-0 sm:mx-0">
                        <div className="h-content w-content max-w-80vh relative flex min-h-36 items-center justify-center">
                            <Button onClick={() => setMediaPreviewOpen(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full p-1">
                                <X size={20} />
                            </Button>
                            <div className="flex w-full items-center justify-center">
                                {selectedMedia?.type === 'image' ? (
                                    <img src={`/storage/${selectedMedia.url}`} alt="" className="max-h-[80vh] max-w-full object-contain" />
                                ) : selectedMedia?.type === 'video' ? (
                                    <video
                                        src={`/storage/${selectedMedia.url}`}
                                        className="max-h-[80vh] max-w-full object-contain"
                                        controls
                                        autoPlay
                                    />
                                ) : null}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="w-full max-w-[600px] space-y-4 px-4 sm:px-0">
                    {!posts.data || posts.data.length === 0 ? (
                        <Card className="rounded-xl border shadow-sm">
                            <CardContent className="py-12">
                                <p className="text-muted-foreground text-center font-medium">Não existem publicações para mostrar.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.data.map((post) => (
                            <Card
                                onClick={() => handlePostClick(post.id)}
                                key={post.id}
                                className="hover:bg-primary/5 rounded-xl border shadow-sm transition-all duration-200"
                            >
                                <CardContent
                                    className={`p-2 ${collapsedPosts.includes(post.id) ? 'max-h-[800px] overflow-hidden' : ''} sm:px-6`}
                                    ref={(el) => {
                                        postRefs.current[post.id] = el;
                                    }}
                                >
                                    <div className="flex gap-4 sm:flex-row">
                                        <Avatar className="ring-primary/10 h-10 w-10 rounded-full ring-2" onClick={(e) => e.stopPropagation()}>
                                            <AvatarImage src={post.user.avatar_url} alt={post.user.name} />
                                            <AvatarFallback>{post.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="cursor-pointer font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                                                    {post.user.name}
                                                </h3>
                                                <p className="text-muted-foreground text-sm">·</p>
                                                <p
                                                    className="text-muted-foreground cursor-pointer text-sm hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {format(new Date(post.created_at), "d 'de' MMM", { locale: pt })}
                                                </p>
                                            </div>

                                            <div className="mt-2 mb-4">
                                                <p className={`text-[15px] leading-relaxed ${!expandedPosts.includes(post.id) && 'line-clamp-3'}`}>
                                                    {post.content}
                                                </p>
                                                {post.content.length > CONTENT_PREVIEW_LENGTH && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground mt-2 flex items-center gap-1 hover:bg-transparent"
                                                        onClick={(e) => togglePostExpansion(e, post.id)}
                                                    >
                                                        {expandedPosts.includes(post.id) ? 'Ver menos' : 'Ver mais'}
                                                        <ChevronDown
                                                            className={`h-4 w-4 transition-transform ${expandedPosts.includes(post.id) ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </Button>
                                                )}
                                            </div>

                                            {post.media && post.media.length > 0 && (
                                                <div className="mb-4">
                                                    <div className={`grid ${post.media.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                                                        {post.media.map((media) => (
                                                            <div
                                                                key={media.id}
                                                                className="relative aspect-square cursor-pointer overflow-hidden rounded-xl border"
                                                                onClick={(e) => handleMediaClick(e, media)}
                                                            >
                                                                {media.type === 'image' ? (
                                                                    <img
                                                                        src={`/storage/${media.url}`}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                        onLoad={() => handleMediaLoad(post.id)}
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={`/storage/${media.url}`}
                                                                        controls
                                                                        className="h-full w-full object-cover"
                                                                        onLoadedMetadata={() => handleMediaLoad(post.id)}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {collapsedPosts.includes(post.id) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground mt-2 flex items-center gap-1 hover:bg-transparent"
                                                    onClick={(e) => togglePostCollapse(e, post.id)}
                                                >
                                                    Ver mais
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <div className="text-muted-foreground flex flex-wrap items-center justify-between pt-2 sm:max-w-md">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="hover:text-primary group hover:bg-transparent"
                                                    onClick={(e) => handleComment(e, post.id)}
                                                >
                                                    <div className="flex items-center gap-2 bg-transparent">
                                                        <div className="group-hover:bg-primary/10 rounded-full bg-transparent p-2 transition-colors">
                                                            <MessageCircle className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">{post.comments.length}</span>
                                                    </div>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="group hover:bg-transparent hover:text-green-500"
                                                    onClick={(e) => handleShare(e, post.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded-full p-2 transition-colors group-hover:bg-green-500/10">
                                                            <Share2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">{post.shares}</span>
                                                    </div>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="group hover:bg-transparent hover:text-red-500"
                                                    onClick={(e) => handleLike(e, post.id)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded-full p-2 transition-colors group-hover:bg-red-500/10">
                                                            <Heart
                                                                className={`h-4 w-4 ${post.likes.length > 0 ? 'fill-current text-red-500' : ''}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium">{post.likes.length}</span>
                                                    </div>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="group hidden hover:bg-transparent hover:text-blue-500 md:inline lg:inline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded-full p-2 transition-colors group-hover:bg-blue-500/10">
                                                            <Eye className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-sm font-medium">{post.views.length}</span>
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
