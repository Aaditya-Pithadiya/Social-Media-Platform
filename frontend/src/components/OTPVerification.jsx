import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'react-toastify';

const OTPVerificationDialog = ({ open, setOpen}) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const[email,setEmail]= useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  // Added confirm password state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
console.log(email,otp,password,confirmPassword);
    try {
      const res = await axios.post('https://social-media-platform-0937.onrender.com/api/v1/user/verifyUpdate', { 
        email:email, otp:otp, password:password, confirmPassword:confirmPassword });
      console.log(email,otp,password,confirmPassword);
      if (res.data.success) {
        toast.success("Password reset successful.");
        setOpen(false);
      }
    } catch (error) {
      toast.error("OTP verification failed.");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
        <DialogTitle className="text-center text-2xl font-semibold text-gray-200">OTP Verification</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Removed the email input field since it's passed as a prop */}
          <Input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}  // Bound to confirmPassword state
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" className="w-full bg-red-600 text-white">
            Verify & Reset Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationDialog;
