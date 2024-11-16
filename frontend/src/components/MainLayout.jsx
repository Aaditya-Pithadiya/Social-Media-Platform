import React, { useEffect } from "react"
import { Outlet , useNavigate} from 'react-router-dom';
import TopNavbar from './LeftSidebar'; // Keep the sidebar or top navbar as TopNavbar
import CreatePostButton from './CreatePostButton';
import { useSelector } from "react-redux";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!user) {
      // If the user is not logged in, navigate to the login page
      navigate("/login");
    }
  }, [user, navigate]);
  return (
    <div>
      <TopNavbar />
      <CreatePostButton/>
      {/* Add padding-top to main content to prevent it from being overlapped by the navbar */}
      <main className="pt-20"> {/* Adjust pt-20 based on your navbar height */}
        <Outlet /> {/* Render nested routes here */}
      </main>
    </div>
  );
};

export default MainLayout;
