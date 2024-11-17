import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
 import { useDispatch, useSelector } from 'react-redux'
 import Comment from './Comment'
 import axios from 'axios'
 import { toast } from 'sonner'
 import { setPosts } from '../redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {
   const [text, setText] = useState("");
   const { selectedPost, posts } = useSelector(store => store.post);
   const [comment, setComment] = useState([]);
   const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    
    try {
      const res = await axios.post(`https://social-media-platform-0937.onrender.com/api/v1/post/${selectedPost?._id}/comment`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
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
   
    <Dialog open={open}>
  <DialogContent 
    onInteractOutside={() => setOpen(false)} 
    className="max-w-4xl p-0 flex flex-col md:flex-row md:max-w-5xl"
  >
    <div className="flex-1 flex">
      {/* Image Section */}
      <div className="w-full md:w-1/2 ">
        <img
          src={selectedPost?.image}
          alt="Post Image"
          className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
        />
      </div>

      {/* Comments Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-between bg-gray-800">
        <div className="p-4 border-b border-gray-00 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link>
              <Avatar>
                <AvatarImage src={selectedPost?.author?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link className="font-semibold text-sm text-gray-200 hover:underline">
                {selectedPost?.author?.username}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4  text-gray-200 overflow-y-auto max-h-96">
          {comment.map((c) => (
            <Comment key={c._id} comment={c} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={changeEventHandler}
              placeholder="Add a comment..."
              className="w-full border border-red-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <Button
              disabled={!text.trim()}
              onClick={sendMessageHandler}
              variant="outline"
              className="text-sm bg-gray-700 text-gray-50 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

     
  )
}

export default CommentDialog;