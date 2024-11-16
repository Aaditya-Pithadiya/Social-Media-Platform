import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import TopNavbar from "./LeftSidebar"; // Keep the sidebar or top navbar as TopNavbar
import CreatePostButton from "./CreatePostButton";
import { useSelector } from "react-redux";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen bg-gray-900 flex flex-col"
    >
      <TopNavbar />
      <CreatePostButton />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
