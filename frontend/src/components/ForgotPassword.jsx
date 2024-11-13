import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'; 
import { Button } from './ui/button'; 
import { Input } from './ui/input'; 

const ForgotPasswordDialog = ({ open, setOpen, onSubmitEmail }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitEmail(email); // Trigger OTP dialog after email submission
    setOpen(false); // Close the Forgot Password dialog
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg mx-auto mt-10">
        <DialogTitle className="text-center text-2xl font-semibold text-gray-800 mb-4">Forgot Password</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 text-white font-medium py-2 rounded-md hover:bg-purple-700 transition duration-150"
          >
            Send OTP
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
