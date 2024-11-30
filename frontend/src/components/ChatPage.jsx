import { setSelectedUser } from "../redux/authSlice";
import { setMessages } from "../redux/chatSlice";
import Messages from "./Messages";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { MessageCircleCode } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { userProfile, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  ); // Getting userProfile
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  // Filter suggested users to include only those the user is following
  const followingUsers = suggestedUsers.filter((user) =>
    userProfile?.following?.includes(user._id)
  );

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `https://social-media-platform-0937.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar - Users List */}
      <section className="w-1/4 sticky bg-gray-900 p-4 h-full overflow-y-auto border border-gray-300">
        <h1 className="font-bold mb-4 text-xl text-gray-100">
          {userProfile?.username}
        </h1>
        <hr className="mb-4 border-gray-700" />
        <div className="overflow-y-auto h-[80vh] space-y-3">
          {followingUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex gap-3 items-center p-3 hover:bg-gray-800 cursor-pointer rounded-md"
                key={suggestedUser._id}
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback className="bg-gray-700 text-white">
                    CN
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-200">
                    {suggestedUser?.username}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      
      {/* Chat Section */}
      <section className="flex-1 flex flex-col h-full bg-gray-900 text-gray-100">
        {selectedUser ? (
          <>
            {/* Selected User's Header */}
            <div className="flex gap-3 items-center px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-800 shadow-md">
              <Avatar>
                <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                <AvatarFallback className="bg-gray-700 text-white">
                  CN
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{selectedUser?.username}</span>
              </div>
            </div>

            {/* Messages Component */}
            <Messages selectedUser={selectedUser} className="mb-[73px]"/>

            {/* Input Message Box */}
            <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800 fixed bottom-0 left-[25%] w-[75%]">
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                type="text"
                className="flex-1 mr-2 focus-visible:ring-transparent text-gray-900 bg-gray-100 placeholder-gray-400"
                placeholder="Messages..."
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center mx-auto text-gray-100">
            <MessageCircleCode className="w-32 h-32 my-4 text-gray-400" />
            <h1 className="font-medium">Your messages</h1>
            <span>Send a message to start a chat.</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;
