import { useEffect } from 'react';
import React from 'react';
import Home from './components/Home';
import MainLayout from './components/MainLayout';
import AuthForm from './components/AuthForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { setSocketConnection } from './redux/socketSlice';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import ProtectedRoutes from './ProtectedRoutes';

// Configure routes
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>, // Render MainLayout at the root
    children: [
      {
        path: "/",
        element: <ProtectedRoutes><Home /></ProtectedRoutes>, // Home component as nested route
      },
      {
        path: "/profile/:id",
        element: <ProtectedRoutes><Profile /></ProtectedRoutes>, // Profile component as nested route
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>,
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>,
      },
    ],
  },
  {
    path: "/signup",
    element: <AuthForm />, // Sign Up page
  },
  {
    path: "/login",
    element: <AuthForm />, // Login page
  },
]);

// WebSocket instance (managed outside Redux)
let socketInstance = null;

// Main App Component
function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      // Initialize WebSocket connection
      socketInstance = io('http://localhost:8000', {
        query: { userId: user?._id },
        transports: ['websocket'],
      });

      // Dispatch connection metadata to Redux
      dispatch(
        setSocketConnection({
          isConnected: true,
          userId: user?._id,
        })
      );

      // Listen for WebSocket events
      socketInstance.on('getOnlineUsers', (onlineUsers) => {
        console.log('Online Users:', onlineUsers);
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketInstance.on('notification', (notification) => {
        console.log('Received notification:', notification);
        dispatch(setLikeNotification(notification));
      });

      // Cleanup WebSocket on unmount or logout
      return () => {
        if (socketInstance) {
          socketInstance.close();
          socketInstance = null;
          dispatch(
            setSocketConnection({
              isConnected: false,
              userId: null,
            })
          );
        }
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
      <ToastContainer />
    </>
  );
}

export default App;
