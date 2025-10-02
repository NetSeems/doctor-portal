import React from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Account.css";
import { useAuth } from "./UserContext.js";
import { FaUserAlt } from "react-icons/fa";

const Account = () => {
  const { currentDoctor, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const handleEditClick = (field) => {
    navigate("/forgotpassword", { state: { field } });
  };

  return (
    <>
      <h1 className="login-main-h1">My Profile</h1>
      <div className="login-main">
        <div className="userdpdiv">
          <div>
            <FaUserAlt size={40} />
            <p>{currentDoctor?.name}</p>
          </div>
        </div>
        <div className="login-main-first">
          <div className="login-main-first-first">
            <label>Name</label>
            <p>{currentDoctor?.name}</p>
          </div>
          <button
            onClick={() => handleEditClick("name")}
            className="login-main-first-second"
          >
            Edit
          </button>
        </div>
        <div className="login-main-first">
          <div className="login-main-first-first">
            <label>Email</label>
            <p>{currentDoctor?.email}</p>
          </div>
        </div>
        <div className="login-main-first" style={{ borderBottom: "none" }}>
          <div className="login-main-first-first">
            <label>Password</label>
            <p>********</p>
          </div>
          <button
            onClick={() => {
              navigate("/forgotpassword");
            }}
            className="login-main-first-second"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
};

export default Account;
