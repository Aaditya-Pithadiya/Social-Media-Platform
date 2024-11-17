import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import InputBox from "./InputBox"; 
import backgroundImage from "../assets/backgroudImage.jpg";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';  
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import ForgotPasswordDialog from "./ForgotPassword.jsx";
import OTPVerificationDialog from "./OTPVerification.jsx";
import SignUpVerifyDialog from "./SignUpVerify";

const AuthForm = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signupVerifyOpen, setSignupVerifyOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [otpVerificationOpen, setOtpVerificationOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    setEmail("");
    setPassword("");
    setUsername("");
    setRememberMe(false);
    setTermsAccepted(false);
  }, [isLoginActive]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const input = { email, password }; 
      const res = await axios.post('https://social-media-platform-0937.onrender.com/api/v1/user/login', input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/"); 
        toast.success(res.data.message);
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const input = { "username" :username, "email" : email, "password" : password };
      const res = await axios.post('https://social-media-platform-0937.onrender.com/api/v1/user/register', input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      setSignupVerifyOpen(true);
      toast.success("Please verify your email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = () => {
    setSignupVerifyOpen(false); 
    setIsLoginActive(true);
    navigate("/login");
    setEmail("");
    setPassword("");
    setUsername(""); 
    toast.success("Registration and verification successful! Please log in...");
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleSubmitEmail = (email) => {
    setEmail(email);
    setOtpVerificationOpen(true); 
    setForgotPasswordOpen(false);
  };

  const handleSubmitOTP = (otp) => {
    setOtpVerificationOpen(false);
    toast.success("OTP verified successfully.");
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="wrapper bg-gray-900 bg-opacity-90 rounded-xl shadow-lg p-8">
        {isLoginActive ? (
          <div className="form-box">
            <h2 className="text-3xl text-red-600 mb-6 text-center">Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <InputBox
                icon={<FaEnvelope />}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
              <InputBox
                icon={<FaLock />}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-between mb-4 text-white text-sm">
                <a className="text-red-400 cursor-pointer" onClick={handleForgotPassword}>
                  Forgot Password?
                </a>
              </div>
              <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md">Login</button>
              <div className="mt-4 text-white">
                Don't have an account? 
                <a href="#" className="text-red-400" onClick={() => setIsLoginActive(false)}> Sign up</a>
              </div>
            </form>
          </div>
        ) : (
          <div className="form-box">
            <h2 className="text-3xl text-red-500 mb-6 text-center">Sign Up</h2>
            <form onSubmit={handleSignupSubmit}>
              <InputBox
                icon={<FaUser />}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <InputBox
                icon={<FaEnvelope />}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                required
              />
              <InputBox
                icon={<FaLock />}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center mb-4 text-white text-sm">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)} 
                />
                I agree to all the terms and conditions
              </div>
              <button 
                type="submit" 
                className={`w-full bg-red-500 text-white p-2 rounded-md ${!termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={!termsAccepted}
              >
                Sign up
              </button>
              <div className="mt-4 text-white">
                Already have an account? 
                <a href="#" className="text-red-400" onClick={() => setIsLoginActive(true)}> Login</a>
              </div>
            </form>
          </div>
        )}
      </div>
      <ForgotPasswordDialog open={forgotPasswordOpen} setOpen={setForgotPasswordOpen} setOtpVerificationOpen={setOtpVerificationOpen} />
      <OTPVerificationDialog open={otpVerificationOpen} setOpen={setOtpVerificationOpen} onSubmitOTP={handleSubmitOTP} email={email} />
      <SignUpVerifyDialog open={signupVerifyOpen} setOpen={setSignupVerifyOpen} onSubmitEmail={handleOtpVerified} email={email}/>
    </div>
  );
};

export default AuthForm;
