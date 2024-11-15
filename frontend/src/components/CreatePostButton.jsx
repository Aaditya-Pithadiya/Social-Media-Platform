import React, { useState } from 'react';
import CreatePost from './CreatePost';
import { AiOutlinePlusSquare } from 'react-icons/ai';

const CreatePostButton = () => {
  const [open, setOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Key to force re-render the CreatePost component

  const handleOpen = () => {
    setResetKey((prevKey) => prevKey + 1); // Increment the key to reset state
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Create Post Button */}
      <div className="fixed bottom-4 left-4 z-20">
        <button
          onClick={handleOpen}
          className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
        >
          <AiOutlinePlusSquare className="w-8 h-8" />
        </button>
      </div>

      {/* Create Post Modal */}
      {open && <CreatePost key={resetKey} open={open} setOpen={handleClose} />}
    </>
  );
};

export default CreatePostButton;
