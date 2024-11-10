import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);

  return (
    <div className="w-80 my-10 pr-8">
      <div className="bg-purple-50 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${user?._id}`}>
            <Avatar className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <AvatarImage 
                src={user?.profilePicture} 
                alt={`${user?.username}'s profile picture`} 
              />
              <AvatarFallback className="bg-purple-200 text-purple-700">
                {user?.username?.substring(0, 2).toUpperCase() || 'CN'}
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
            <span className="text-purple-600 text-sm">
              {user?.bio || 'Bio here...'}
            </span>
          </div>
        </div>
      </div>

      <SuggestedUsers />
    </div>
  );
};

export default RightSidebar;
