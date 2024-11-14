// ForgotPasswordDialog.js
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
import { toast } from 'react-toastify';
import OTPVerificationDialog from "./OTPVerification.jsx";

const ForgotPasswordDialog = ({ open, setOpen, setOtpVerificationOpen }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/v1/user/sendotp', { email });
      toast.success("OTP sent to your email.");
      setOpen(false); // Close Forgot Password Dialog
      setOtpVerificationOpen(true); // Open OTP Verification Dialog
    } catch (error) {
      toast.error("Failed to send OTP.");
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-md p-6 bg-white rounded-lg shadow-lg">
        <DialogTitle className="text-center text-2xl font-semibold">Forgot Password</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full bg-purple-600 text-white">Send OTP</Button>
        </form>
      </DialogContent>
      {/* <OTPVerificationDialog open={setOtpVerificationOpen} setOpen={setOtpVerificationOpen} email={email} /> */}
    </Dialog>
  );
};

export default ForgotPasswordDialog;
