import React, { createContext, useState, useContext, useEffect } from "react";
import { getPharmacyByEmail } from "../backend.js"; // Import the fetchUser method

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const UserContext = ({ children }) => {
  const [currentPharmacy, setCurrentPharmacy] = useState(null);

  const login = async (email) => {
    localStorage.setItem("pharmacyemail", email);
    try {
      const pharmacyData = await getPharmacyByEmail(email);
      setCurrentPharmacy(pharmacyData);
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("pharmacyemail");
    setCurrentPharmacy(null);
    alert("Logout successfull.", currentPharmacy.email);
  };

  // On app initialization, fetch user details
  useEffect(() => {
    const pharmacyEmail = localStorage.getItem("pharmacyemail");
    if (pharmacyEmail) {
      getPharmacyByEmail(pharmacyEmail)
        .then((pharmacyData) => {
          setCurrentPharmacy(pharmacyData);
        })
        .catch(() => logout());
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, logout, currentPharmacy, setCurrentPharmacy }}
    >
      {children}
    </AuthContext.Provider>
  );
};
