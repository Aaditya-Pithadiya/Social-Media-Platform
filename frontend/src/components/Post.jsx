import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
 import { useDispatch, useSelector } from 'react-redux';
 import { Badge } from './ui/badge';
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '../redux/postSlice'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
     const { user } = useSelector(store => store.auth);
     const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
     const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }
    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, { withCredentials: true });
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }
    const commentHandler = async () => {

        try {
            const res = await axios.post(`http://localhost:8000/api/v1/post/${post._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }
   
    return (
        <div className="my-8 w-full max-w-sm mx-auto bg-purple-50 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Avatar className="border-2 border-purple-300">
                        <AvatarImage src={post.author.profilePicture} alt="post_image" />
                        <AvatarFallback> CN</AvatarFallback>
                    </Avatar>
                    { <div className="flex items-center gap-3">
                        <h1 className="font-medium text-purple-900">{post.author?.username}</h1>
                        {user?._id === post.author._id && 
                            <Badge className="bg-purple-200 text-purple-700 hover:bg-purple-300">
                                Author
                            </Badge>
                        }
                    </div> }
                   
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className="cursor-pointer text-purple-600 hover:text-purple-800" />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center bg-purple-50">
                        
                        <Button variant="ghost" 
                                className="cursor-pointer w-fit text-purple-700 font-bold hover:bg-purple-100">
                                Unfollow
                        </Button>
                        
                        <Button variant="ghost" 
                            className="cursor-pointer w-fit text-purple-700 hover:bg-purple-100">
                            Add to favorites
                        </Button>
                         {
                            user&&user?._id===post?.author._id&& 
                            <Button onClick={deletePostHandler} variant="ghost" 
                            className="cursor-pointer w-fit text-red-600 hover:bg-red-50">
                            Delete
                    </Button>
                         }
                       
        
                    </DialogContent>
                </Dialog>
            </div>

            <img
                className="rounded-lg my-2 w-full aspect-square object-cover"
                src={post.image}
                alt="post_img"
            />
 
            <div className="flex items-center justify-between my-4">
                <div className="flex items-center gap-4">
                {
                        liked ? <FaHeart  onClick={likeOrDislikeHandler} size={'24'} className='cursor-pointer text-purple-600' /> : <FaRegHeart onClick={likeOrDislikeHandler} size={'22px'} className='cursor-pointer text-purple-600 hover:text-purple-700' />
                    }
                    <MessageCircle  onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true)
                        }} className="cursor-pointer text-purple-600 hover:text-purple-700"/>
                    <Send className="cursor-pointer text-purple-600 hover:text-purple-700"/>
                   
                </div>
                <Bookmark className="cursor-pointer text-purple-600 hover:text-purple-700" />
            </div>

            <span className="font-medium text-purple-900 block mb-2">
                {post.likes.length} likes
            </span>
            
            <p className="text-purple-900">
                <span className="font-medium mr-2">{post.author?.username}</span>
                 {post.caption}
            </p>

            {
                comment.length>0&&
                <span onClick={() => {
                    dispatch(setSelectedPost(post));
                    setOpen(true)
                    }} className='text-sm text-purple-400 cursor-pointer'>view all {comment.length} comments</span>

            }
            
            <CommentDialog open={open} setOpen={setOpen} />

            <div className="flex items-center justify-between mt-4 border-t border-purple-200 pt-4">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={changeEventHandler}
                    className="outline-none text-sm w-full bg-transparent text-purple-900 placeholder-purple-400"
                />
                {text && 
                    <span 
                        onClick={commentHandler} 
                        className="text-purple-600 hover:text-purple-800 cursor-pointer font-medium"
                    >
                        Post
                    </span>
                }
            </div>
        </div>
    );
};

export default Post;