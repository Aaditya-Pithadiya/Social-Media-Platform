import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SuggestedUsers = () => {
  const { userProfile, suggestedUsers } = useSelector(store => store.auth);

  // Filter suggested users to exclude those already followed by the current user (from userProfile.following)
  const filteredSuggestedUsers = suggestedUsers.filter(suggestedUser => {
    // Check if the suggested user is NOT already in the following list of the current userProfile
    return !userProfile?.following?.includes(suggestedUser._id); // Assuming userProfile.following contains an array of user IDs
  });

  return (
    <div className="my-1 bg-gray-50 rounded-lg p-2 shadow-sm">
      

      {/* Conditional rendering for suggested users */}
      {filteredSuggestedUsers.length > 0 ? (
        filteredSuggestedUsers.map((user) => (
          <div 
            key={user._id} 
            className="flex items-center justify-between my-5 hover:bg-gray-100 p-2 rounded-md transition-colors"
          >
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user?._id}`}>
                <Avatar className="border-2 border-red-200 hover:border-red-300 transition-colors">
                  <AvatarImage 
                    src={user?.profilePicture} 
                    alt={`${user?.username}'s profile picture`} 
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {user?.username?.substring(0,1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link 
                  to={`/profile/${user?._id}`}
                  className="font-semibold text-sm text-gray-900 hover:text-gray-800 transition-colors"
                >
                  {user?.username}
                </Link>
                <span className="text-gray-600 text-xs">
                  {user?.bio || 'Bio here...'}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm text-red-500">No more suggested users</p>
      )}
    </div>
  );
};

export default SuggestedUsers;
