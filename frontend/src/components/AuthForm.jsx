// AuthForm.js
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import InputBox from "./InputBox"; // Adjust the path as necessary
import logo from "../assets/mylogo.png";
import logo2 from "../assets/logo2.png";
import backgroundImage from "../assets/Background.jpg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';  


const AuthForm = () => {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const [loading,setLoading]=useState(false);
 
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
            const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
               // dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setEmail("");
                setPassword("");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        const input = { username, email, password }; 
        const res = await axios.post('http://localhost:8000/api/v1/user/register', input, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        if (res.data.success) {
            navigate("/");
            toast.success(res.data.message);
            setUsername("");
            setEmail("");
            setPassword("");
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    } finally {
        setLoading(false);
    }
};

  const handleForgotPassword = () => {
    // Logic for handling "Forgot Password"
    alert("Forgot Password feature is not implemented yet.");  
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <header className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-10">
        <img src={logo2} alt="Logo" className="h-20 w-30 " />
        <nav className="flex space-x-6">
        <a href="#" className="nav-link text-gray">Services</a>
        <a href="#" className="nav-link text-gray">FAQ</a>
        </nav>
      </header>
      <div className="wrapper bg-gray-800 bg-opacity-120 rounded-xl shadow-lg p-8">
        {isLoginActive ? (
          <div className="form-box">
            <h2 className="text-2xl text-white mb-6 text-center">Login</h2>
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
              <div className="flex items-center mb-4 text-white text-sm">
              <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe} // Use the state variable
                  onChange={() => setRememberMe(!rememberMe)} // Toggle the state
              />
                Remember me
              </div>
              <div className="flex justify-between mb-4 text-white text-sm">
                <a href="#" className="text-purple-400" onClick={handleForgotPassword}>
                  Forgot Password?
                </a>
              </div>
              <button type="submit" className="w-full bg-purple-700 text-white p-2 rounded-md">Login</button>
              <div className="mt-4 text-white">
                Don't have an account? 
                <a href="#" className="text-purple-400" onClick={() => setIsLoginActive(false)}> Sign up</a>
              </div>
            </form>
          </div>
        ) : (
          <div className="form-box">
            <h2 className="text-2xl text-white mb-6 text-center">Sign Up</h2>
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
                className={`w-full bg-purple-700 text-white p-2 rounded-md ${!termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={!termsAccepted}
              >
                Sign up
              </button>
              <div className="mt-4 text-white">
                Already have an account? 
                <a href="#" className="text-purple-400" onClick={() => setIsLoginActive(true)}> Login</a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
