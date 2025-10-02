import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../Style/Home.css";
import User from "./User";
import Appointment from "./Appointment";
import ScheduleTime from "./ScheduleTime";
import Dashboard from "./Dashboard";
import Login from "./Login";
import { useAuth } from "./UserContext.js";
import Account from "./Account.js";
import ForgotPassword from "./ForgotPassword.js";
import OfflinePatient from "./OfflinePatient.js";

const Home = () => {
  const { currentDoctor } = useAuth();
  const isMobile = window.innerWidth <= 768;



  return (
    <HashRouter>
      {!currentDoctor ? (
        <Login />
      ) : (
        <div className="home-main-container">
          <div className="home-content">
            <div className="sidebar-content">{!isMobile && <Sidebar />}</div>
            <div className="side-and-nav-border"></div>
            <div className="nav-home-content">
              <Navbar/>
              <div className="render-component">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/user" element={<User />} />
                  <Route path="/appointment" element={<Appointment />} />
                  <Route path="/scheduletime" element={<ScheduleTime />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/offlinepatient" element={<OfflinePatient />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      )}
    </HashRouter>
  );
};

export default Home;
