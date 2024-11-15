import user_photo from "../assets/user photo.jpg"; // Fixed file name syntax
import useGetUserProfile from "../hooks/useGetUserProfile";
import { setPosts, setSelectedPost } from "../redux/postSlice";
import CommentDialog from "./CommentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import axios from "axios";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { userProfile: globalUserProfile, user } = useSelector(
    (store) => store.auth
  );
  const [userProfile, setUserProfile] = useState(globalUserProfile);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useGetUserProfile(user?._id);

  const [isFollowing, setIsFollowing] = useState(
    userProfile?.following.includes(post.author?._id)
  );
  const [isBookmarked, setIsBookmarked] = useState(
    userProfile?.bookmarks.includes(post._id)
  );

  useEffect(() => {
    setUserProfile(globalUserProfile);
  }, [globalUserProfile]);

  const changeEventHandler = (e) => {
    setText(e.target.value.trim());
  };

  const navigateToUserProfile = (userId) => {
    navigate(`/profile/${userId}`); // Fixed template literal
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/bookmark`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(res.data.message);

        setUserProfile((prevProfile) => ({
          ...prevProfile,
          bookmarks: isBookmarked
            ? prevProfile.bookmarks.filter(
                (bookmarkId) => bookmarkId !== post._id
              )
            : [...prevProfile.bookmarks, post._id],
        }));
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      toast.error("Could not bookmark the post");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setPostLike(liked ? postLike - 1 : postLike + 1);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error deleting post");
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${post.author?._id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          followers: isFollowing
            ? prevProfile.followers.filter(
                (followerId) => followerId !== user?._id
              )
            : [...prevProfile.followers, user?._id],
        }));
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto bg-purple-50 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar className="border-2 border-purple-300">
            <AvatarImage
              src={post.author?.profilePicture || "defaultProfilePictureUrl"}
              alt="User avatar"
            />
            <AvatarFallback>
              <img
                src={user_photo}
                alt="Fallback avatar"
                className="h-20 w-20 object-cover"
              />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1
              onClick={() => navigateToUserProfile(post.author?._id)}
              className="font-medium text-purple-900 cursor-pointer"
            >
              {post.author?.username || "Unknown User"}
            </h1>
            {user?._id === post.author?._id && (
              <Badge className="bg-purple-200 text-purple-700 hover:bg-purple-300">
                Author
              </Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer text-purple-600 hover:text-purple-800" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center bg-purple-50">
            {user && user._id !== post.author?._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-purple-700 font-bold hover:bg-purple-100"
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            {user && user._id === post.author?._id && (
              <Button
                onClick={deletePostHandler}
                variant="ghost"
                className="cursor-pointer w-fit text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <img
        className="rounded-lg my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="Post"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikeHandler}
              size={24}
              className="cursor-pointer text-purple-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikeHandler}
              size={22}
              className="cursor-pointer text-purple-600 hover:text-purple-700"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer text-purple-600 hover:text-purple-700"
          />
        </div>
        <div className="flex items-center justify-between my-4">
          {isBookmarked ? (
            <FaBookmark
              onClick={bookmarkHandler}
              className="cursor-pointer text-purple-700"
              size={22}
            />
          ) : (
            <FaRegBookmark
              onClick={bookmarkHandler}
              className="cursor-pointer text-purple-700"
              size={22}
            />
          )}
        </div>
      </div>
      <div className="text-xs font-medium">{postLike} likes</div>
      <CommentDialog open={open} setOpen={setOpen} post={post} />
    </div>
  );
};

export default Post;
