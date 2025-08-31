import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import userService from "./services/domain-services/UserService.js";
import hotPocketService from "./services/common-services/HotPocketService";
import { setUserDetails } from "./store/slices/userSlice.js";

import Web3AuthPage from "./pages/Web3AuthPage.tsx";
import SignUp from "./pages/SignUp.js";
import DashboardNavbar from "./components/DashboardNavbar.js";
import UserNavbar from "./components/UserNavbar.js";
import ProfileInfo from "./pages/ProfileInfo.js";
import CreateCourt from "./pages/CreateCourt.js";
import ManageCourt from "./pages/ManageCourt.js";
import CourtBooking from "./pages/CourtBooking.js";
import MyBookings from "./pages/MyBookings.js";
import EditCourt from "./pages/EditCourt.js";
import ViewCourt from "./pages/ViewCourt.js";
import ConfirmBooking from "./pages/ConfirmBooking.js";
import CourtHome from "./pages/CourtHome.js";
import UserHome from "./pages/UserHome.js";
import AddAvailability from "./pages/AddAvailability.js";
import EditProfile from "./pages/EditProfile.js";
import WalletManagement from "./pages/WalletManagement.js";
import Cart from "./pages/CartPage.js"; 

import Chatbot from "./components/Chatbot";  // <-- Import your Chatbot component here

import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const { web3Authorized, userInfo } = useSelector((state) => state.auth);
  const userDetails = useSelector((state) => state.user.userDetails);

  const [isHotPocketConnected, setIsHotPocketConnected] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    if (web3Authorized) {
      const initHotPocket = async () => {
        const connected = await hotPocketService.initialize();
        setIsHotPocketConnected(connected);
      };
      initHotPocket();
    }
  }, [web3Authorized]);

  useEffect(() => {
    const checkUserExistence = async () => {
      if (isHotPocketConnected && userInfo?.email) {
        try {
          const res = await userService.checkUser(userInfo?.email);
          if (res?.success === true) {
            setUserExists(true);
            dispatch(setUserDetails(res.user));
          } else {
            setUserExists(false);
          }
        } catch (error) {
          console.error("Error checking user:", error);
        } finally {
          setIsUserChecked(true);
        }
      }
    };
    checkUserExistence();
  }, [isHotPocketConnected, userInfo, dispatch]);

  if (web3Authorized && (!isHotPocketConnected || !isUserChecked)) {
    return <div>Loading...</div>;
  }
  
 
  return (
    <Router>
      {/* Show navbars based on user role */}
      {userDetails?.UserRole === "CourtOwner" && <DashboardNavbar />}
      {userDetails?.UserRole === "PublicUser" && <UserNavbar />}

      <div className="app-container">
        <div className="grid">
          <Routes>
            {/* Route for unauthorized users */}
            {!web3Authorized && <Route path="/" element={<Web3AuthPage />} />}

            {/* Routes for authorized users */}
            {web3Authorized && (
              <>
                {/* Redirects based on user existence and role */}
                {!userExists && <Route path="/" element={<Navigate to="/signup" />} />}
                {userExists && userDetails?.UserRole === "CourtOwner" && (
                  <Route path="/" element={<Navigate to="/dashboard/court-home" />} />
                )}
                {userExists && userDetails?.UserRole === "PublicUser" && (
                  <Route path="/" element={<Navigate to="/userdashboard/user-home" />} />
                )}

                <Route path="/signup" element={<SignUp />} />

                {/* Shared routes for all logged-in users */}
                <Route path="/dashboard/profile" element={<ProfileInfo />} />
                <Route path="/viewcourt" element={<ViewCourt />} />
                <Route path="/confirmbooking" element={<ConfirmBooking />} />
                <Route path="/cart" element={<Cart />} />

                {/* Routes for Public Users */}
                {userDetails?.UserRole === "PublicUser" && (
                  <>
                    <Route path="/userdashboard/user-home" element={<UserHome />} />
                    <Route path="/userdashboard/booking" element={<CourtBooking />} />
                    <Route path="/userdashboard/myBookings" element={<MyBookings />} />
                    <Route path="/userdashboard/profile" element={<ProfileInfo />} />
                  </>
                )}

                {/* Routes for Court Owners */}
                {userDetails?.UserRole === "CourtOwner" && (
                  <>
                    <Route path="/dashboard/court-home" element={<CourtHome />} />
                    <Route path="/dashboard/court" element={<CreateCourt />} />
                    <Route path="/dashboard/myCourts" element={<ManageCourt />} />
                    <Route path="/dashboard/edit-court/:courtId" element={<EditCourt />} />
                    <Route path="/dashboard/add-availability/:courtId" element={<AddAvailability />} />
                    <Route path="/dashboard/profile/edit" element={<EditProfile />} />
                    <Route path="/dashboard/wallet" element={<WalletManagement />} />
                  </>
                )}
              </>
            )}

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>

      {/* Show chatbot only when user is logged in and userDetails are loaded */}
      {web3Authorized && userDetails && <Chatbot />}
    </Router>
  );
};

export default App;
