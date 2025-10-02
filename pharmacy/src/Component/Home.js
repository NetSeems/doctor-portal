import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../Style/Home.css";
import Dashboard from "./Dashboard";
import { useAuth } from "./UserContext.js";
import Login from "./Login.js";
import PendingOrders from "./PendingOrders.js";
import CompletedOrders from "./CompletedOrders.js";
import Remedies from "./Remedies.js";
import Navbar from "./Navbar.js";
import Account from "./Account.js";
import ForgotPassword from "./ForgotPassword.js";
import LowStock from "./LowStock.js";
const Home = () => {
  const isMobile = window.innerWidth <= 768;
  const { currentPharmacy } = useAuth();

  return (
    <HashRouter>
      <div className="home-main-container">
        {currentPharmacy ? (
          <div className="home-content">
            <div className="sidebar-content">{!isMobile && <Sidebar />}</div>
            <div className="side-and-nav-border"></div>
            <div className="nav-home-content">
              <Navbar/>
              <div className="render-component">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pending" element={<PendingOrders />} />
                  <Route path="/completed" element={<CompletedOrders />} />
                  <Route path="/remedies" element={<Remedies />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/lowstock" element={<LowStock />} />
                  
                </Routes>
              </div>
            </div>
          </div>
        ) : (
         <Login/>
        )}
      </div>
    </HashRouter>
  );
};

export default Home;
