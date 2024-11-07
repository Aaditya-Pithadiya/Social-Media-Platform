// App.jsx
import React from 'react';
import Home from './components/Home';
import MainLayout from './components/MainLayout';
import AuthForm from './components/AuthForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Profile from './components/Profile';

// Configure routes
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Render MainLayout at the root
    children: [
      {
        path: "/",
        element: <Home />, // Home component as nested route
      },
      {
        path: "/profile",
        element: <Profile />, // Profile component as nested route
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
  return (
    <div className="App">
      <RouterProvider router={browserRouter} />
      <ToastContainer />
    </div>
  );
}

export default App;
