// ForgotPasswordDialog.js
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPasswordDialog = ({ open, setOpen, setOtpVerificationOpen }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('https://social-media-platform-0937.onrender.com/api/v1/user/sendotp', { email });
      toast.success("OTP sent to your email.");
      setOpen(false); // Close Forgot Password Dialog
      setEmail("");
      setOtpVerificationOpen(true); // Open OTP Verification Dialog
    } catch (error) {
      toast.error("Failed to send OTP.");
    }finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
        <DialogTitle className="text-center text-2xl text-gray-200 font-semibold">Forgot Password</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full bg-red-600 text-white hover:bg-red-700">{loading ? "Sending..." : "Send OTP"}</Button>
        </form>
      </DialogContent>
      {/* <OTPVerificationDialog open={setOtpVerificationOpen} setOpen={setOtpVerificationOpen} email={email} /> */}
    </Dialog>
  );
};

export default ForgotPasswordDialog;
