import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import TopNavbar from './LeftSidebar'; // Keep the sidebar or top navbar as TopNavbar

const MainLayout = () => {
  return (
    <div>
      <TopNavbar />
      {/* Add padding-top to main content to prevent it from being overlapped by the navbar */}
      <main className="pt-20"> {/* Adjust pt-20 based on your navbar height */}
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
};

export default MainLayout;
