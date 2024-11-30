import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios from 'axios';
 

const SignUpVerifyDialog = ({ open, setOpen, onSubmitEmail,email}) => {
  //const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(otp);
    setError(""); // Clear any previous errors
    setIsLoading(true); // Set loading state to true
   
    try {
      // Log the request data to see what we are sending
     //console.log("Sending email and OTP to the backend:", { email, otp });

      // Make the API request to verify the email and OTP
      const response = await axios.post("https://social-media-platform-0937.onrender.com/api/v1/user/Verifyemail", { "email":email, "otp":otp });

      // Log the response to see what we get from the backend
      //console.log("Backend response:", response);

      if (response.data.success) {
        // OTP verified successfully, call the parent function to handle further actions
        onSubmitEmail(); 
        setOpen(false); // Close the dialog
      } else {
        // If response is not successful, display an error message
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      // Log the full error to debug
      console.error("Error verifying OTP:", err);

      // Show a more descriptive error message based on the error response
      if (err.response) {
        // If the error is related to a specific response from the backend
        console.log("Error from backend:", err.response.data); // Log error data for debugging
        setError(`Error: ${err.response.data.message || 'Unknown error occurred'}`);
      } else {
        // If no response is returned from the backend
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg mx-auto mt-10">
        <DialogTitle className="text-center text-2xl font-semibold text-gray-200 mb-4">Email Verification</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
            <Input type="email" placeholder="Enter your Gmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-3">OTP</label>
            <Input type="text" placeholder="Enter OTP sent to your email" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <p className="text-red-700 text-center">OTP will be valid for 90 seconds</p>
          <Button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600">
            {isLoading ? "Verifying..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpVerifyDialog;
