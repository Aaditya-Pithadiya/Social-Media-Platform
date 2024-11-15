import { 
  AiOutlineHome, 
  AiOutlineSearch, 
  AiOutlineMessage, 
  AiOutlineHeart, 
  AiOutlinePlusSquare, 
  AiOutlineLogout, 
  AiOutlineCloseCircle, 
  AiOutlineMenu, 
  AiOutlineStar 
} from 'react-icons/ai';

import 'react-toastify/dist/ReactToastify.css';  
import user_photo from "../assets/user photo.jpg";
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '../redux/postSlice';
import * as Popover from '@radix-ui/react-popover'; // Importing Popover components from Radix UI

const LeftSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuButtonVisible, setMenuButtonVisible] = useState(true);
  const [activeItem, setActiveItem] = useState('Home');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const { likeNotification } = useSelector(store => store.realTimeNotification);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const sidebarItems = [
    { icon: <AiOutlineHome className="w-6 h-6" />, text: "Home" },
    { icon: <AiOutlineSearch className="w-6 h-6" />, text: "Search" },
    { icon: <AiOutlineMessage className="w-6 h-6" />, text: "Messages" },
    { icon: <AiOutlinePlusSquare className="w-6 h-6" />, text: "Notifications" },
    { icon: <AiOutlinePlusSquare className="w-6 h-6" />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6.5 h-6.5 flex items-center justify-center">
          <AvatarImage
            src={user?.profilePicture}
            className="rounded-full object-cover"
            alt="@shadcn"
          />
          <AvatarFallback><img src={user_photo} alt="CN" className="h-20 w-20 object-cover" /></AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <AiOutlineLogout className="w-6 h-6" />, text: "Logout" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === 'Logout') {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === 'Messages') {
      navigate("/chat");
    } else if (textType === 'Search') {
      setSearchOpen(!searchOpen); 
    }
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/api/v1/user/search', {
          params: { query: searchQuery },
          withCredentials: true
        });
        if (response.data.success) {
          setSearchResults(response.data.users);
        }
      } catch (error) {
        toast.error("Search failed. Please try again.");
      }
    };

    const debounceSearch = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceSearch);

  }, [searchQuery]);

  return (
    <div>
      {/* Menu Button */}
      <div className="fixed top-4 left-4 z-20 bg-gray">
        {menuButtonVisible && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-purple-100 transition-colors duration-300"
          >
            {/* <AiOutlineMenu className="w-8 h-8 text-purple-600" /> */}
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`fixed top-0 left-0 z-10 h-screen transition-all duration-500 ease-in-out
          ${sidebarOpen ? "w-72" : "w-18"}
          bg-gradient-to-b from-white via-purple-50 to-white
          border-r border-purple-100 backdrop-blur-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-purple-100">
            <div className="flex items-center gap-2">
              {/* <AiOutlineStar className="w-6 h-6 text-purple-600" /> */}
              {sidebarOpen && (
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  Vibehub
                </h1>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="hover:bg-purple-100 transition-colors duration-300 p-2"
              >
                <AiOutlineCloseCircle className="w-5 h-5 text-purple-600" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => { 
                  sidebarHandler(item.text);
                  setActiveItem(item.text);   
                }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300
                  ${activeItem === item.text 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                  }
                  group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                <div className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                  ${activeItem === item.text ? 'text-white' : 'text-purple-600'}`}>
                  {item.icon}
                </div>

<<<<<<< Updated upstream
                {/* Text */}
                <span className={`font-semibold transition-all duration-300 ${activeItem === item.text ? 'text-white' : ''}`}>
                  {item.text}
                </span>

                {/* Notifications Popover */}
                {item.text === "Notifications"  && (
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">
                        {likeNotification.length}
                      </button>
                    </Popover.Trigger>
                    <Popover.Content>
                      <div>
                        {likeNotification.length === 0 ? (
                          <p>No new notification</p>
                        ) : (
                          likeNotification.map((notification) => (
                            <div key={notification.userId} className='flex items-center gap-2 my-2'>
                              <Avatar>
                                <AvatarImage src={notification.userDetails?.profilePicture} />
                                <AvatarFallback><img src={user_photo} alt="CN" className="h-20 w-20 object-cover" /></AvatarFallback>
                              </Avatar>
                              <p className='text-sm'>
                                <span className='font-bold'>{notification.userDetails?.username}</span> liked your post
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </Popover.Content>
                  </Popover.Root>
=======
                {sidebarOpen && (
                  <span className={`font-semibold transition-all duration-300 ${activeItem === item.text ? 'text-white' : ''}`}>
                    {item.text}
                  </span>
>>>>>>> Stashed changes
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white w-96 rounded-lg p-4 shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Search..."
            />
            <div className="mt-4">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center py-2 border-b">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={result.profilePicture} />
                    <AvatarFallback>{result.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{result.username}</span>
                </div>
              ))}
<<<<<<< Updated upstream
            </div>
=======
              {searchResults.length === 0 && searchQuery && (
                <li className="text-gray-500 text-sm mt-2">No users found</li>
              )}
            </ul>
            <button onClick={() => setSearchOpen(false)} className="mt-4 w-full text-center p-2 text-sm text-white bg-purple-600 rounded">
              Close
            </button>
>>>>>>> Stashed changes
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {open && (
        <CreatePost open={open} setOpen={setOpen} />
      )}
    </div>
  );
};

export default LeftSidebar;
