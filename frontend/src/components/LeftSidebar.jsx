import user_photo from "../assets/user photo.jpg";
import CreatePost from "./CreatePost";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import * as Popover from "@radix-ui/react-popover";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlinePlusSquare,
  AiOutlineBell,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TopNavbar = () => {
  // const [activeItem, setActiveItem] = useState("Home");
  const [open, setOpen] = useState(false); // State for CreatePost Dialog
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for Profile Dropdown
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false); // State for Logout Confirmation
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  // Placeholder for notifications (replace with actual notification data)
  const likeNotification = []; // Replace with actual notification state or data

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/user/search`,
          {
            params: { query: searchQuery },
            withCredentials: true,
          }
        );
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

  const handleLogOut = () => {
    // Perform logout action here
    toast.success("Logged out successfully");
    navigate("/login");
    setLogoutConfirmOpen(false); // Close the confirmation dialog
  };

  return (
    <div className="w-full fixed top-0 z-10 bg-gradient-to-r from-purple-500 to-pink-500 border-b border-purple-100">
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-6">
          {/* Left Section - Home, CreatePost, and Messages */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center p-2 rounded-lg hover:bg-purple-600 text-white"
          >
            <AiOutlineHome className="w-6 h-6" />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center p-2 rounded-lg hover:bg-purple-600 text-white"
          >
            <AiOutlinePlusSquare className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center p-2 rounded-lg hover:bg-purple-600 text-white"
          >
            <AiOutlineMessage className="w-6 h-6" />
          </button>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search users..."
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white shadow-lg max-h-60 overflow-y-auto rounded-lg z-10">
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.profilePicture}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.trim() !== "" && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-lg p-2 z-10">
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-purple-100 text-white">
                <AiOutlineBell className="w-6 h-6" />
                {likeNotification.length >= 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
                    {likeNotification.length}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Content className="w-48 bg-white rounded shadow p-4">
              <div>
                {likeNotification.length === 0 ? (
                  <p>No new notification</p>
                ) : (
                  likeNotification.map((notification) => (
                    <div
                      key={notification.userId}
                      className="flex items-center gap-2 my-2"
                    >
                      <Avatar>
                        <AvatarImage
                          src={notification.userDetails?.profilePicture}
                        />
                        <AvatarFallback>
                          <img
                            src={user_photo}
                            alt="CN"
                            className="h-20 w-20 object-cover"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm">
                        <span className="font-bold">
                          {notification.userDetails?.username}
                        </span>{" "}
                        liked your post
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Root>
          <div className="relative">
            {/* Avatar for Profile */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center rounded-full overflow-hidden w-10 h-10"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                <AvatarFallback>
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg py-2 z-20">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(`/profile/${user?._id}`);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setLogoutConfirmOpen(true); // Open confirmation dialog
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CreatePost Dialog */}
      <CreatePost open={open} setOpen={setOpen} />

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-30">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold text-center mb-4">
              Confirm Logout
            </h3>
            <p className="text-center mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleLogOut}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setLogoutConfirmOpen(false)} // Close the modal
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;
