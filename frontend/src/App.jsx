// App.jsx
import { useEffect } from 'react'
import React from 'react';
import Home from './components/Home';
import MainLayout from './components/MainLayout';
import AuthForm from './components/AuthForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage  from './components/ChatPage';
import {io} from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { setSocket } from './redux/socketSlice';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import ProtectedRoutes from './ProtectedRoutes';


// Configure routes
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element:<ProtectedRoutes><MainLayout /></ProtectedRoutes> , // Render MainLayout at the root
    children: [
      {
        path: "/",
        element:<ProtectedRoutes> <Home /> </ProtectedRoutes> , // Home component as nested route
      },
      {
        path: "/profile/:id",
        element: <ProtectedRoutes> <Profile /> </ProtectedRoutes>, // Profile component as nested route
      },
      {
        path:'/account/edit',
        element: <ProtectedRoutes><EditProfile/></ProtectedRoutes>,
      },
      {
        path:'/chat',
        element: <ProtectedRoutes> <ChatPage/> </ProtectedRoutes>,
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

// Main App Component
function App() {

  const { user } = useSelector(store => store.auth);
  const { socket } = useSelector(store => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });
      dispatch(setSocket(socketio));

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        console.log(notification);
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if (socket) {
      socket.close();
      dispatch(setSocket(null));
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
