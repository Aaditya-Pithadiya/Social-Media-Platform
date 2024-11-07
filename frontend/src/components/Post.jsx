import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
// import { useDispatch, useSelector } from 'react-redux';
// import { Badge } from './ui/badge';

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    // const { user } = useSelector(store => store.auth);
    // const { posts } = useSelector(store => store.post);
    // const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    // const [postLike, setPostLike] = useState(post.likes.length);
    // const [comment, setComment] = useState(post.comments);
    // const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    // const likeOrDislikeHandler = () => {
    //     const updatedLikes = liked ? postLike - 1 : postLike + 1;
    //     setPostLike(updatedLikes);
    //     setLiked(!liked);
    // }

    // const commentHandler = () => {
    //     if (text.trim()) {
    //         const newComment = {
    //             text,
    //             author: user
    //         };
    //         setComment([...comment, newComment]);
    //         setText("");
    //     }
    // }

    return (
        <div className="my-8 w-full max-w-sm mx-auto bg-purple-50 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Avatar className="border-2 border-purple-300">
                        <AvatarImage src="https://elements-resized.envatousercontent.com/envato-shoebox/02d5/3107-7931-4c5d-80b6-ec536b2918db/20220111_18496.jpg?w=1000&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=785e13878bdef4b7c4e76a79d4da32f0c13a58f1682403b1b1c57a7e60bf4837" alt="post_image" />
                        <AvatarFallback> CN</AvatarFallback>
                    </Avatar>
                    {/* <div className="flex items-center gap-3">
                        <h1 className="font-medium text-purple-900">{post.author?.username}</h1>
                        {user?._id === post.author._id && 
                            <Badge className="bg-purple-200 text-purple-700 hover:bg-purple-300">
                                Author
                            </Badge>
                        }
                    </div> */}
                    <h1>username</h1>
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
                         
                        <Button variant="ghost" 
                                className="cursor-pointer w-fit text-red-600 hover:bg-red-50">
                                Delete
                        </Button>
        
                    </DialogContent>
                </Dialog>
            </div>

            <img
                className="rounded-lg my-2 w-full aspect-square object-cover"
                src="https://images.unsplash.com/photo-1730313227484-898a7b98bab5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0fHx8ZW58MHx8fHx8"
                alt="post_img"
            />

            <div className="flex items-center justify-between my-4">
                <div className="flex items-center gap-4">
                    <FaHeart size={'22px'}/>
                    <MessageCircle  onClick={() => setOpen(true)} className="cursor-pointer text-purple-600 hover:text-purple-700"/>
                    <Send className="cursor-pointer text-purple-600 hover:text-purple-700"/>
                    {/* {liked ? 
                        <FaHeart 
                            onClick={likeOrDislikeHandler} 
                            size={24} 
                            className="cursor-pointer text-purple-600 hover:text-purple-700" 
                        /> : 
                        <FaRegHeart 
                            onClick={likeOrDislikeHandler} 
                            size={22} 
                            className="cursor-pointer text-purple-600 hover:text-purple-700" 
                        />
                    }
                    <MessageCircle 
                        onClick={() => setOpen(true)} 
                        className="cursor-pointer text-purple-600 hover:text-purple-700" 
                    />
                    <Send className="cursor-pointer text-purple-600 hover:text-purple-700" /> */}
                </div>
                <Bookmark className="cursor-pointer text-purple-600 hover:text-purple-700" />
            </div>

            <span className="font-medium text-purple-900 block mb-2">
                1k likes
            </span>
            
            <p className="text-purple-900">
                <span className="font-medium mr-2">username</span>
                 caption
            </p>

            {/* {comment.length > 0 && (
                <span 
                    onClick={() => setOpen(true)} 
                    className="cursor-pointer text-sm text-purple-500 hover:text-purple-700 mt-2 block"
                >
                    View all {comment.length} comments
                </span>
            )} */}
            <span className='text-sm text-purple-400'>view all 10 comments</span>

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
                       // onClick={commentHandler} 
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