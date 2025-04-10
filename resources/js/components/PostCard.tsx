
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/inertia-react';
import { Inertia } from '@inertiajs/inertia';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/Components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';

export default function PostCard({ post }) {
    const { auth } = usePage().props;
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const formatDate = (dateString) => {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    };

    const handleLike = () => {
        Inertia.post(route('posts.like', post.id));
    };

    const handleComment = (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        Inertia.post(route('comments.store', post.id), {
            content: commentText,
            post_id: post.id,
        }, {
            onSuccess: () => {
                setCommentText('');
            },
        });
    };

    const isLiked = post.likes.some(like => like.user_id === auth.user.id);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center">
                    <Link href={route('profile.show', post.user.id)}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={post.user.avatar_url ? `/storage/${post.user.avatar_url}` : null}
                                alt={post.user.name}
                            />
                            <AvatarFallback>{getInitials(post.user.name)}</AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className="ml-3">
                        <Link
                            href={route('profile.show', post.user.id)}
                            className="font-medium text-gray-900 hover:underline"
                        >
                            {post.user.name}
                        </Link>
                        <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                    </div>

                    {(auth.user.id === post.user.id || auth.user.is_admin) && (
                        <div className="ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this post?')) {
                                        Inertia.delete(route('posts.destroy', post.id));
                                    }
                                }}
                                className="text-gray-500 hover:text-red-500"
                            >
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="py-3">
                <p className="whitespace-pre-wrap">{post.content}</p>

                {post.media && post.media.length > 0 && (
                    <div className={`mt-3 grid ${post.media.length > 1 ? 'grid-cols-2 gap-2' : ''}`}>
                        {post.media.map(media => (
                            <div key={media.id} className="overflow-hidden rounded-md">
                                {media.type === 'image' ? (
                                    <img
                                        src={`/storage/${media.url}`}
                                        alt="Post media"
                                        className="w-full h-auto object-cover"
                                    />
                                ) : (
                                    <video
                                        src={`/storage/${media.url}`}
                                        controls
                                        className="w-full h-auto"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="border-t pt-3 flex flex-col">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <div className="flex items-center mr-4">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{post.likes.length}</span>
                    </div>

                    <div className="flex items-center mr-4">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{post.comments.length}</span>
                    </div>

                    <div className="flex items-center mr-4">
                        <Share2 className="h-4 w-4 mr-1" />
                        <span>{post.shares}</span>
                    </div>

                    <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{post.views}</span>
                    </div>
                </div>

                <div className="flex w-full border-t pt-3">
                    <Button
                        variant={isLiked ? "default" : "ghost"}
                        size="sm"
                        className="flex-1 flex items-center justify-center"
                        onClick={handleLike}
                    >
                        <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        Like
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 flex items-center justify-center"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comment
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 flex items-center justify-center"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>

                {showComments && (
                    <div className="mt-4 w-full">
                        <form onSubmit={handleComment} className="mb-4">
                            <Textarea
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="mb-2"
                            />
                            <Button type="submit" size="sm">Post Comment</Button>
                        </form>

                        <div className="space-y-4">
                            {post.comments.map(comment => (
                                <div key={comment.id} className="flex">
                                    <Link href={route('profile.show', comment.user.id)}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={comment.user.avatar_url ? `/storage/${comment.user.avatar_url}` : null}
                                                alt={comment.user.name}
                                            />
                                            <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                                        </Avatar>
                                    </Link>

                                    <div className="ml-3 flex-1">
                                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                                            <Link
                                                href={route('profile.show', comment.user.id)}
                                                className="font-medium text-gray-900 hover:underline"
                                            >
                                                {comment.user.name}
                                            </Link>
                                            <p className="text-sm">{comment.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
