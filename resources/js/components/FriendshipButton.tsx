import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from '@/Components/ui/button';
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';

export default function FriendshipButton({ userId, status }) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleFriendshipAction = (action) => {
        setIsLoading(true);

        if (action === 'add') {
            Inertia.post(route('friendships.store', userId), {}, {
                onFinish: () => setIsLoading(false),
            });
        } else if (action === 'accept') {
            // Find the friendship record ID first - in a real app, you'd pass this as a prop
            Inertia.post(route('friendships.accept', userId), {}, {
                onFinish: () => setIsLoading(false),
            });
        } else if (action === 'reject') {
            Inertia.post(route('friendships.reject', userId), {}, {
                onFinish: () => setIsLoading(false),
            });
        } else if (action === 'remove') {
            if (confirm('Are you sure you want to remove this friend?')) {
                Inertia.delete(route('friendships.destroy', userId), {
                    onFinish: () => setIsLoading(false),
                });
            } else {
                setIsLoading(false);
            }
        }
    };

    if (isLoading) {
        return (
            <Button disabled className="w-full md:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
            </Button>
        );
    }

    if (!status) {
        return (
            <Button onClick={() => handleFriendshipAction('add')} className="w-full md:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Friend
            </Button>
        );
    }

    if (status === 'pendente') {
        return (
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <Button onClick={() => handleFriendshipAction('accept')} className="w-full md:w-auto">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Accept
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleFriendshipAction('reject')}
                    className="w-full md:w-auto"
                >
                    <UserX className="mr-2 h-4 w-4" />
                    Reject
                </Button>
            </div>
        );
    }

    if (status === 'aceito') {
        return (
            <Button
                variant="outline"
                onClick={() => handleFriendshipAction('remove')}
                className="w-full md:w-auto"
            >
                <UserCheck className="mr-2 h-4 w-4" />
                Friends
            </Button>
        );
    }

    if (status === 'rejeitado') {
        return (
            <Button
                variant="outline"
                onClick={() => handleFriendshipAction('add')}
                className="w-full md:w-auto"
            >
                <UserPlus className="mr-2 h-4 w-4" />
                Request Again
            </Button>
        );
    }

    return null;
}
