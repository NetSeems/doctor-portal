import React, { useState, useEffect } from "react";
import "../Style/Navbar.css";
import { RiAccountBoxFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./UserContext.js";

const Navbar = ({ handleShowComponent }) => {
    const { logout } = useAuth();
  console.log("Handle Show Received",handleShowComponent);
  const navigate = useNavigate();
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const handleMyProfile = () => {
    setShowMyProfile(!showMyProfile);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleShowOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleNavigation = (component) => {
    setShowOptions(false); // Close menu on mobile after selection
    handleShowComponent(component)
  };
  return (
    <div className="navbar-main-container">
      {/* {isMobile ? (
        <GiHamburgerMenu
          onClick={handleShowOptions}
          style={{ width: "13%", fontSize: "30px" }}
        />
      ) : (
        ""
      )} */}
      {/* <div className="navbar-1">
        <input placeholder="search" />
        <IoSearch style={{ fontSize: "50px", cursor: "pointer" }} />
      </div> */}
      <div className="navbar-2">
        {/* <MdNotifications style={{ fontSize: "35px", cursor: "pointer" }} /> */}
        <div className="navbar-3" onClick={handleMyProfile}>
          <RiAccountBoxFill  style={{ fontSize: "33px", cursor: "pointer" }} />
          {!isMobile ? (
            <p style={{ fontSize: "20px", fontWeight: "600" }}>My Profile</p>
          ) : (
            ""
          )}
           {showMyProfile && (
            <div className="myprofile-option">
              <p
                onClick={() => {
                  navigate("/account");
                  setShowMyProfile(false);
                }}
              >
                My Profile
              </p>
              <p
                onClick={() => {
                  logout();
                  navigate("/");
                  setShowMyProfile(false);
                }}
              >
               Logout
              </p>
              </div>
)}
        </div>
      </div>
    
    </div>
  );
};

export default Navbar;
