import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';
import user_photo from "../assets/user photo.jpg";
import { Menu, X } from 'lucide-react'; // You can use lucide icons for the menu button

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  const [isOpen, setIsOpen] = useState(false); // State to toggle visibility
  const [showSuggestedUsers, setShowSuggestedUsers] = useState(false); // State to show full suggested users

  const toggleSidebar = () => {
    setIsOpen(!isOpen); // Toggle the sidebar visibility
  };

  const toggleSuggestedUsers = () => {
    setShowSuggestedUsers(!showSuggestedUsers); // Toggle suggested users visibility
  };

  return (
    <div className="relative">
      {/* Menu Button for small screens */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />} {/* Toggle between menu and close icons */}
      </button>

      {/* Sidebar content */}
      <div 
        className={`w-96 my-12 pr-12 lg:w-96 ${isOpen ? 'block' : 'hidden'} lg:block`} 
        // If isOpen is true, show sidebar content on small screens, otherwise hide
      >
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${user?._id}`}>
              <Avatar className="border-2 border-red-200 hover:border-red-300 transition-colors">
                <AvatarImage 
                  src={user?.profilePicture} 
                  alt={`${user?.username}'s profile picture`} 
                />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {user?.username?.substring(0, 2).toUpperCase() || 
                    <img src={user_photo} alt="CN" className="h-20 w-20 object-cover" />}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <Link 
                to={`/profile/${user?._id}`}
                className="font-semibold text-sm text-gray-900 hover:text-gray-700 transition-colors"
              >
                {user?.username}
              </Link>
              <span className="text-gray-600 text-sm">
                {user?.bio || 'Bio here...'}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Users Toggle */}
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm mb-6">
          <button 
            onClick={toggleSuggestedUsers}
            className="w-full text-left text-red-700 font-semibold hover:text-red-600"
          >
            Suggested Users
          </button>
          {/* Only show Suggested Users when toggled */}
          {showSuggestedUsers && <SuggestedUsers />}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
