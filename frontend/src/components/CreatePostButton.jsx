import React, { useState } from 'react';
import CreatePost from './CreatePost';
import { FaPlus } from "react-icons/fa";

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
          className="p-6 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-500 transition-all duration-300 flex items-center justify-center"
        >
          <FaPlus className="w-12 h-12" />
        </button>
      </div>

      {/* Create Post Modal */}
      {open && <CreatePost key={resetKey} open={open} setOpen={handleClose} />}
    </>
  );
};

export default CreatePostButton;
