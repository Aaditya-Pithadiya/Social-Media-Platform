import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);

    return (
        <div className="my-1 bg-purple-50 rounded-lg p-2 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-6">
            </div>

            {suggestedUsers.map((user) => (
                <div 
                    key={user._id} 
                    className="flex items-center justify-between my-5 hover:bg-purple-100 p-2 rounded-md transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${user?._id}`}>
                            <Avatar className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
                                <AvatarImage 
                                    src={user?.profilePicture} 
                                    alt={`${user?.username}'s profile picture`} 
                                />
                                <AvatarFallback className="bg-purple-200 text-purple-700">
                                    {user?.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex flex-col">
                            <Link 
                                to={`/profile/${user?._id}`}
                                className="font-semibold text-sm text-purple-900 hover:text-purple-700 transition-colors"
                            >
                                {user?.username}
                            </Link>
                            <span className="text-purple-600 text-xs">
                                {user?.bio || 'Bio here...'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SuggestedUsers;
