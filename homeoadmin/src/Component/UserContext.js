import React, { createContext, useState, useContext, useEffect } from "react";
import {
  fetchDoctorDetails,
  getAllAppointments,
  getAllOfflineAppointments,
  getAllOfflineUsersByDoctorId,
  getOption,
  getUserNextAppointments,
} from "../backend.js"; // Import the fetchUser method
import socket from "../socket.js";
// Create Auth Context
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider Component
export const UserContext = ({ children }) => {
  const [refresh, setRefresh] = useState(1);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [totalOfflineAppointments, setTotalOfflineAppointments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentAppointmentPage, setCurrentAppointmentPage] = useState(1);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [editFormVisible, setEditFormVisible] = useState({});
  const [frequency, setFrequency] = useState([]);
  const [potency, setPotency] = useState([]);
  const [days, setDays] = useState([]);
  const [dosage, setDosage] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [todayCompletedAppointments, setTodayCompletedAppointments] =
    useState(0);
  const [users, setUsers] = useState([]);
  const [currentPatientPage, setCurrentPatientPage] = useState(1);
  const [totalPatientPage, setTotalPatientPage] = useState(1);
  function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Use dashes instead of slashes
  }
  const fetchData = async () => {
    // try {
    //   const appointmentsResponse = await getAllAppointments(
    //     currentDoctor?.id
    //   );
    //   const appointmentsData = appointmentsResponse.appointments || [];
    //       console.log("Appon use cobtr",appointmentsResponse)
    // } catch (error) {
    //   console.error("Error fetching data:", error);
    // }
  };


  const fetchOfflineAppointment = async (currentAppointmentPage) => {
    try {
      const appointmentsResponse = await getAllOfflineAppointments(
        currentDoctor?.id,
        currentAppointmentPage
      );
      setAppointments(appointmentsResponse?.appointments);
      setCurrentAppointmentPage(appointmentsResponse?.pagination?.page);
      setTotalOfflineAppointments(appointmentsResponse?.pagination?.total);
      setTotalPages(appointmentsResponse?.pagination?.totalPages);
      return appointmentsResponse?.appointments;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchOfflinePatient = async (currentPatientPage) => {
    try {
      const patientResponse = await getAllOfflineUsersByDoctorId(
        currentDoctor?.id,
        currentPatientPage
      );
      console.log("patient with appoi", patientResponse);
      setUsers(patientResponse?.data);
      setCurrentPatientPage(patientResponse?.page);
      setTotalPatientPage(patientResponse?.totalPages);
      // setTotalPages(appointmentsResponse?.pagination?.totalPages);
      return patientResponse?.data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const login = async (token) => {
    localStorage.setItem("doctortoken", token);
    try {
      const doctorData = await fetchDoctorDetails();
      setCurrentDoctor(doctorData);
    } catch (error) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("doctortoken");
    setCurrentDoctor(null);
    alert("Logout successfull.");
  };
  const fetchOptions = async () => {
    const res = await getOption();
    if (res) {
      setPotency(res[0]?.potency);
      setDosage(res[0]?.dosage);
      setFrequency(res[0]?.repetition);
      setDays(res[0]?.days);
    }
  };
  useEffect(() => {
    fetchOfflineAppointment(currentAppointmentPage);
  }, [currentAppointmentPage]);
  useEffect(() => {
    fetchOfflinePatient(currentPatientPage);
  }, [currentPatientPage]);
  // On app initialization, fetch user details
  useEffect(() => {
    const token = localStorage.getItem("doctortoken");
    if (token) {
      fetchOptions();
      fetchDoctorDetails()
        .then((doctorData) => {
          setCurrentDoctor(doctorData);
        })
        .catch(() => logout());
    }
  }, []);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newOrder", (order) => {
      fetchOptions();
      fetchData(); // or just append order to state // or just append order to state
    });

    return () => {
      socket.off("newOrder"); // cleanup
      socket.off("connect");
    };
  }, [currentDoctor]);
  useEffect(() => {
    if (currentDoctor) {
      fetchData();
      fetchOfflineAppointment(currentAppointmentPage);
      fetchOfflinePatient(currentPatientPage);
      // Run fetchData only when currentDoctor is set
    }
  }, [currentDoctor, refresh]);
  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        frequency,
        dosage,
        days,
        potency,
        fetchOptions,
        currentDoctor,
        setCurrentDoctor,
        appointments,
        todayAppointments,
        todayCompletedAppointments,
        totalAppointments,
        totalOfflineAppointments,
        currentAppointmentPage,
        setCurrentAppointmentPage,
        fetchOfflineAppointment,
        totalPages,
        fetchData,
        refresh,
        setRefresh,
        users,
        currentPatientPage,
        setUsers,
        fetchOfflinePatient,
        setCurrentPatientPage,
        totalPatientPage,
        onlineAppointments,
        editFormVisible,
        setEditFormVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
