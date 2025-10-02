import React from "react";
import "../Style/Sidebar.css";
import { FaUserAlt } from "react-icons/fa";
import { MdDashboard, MdOutlineCalendarMonth } from "react-icons/md";
import logo from "../Assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { AiFillMedicineBox } from "react-icons/ai";
import { FaClock } from "react-icons/fa6";
import { FaClipboardCheck } from "react-icons/fa";
import { FaExclamationTriangle } from 'react-icons/fa';

const Sidebar = () => {
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
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/dashboard" ? "var(--primary)" : "",
                color:
                location.pathname === "/dashboard" ? "#fff" : "",
            }}
          >
            <MdDashboard className="sider-content-icon" />
            <p className="sider-content-content">Dashboard</p>
          </div>
        </Link>
        {/* <Link
          to="/remedies"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div 
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/remedies" ? "var(--primary)" : "",
                color:
                location.pathname === "/remedies" ? "#fff" : "",
            }}
          >
            <AiFillMedicineBox className="sider-content-icon" />
            <p className="sider-content-content">Remedies</p>
          </div>
        </Link> */}
        <Link
          to="/pending"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/pending" ? "var(--primary)" : "",
                color:
                location.pathname === "/pending" ? "#fff" : "",
            }}
          >
            <FaClock className="sider-content-icon" />
            <p className="sider-content-content">Pending Orders</p>
          </div>
        </Link>
        <Link
          to="/completed"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/completed" ? "var(--primary)" : "",
                color:
                location.pathname === "/completed" ? "#fff" : "",
            }}
          >
            <FaClipboardCheck className="sider-content-icon" />
            <p className="sider-content-content">Completed Orders</p>
          </div>
        </Link>
        {/* <Link
          to="/lowstock"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              borderBottom: "1px solid gray",
              borderTop: "1px solid gray",
              backgroundColor:
                location.pathname === "/lowstock" ? "var(--primary)" : "",
                color:
                location.pathname === "/lowstock" ? "#fff" : "",
            }}
          >
            <FaExclamationTriangle className="sider-content-icon" />
            <p className="sider-content-content" style={{fontSize:"16px"}}>Low Stock Remedies</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
};

export default Sidebar;
