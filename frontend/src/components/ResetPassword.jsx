import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'; 

const ResetPasswordDialog = ({ open, setOpen }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      // Handle the password reset API call
      console.log('Password reset successfully');
      setOpen(false); // Close the dialog after successful reset
    } else {
      alert("Passwords do not match!");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg mx-auto mt-10">
        <DialogTitle className="text-center text-2xl font-semibold text-gray-800 mb-4">Reset Password</DialogTitle>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <input 
              type="password" 
              placeholder="Type your new password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
            <input 
              type="password" 
              placeholder="Confirm the new password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white font-medium py-2 rounded-md hover:bg-purple-700 transition duration-150"
          >
            Reset Password
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
