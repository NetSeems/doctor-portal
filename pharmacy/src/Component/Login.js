import React, { useState, useEffect } from "react";
import "../Style/Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./UserContext.js";
import { getAllPharmacy, getPharmacyByEmail, sendOtp, validateOtp } from "../backend.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState("Select Pharmacy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [isEmailOtpValid, setIsEmailOtpValid] = useState(false);

  // Fetch all pharmacies
  useEffect(() => {
    const fetchPharmacy = async () => {
      const res = await getAllPharmacy();
    
      setPharmacies(res);
    };
    fetchPharmacy();
  }, []);

  // Auto-fill email when pharmacy is selected
  useEffect(() => {
    if (selectedPharmacy !== "Select Pharmacy") {
      const selected = pharmacies.find(
        (ph) => ph.pharmacyName === selectedPharmacy
      );
      setEmail(selected?.email || "");
    }
  }, [selectedPharmacy, pharmacies]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await getPharmacyByEmail(email);
      alert("Welcome " + result.pharmacyName);
      localStorage.setItem("pharmacyId", result.pharmacyId);
      login(result.email);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Login failed. Please check credentials.");
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please select a pharmacy!");
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
      alert("Please enter OTP!");
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
        <h2 style={{ color: "black" }}>Pharmacy Login</h2>

       
            <select
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
              required
            >
              <option value="Select Pharmacy">Select Pharmacy</option>
              {pharmacies.map((pharmacy, index) => (
                <option key={index} value={pharmacy.pharmacyName}>
                  {pharmacy.pharmacyName}
                </option>
              ))}
            </select>

        {/* Email Auto-filled */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          readOnly
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
              marginTop: "10px",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Enter OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              required
              disabled={isEmailOtpValid}
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

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginTop: "10px" }}
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
