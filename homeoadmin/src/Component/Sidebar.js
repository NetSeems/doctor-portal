import React from "react";
import "../Style/Sidebar.css";
import { MdOutlineCalendarMonth } from "react-icons/md";
import logo from "../Assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { FaRegClock } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { LuLayoutDashboard } from "react-icons/lu";
import { useAuth } from "./UserContext.js";
const Sidebar = () => {
  const { currentDoctor } = useAuth();

  const location = useLocation();
  return (
    <div className="sidebar-main-container">
      <div className="logo">
        <div className="logo-image">
          <img src={logo} alt="Logo" />
        </div>
        <div>
          <p className="logo-text">
            HOMOEOPATHIC HEALTH CARE & RESEARCH CENTER
          </p>
        </div>
      </div>
      <div className="sider-content">
        <Link
          to="/dashboard"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/dashboard" ? "var(--primary)" : "",
              color: location.pathname === "/dashboard" ? "#fff" : "",
            }}
          >
            <LuLayoutDashboard className="sider-content-icon" />
            <p className="sider-content-content">Dashboard</p>
          </div>
        </Link>
        {/* <Link to="/user" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/user" ? "var(--primary)" : "",
              color: location.pathname === "/user" ? "#fff" : "",
            }}
          >
            <FiUser className="sider-content-icon" />
            <p className="sider-content-content">Online Patient</p>
          </div>
        </Link>
        <Link
          to="/appointment"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/appointment" ? "var(--primary)" : "",
              color: location.pathname === "/appointment" ? "#fff" : "",
            }}
          >
            <MdOutlineCalendarMonth className="sider-content-icon" />
            <p className="sider-content-content">Appointments</p>
          </div>
        </Link>
        <Link
          to="/scheduletime"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/scheduletime" ? "var(--primary)" : "",
              color: location.pathname === "/scheduletime" ? "#fff" : "",
            }}
          >
            <FaRegClock className="sider-content-icon" />
            <p className="sider-content-content">Schedule Time</p>
          </div>
        </Link> */}
        {/* {currentDoctor?.type && currentDoctor.type !== "onlie" && ( */}
          <Link
            to="/offlinepatient"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                borderBottom: "1px solid gray",
                borderTop: "1px solid gray",
                backgroundColor:
                  location.pathname === "/offlinepatient"
                    ? "var(--primary)"
                    : "",
                color: location.pathname === "/offlinepatient" ? "#fff" : "",
              }}
            >
              <FaRegClock className="sider-content-icon" />
              <p className="sider-content-content">Offline Patient</p>
            </div>
          </Link>
        {/* )} */}
      </div>
    </div>
  );
};

export default Sidebar;
