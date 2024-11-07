// MainLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

const MainLayout = () => {
  return (
    <div>
      <LeftSidebar/>
      <main>
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
};

export default MainLayout;
