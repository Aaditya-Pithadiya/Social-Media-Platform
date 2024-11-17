import user_photo from "../assets/user photo.jpg";
import CreatePost from "./CreatePost";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import * as Popover from "@radix-ui/react-popover";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineMessage,
  AiOutlineBell,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "../redux/authSlice";
import { clearLikeNotifications } from "../redux/rtnSlice";

const TopNavbar = () => {
  const [open, setOpen] = useState(false); // State for CreatePost Dialog
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for Profile Dropdown
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false); // State for Logout Confirmation
  const [openNotificationPopover, setOpenNotificationPopover] = useState(false); // Notification popover state
  const searchRef = useRef(null); // Reference for search input and results
  const dropdownRef = useRef(null); // Reference for dropdown menu
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector((store) => store.realTimeNotification);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setSearchQuery(""); // Close the search dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Close the profile dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  const handleLogOut = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
    setLogoutConfirmOpen(false); // Close the confirmation dialog
  };

  const handleNotificationPopoverChange = (isOpen) => {
    setOpenNotificationPopover(isOpen);
    if (!isOpen) {
      dispatch(clearLikeNotifications()); // Clear notifications when Popover closes
    }
  };

  return (
    <div className="w-full fixed top-0 z-10 bg-gray-900 border-b border-gray-700">
      {/* Navbar */}
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 text-red-400"
          >
            <AiOutlineHome className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center p-2 rounded-lg hover:bg-gray-700 text-red-400"
          >
            <AiOutlineMessage className="w-6 h-6" />
          </button>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 mx-4" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="Search users..."
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-gray-800 shadow-lg max-h-60 overflow-y-auto rounded-lg z-10">
                {searchResults.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-700 cursor-pointer text-white"
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
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <Popover.Root
            open={openNotificationPopover}
            onOpenChange={handleNotificationPopoverChange}
          >
            <Popover.Trigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-gray-700 text-red-400">
                <AiOutlineBell className="w-6 h-6" />
                {likeNotification.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
                    {likeNotification.length}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Content className="w-48 bg-gray-800 text-white rounded shadow p-4">
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

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
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
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white shadow-md rounded-lg py-2 z-20">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(`/profile/${user?._id}`);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-700"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setLogoutConfirmOpen(true); // Open confirmation dialog
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-700 text-red-500"
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-30">
          <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-xl font-semibold text-center mb-4 text-white">
              Confirm Logout
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Log Out
              </button>
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;
