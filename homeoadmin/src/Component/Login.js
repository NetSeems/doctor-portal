import React, { useState, useEffect } from "react";
import "../Style/Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./UserContext.js";
import { RiArrowDropDownLine } from "react-icons/ri";
import { getDoctor, getAllDoctor, sendOtp, validateOtp } from "../backend.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("Select Doctor");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Select Location");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totalDoctor, setTotalDoctor] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [isEmailOtpValid, setIsEmailOtpValid] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const fetchLocationDoctor = () => {
    setSelectedDoctor("Select Doctor");
    const filtered = doctors.filter((doc) =>
      doc.locations.some((loc) => loc.trim() === selectedLocation.trim())
    );
    setFilteredDoctors(filtered);
  };
  useEffect(() => {
    if (selectedLocation && selectedLocation !== "Select Location") {
      fetchLocationDoctor();
    } else {
      setFilteredDoctors(doctors); // Show all if nothing is selected
    }
  }, [selectedLocation, doctors]);
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          type="button"
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 border rounded ${
            currentPage === i ? "bg-blue-500 text-white" : ""
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };
  const fetchDoctor = async () => {
    const res = await getAllDoctor(currentPage);
    const uniqueLocations = [
      ...new Set(
        res?.doctors.flatMap((doctor) =>
          doctor.locations.map((location) => location.trim())
        )
      ),
    ];
    setLocations(uniqueLocations);
    setCurrentPage(res.currentPage);
    setTotalDoctor(res.totalDoctors);
    setTotalPages(res.totalPages);
    setDoctors(res.doctors);
  };
  useEffect(() => {
    fetchDoctor(currentPage);
  }, [currentPage]);
  useEffect(() => {
    fetchDoctor();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!isEmailOtpValid) {
    //   alert("Please validate OTP first.");
    //   return;
    // }

    const doctorData = {
      email,
      password,
    };
    try {
      const result = await getDoctor(doctorData);
      localStorage.setItem("doctorlocationoffline", selectedLocation);
      alert("Welcome" + " " + result.doctor.name + " " + "Ji");
      login(result.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter email!");
      return;
    }
    setIsLoadingOtp(true);
    try {
      const response = await sendOtp(email);
      if (response) {
        setEmailOtpSent(true);
        alert("OTP sent to your email.");
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending email OTP", error);
      alert("An error occurred while sending the OTP.");
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const handleValidateOtp = async () => {
    if (!email || !emailOtp) {
      alert("Please enter email and OTP!");
      return;
    }
    setIsLoadingOtp(true);
    try {
      const response = await validateOtp(email, emailOtp);
      if (response) {
        setIsEmailOtpValid(true);
        alert("Email OTP validated successfully.");
      } else {
        alert("Invalid email OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error validating email OTP", error);
      alert("An error occurred while validating the OTP.");
    } finally {
      setIsLoadingOtp(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2 style={{ color: "black" }}>Login</h2>
        <div className="select-location-1">
          <div
            className="select-location"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <p style={{ margin: "0px" }}>{selectedLocation}</p>
            <RiArrowDropDownLine size={30} />
          </div>
          {showLocationDropdown && (
            <ul className="dropdown-menu-22">
              {locations.map((location, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelectedLocation(location);
                    setShowLocationDropdown(false);
                  }}
                >
                  {location}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Select Doctor */}
        <div className="select-location-1" style={{ marginTop: "20px" }}>
          <div
            className="select-location"
            onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
          >
            <p style={{ margin: "0px" }}>{selectedDoctor}</p>
            <RiArrowDropDownLine size={30} />
          </div>
          {showDoctorDropdown && (
            <ul className="dropdown-menu-22">
              {filteredDoctors.map((doctor, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setSelectedDoctor(doctor.name);
                    setShowDoctorDropdown(false);
                    setEmail(doctor.email);
                  }}
                >
                  {doctor.email}
                </li>
              ))}
              {totalDoctor > 10 && (
                <div>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  {renderPageNumbers()}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </ul>
          )}
        </div>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* OTP Section */}
        {!emailOtpSent && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoadingOtp}
            style={{ marginTop: "10px" }}
          >
            {isLoadingOtp ? "Sending OTP..." : "Send OTP"}
          </button>
        )}

        {emailOtpSent && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "94%",
              margin: "auto",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Enter OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              required
              disabled={isEmailOtpValid} // Disable input after successful OTP validation
            />
            {!isEmailOtpValid && (
              <button
                type="button"
                onClick={handleValidateOtp}
                disabled={isLoadingOtp}
              >
                {isLoadingOtp ? "Validating..." : "Validate OTP"}
              </button>
            )}
          </div>
        )}

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginTop: "10px" }}
        />

        {/* Submit Button */}
        <button type="submit" style={{ marginTop: "10px" }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
