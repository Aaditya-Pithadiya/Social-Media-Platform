import React, { useState } from 'react';
import { 
  AiOutlineHome, 
  AiOutlineSearch, 
  AiOutlineCompass, 
  AiOutlineMessage, 
  AiOutlineHeart, 
  AiOutlinePlusSquare, 
  AiOutlineLogout, 
  AiOutlineCloseCircle, 
  AiOutlineMenu, 
  AiOutlineStar 
} from 'react-icons/ai';
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  
import { useDispatch, useSelector } from 'react-redux'
import { someAction } from '../redux/authSlice';  // Go up one directory to src/redux/authSlice.js





const LeftSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuButtonVisible, setMenuButtonVisible] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
      setTimeout(() => {
        setMenuButtonVisible(true);
      }, 500);
    } else {
      setMenuButtonVisible(false);
      setSidebarOpen(true);
    }
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
      if (res.data.success) {
         // dispatch(setAuthUser(null));
          // dispatch(setSelectedPost(null));
          // dispatch(setPosts([]));
          navigate("/login");
          toast.success(res.data.message);
      }
  } catch (error) {
      toast.error(error.response.data.message);
  }
  };
  const sidebarItems = [
    { icon: <AiOutlineHome className="w-6 h-6" />, text: "Home" },
    { icon: <AiOutlineSearch className="w-6 h-6" />, text: "Search" },
    { icon: <AiOutlineCompass className="w-6 h-6" />, text: "Explore" },
    { icon: <AiOutlineMessage className="w-6 h-6" />, text: "Messages" },
    { icon: <AiOutlineHeart className="w-6 h-6" />, text: "Notifications" },
    { icon: <AiOutlinePlusSquare className="w-6 h-6" />, text: "Create" },
    {
      icon: (
        <Avatar className="w-8 h-8 flex items-center justify-center">
          <AvatarImage
            src={user?.profilePicture}
            className="rounded-full object-cover"
            alt="@shadcn"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <AiOutlineLogout className="w-6 h-6" />, text: "Logout" },
  ];

  return (
    <div>
      {/* Menu Button */}
      <div className="fixed top-4 left-4 z-20">
        {menuButtonVisible && (
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-purple-100 transition-colors duration-300"
          >
            <AiOutlineMenu className="w-8 h-8 text-purple-600" />
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 w-72 h-screen transition-all duration-500 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          bg-gradient-to-b from-white via-purple-50 to-white
          border-r border-purple-100 backdrop-blur-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <AiOutlineStar className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Vibehub
              </h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="hover:bg-purple-100 transition-colors duration-300 p-2"
            >
              <AiOutlineCloseCircle className="w-5 h-5 text-purple-600" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => item.text === "Logout" ? logoutHandler() : setActiveItem(item.text)}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300
                  ${activeItem === item.text 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'hover:bg-purple-100 text-gray-700 hover:text-purple-700'
                  }
                  group relative overflow-hidden`}
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className={`flex items-center justify-center transition-transform duration-300 group-hover:scale-110
                  ${activeItem === item.text ? 'text-white' : 'text-purple-600'}`}>
                  {item.icon}
                </div>

                {/* Text */}
                <span className="font-medium">{item.text}</span>
              </button>
            ))}
          </div>

          {/* Bottom Section
          <div className="p-4 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors duration-300 cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">User Name</span>
                <span className="text-sm text-gray-500">@username</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
