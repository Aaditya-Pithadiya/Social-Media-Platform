import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import axios from 'axios';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import user_photo from "../assets/user photo.jpg";

const Profile = () => {
  const { id: userId } = useParams(); 
  useGetUserProfile(userId);

  const { userProfile: globalUserProfile, user } = useSelector(store => store.auth); 
  const [userProfile, setUserProfile] = useState(globalUserProfile); 
  const isLoggedInUserProfile = user?._id === globalUserProfile?._id; 
  const [activeTab, setActiveTab] = useState('posts'); 
  const [isFollowing, setIsFollowing] = useState(globalUserProfile?.followers.includes(user?._id)); 

  useEffect(() => {
    setUserProfile(globalUserProfile);
    setIsFollowing(globalUserProfile?.followers.includes(user?._id));
  }, [globalUserProfile, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${userId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        setUserProfile(prevProfile => ({
          ...prevProfile,
          followers: isFollowing
            ? prevProfile.followers.filter(followerId => followerId !== user?._id)
            : [...prevProfile.followers, user?._id]
        }));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  // Filter posts to show only if the logged-in user is following this profile
  const displayedPosts = activeTab === 'posts' && (isFollowing || isLoggedInUserProfile)
    ? userProfile?.posts
    : activeTab === 'saved' && isLoggedInUserProfile
    ? globalUserProfile?.bookmarks // Show logged-in user's bookmarks
    : []; // No bookmarks for other users or if not following

  return (
    <div className="flex max-w-5xl justify-center mx-auto">
      <div className="flex flex-col gap-20 p-8 w-full">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32 ring-2 ring-purple-700">
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback className="bg-gray-100"><img src={user_photo} alt="CN" className="h-20 w-20 object-cover" /></AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-bold text-2xl">
                  {userProfile?.username}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <p><span className="font-semibold text-gray-800">{userProfile?.posts.length} </span>posts</p>
                <p><span className="font-semibold text-gray-800">{userProfile?.followers.length} </span>followers</p>
                <p><span className="font-semibold text-gray-800">{userProfile?.following.length} </span>following</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-800">{userProfile?.bio || 'bio here...'}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-5">
              {isLoggedInUserProfile ? (
                <>
                  <Link to="/account/edit">
                    <Button className="bg-purple-700 text-white hover:bg-purple-600 w-full md:w-auto h-8">Edit profile</Button>
                  </Link>
                  <Button className="bg-purple-700 text-white hover:bg-purple-600 w-full md:w-auto h-8">View archive</Button>
                  <Button className="bg-purple-700 text-white hover:bg-purple-600 w-full md:w-auto h-8">Ad tools</Button>
                </>
              ) : (
                <Button 
                  onClick={handleFollowToggle} 
                  className="bg-purple-700 text-white hover:bg-purple-600 w-full md:w-auto h-8"
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-sm">
            <span 
              className={`py-3 cursor-pointer transition-colors ${
                activeTab === 'posts' 
                  ? 'text-purple-700 font-bold' 
                  : 'text-gray-600 hover:text-purple-700'
              }`} 
              onClick={() => handleTabChange('posts')}
            >
              POSTS
            </span>
            {isLoggedInUserProfile && (
              <span 
                className={`py-3 cursor-pointer transition-colors ${
                  activeTab === 'saved' 
                    ? 'text-purple-700 font-bold' 
                    : 'text-gray-600 hover:text-purple-700'
                }`} 
                onClick={() => handleTabChange('saved')}
              >
                SAVED
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1">
            {displayedPosts?.map((post) => (
              <div key={post?._id} className="relative group cursor-pointer">
                <img 
                  src={post.image} 
                  alt="postimage" 
                  className="rounded-xl my-2 w-full aspect-square object-cover" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <div className="flex items-center text-white space-x-4">
                    <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                      <Heart className="text-white" />
                      <span>{post?.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
                      <MessageCircle className="text-white" />
                      <span>{post?.comments.length}</span>
                    </button>  
                  </div> 
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
