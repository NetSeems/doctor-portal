import React, { useState, useEffect } from "react";
import "../Style/Appointment.css";
import { fetchUser, getAllOfflineAppointments } from "../backend";
import Loading from "./Loading";
import AppointmentCard from "./AppointmentCard";
import { useLocation } from "react-router-dom";
import { useAuth } from "./UserContext.js";
const OfflineAppointment = ({ refetch, setRefetch, setEditFormVisible,editFormVisible }) => {
  const location = useLocation();
  const {
    currentDoctor,
    refresh,
    setRefresh,
    fetchOfflineAppointment,
    setCurrentAppointmentPage,
    currentAppointmentPage,
    totalPages,
    totalOfflineAppopointment,
  } = useAuth();
  const [displayedAppointments, setDisplayedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [offlineAppointments, setOfflineAppointments] = useState([]);
  function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Use dashes instead of slashes
  }
  const setAppointment = async () => {
    try {
      const appointments = await fetchOfflineAppointment(currentAppointmentPage);
      if (appointments?.length > 0) {
        setDisplayedAppointments(appointments);
        setLoading(false);
        setOfflineAppointments(appointments);
      }
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setAppointment();
  }, [currentAppointmentPage]);
  useEffect(() => {
    fetchOfflineAppointment(currentAppointmentPage);
  }, [refetch]);

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);

    let filtered =
      status === "Select Status"
        ? offlineAppointments
        : offlineAppointments.filter((app) => app.appointmentStatus === status);

    setDisplayedAppointments(filtered);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (!term) {
      // Reset to filtered list based on selected status
      handleStatusChange({ target: { value: selectedStatus } });
      return;
    }

    const filtered = offlineAppointments.filter((app) =>
      app.appointmentId.toString().includes(term)
    );

    setDisplayedAppointments(filtered);
  };

  return (
    <div className="appointment-main-container">
      <div className="appointment-option-1" style={{ marginTop: "20px" }}>
        {/* <h1 className="dashboard-title2">Appointments</h1> */}
        <div>
          <input
            style={{ padding: "10px" }}
            placeholder="Search By Appointment Id"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <select onChange={handleStatusChange} value={selectedStatus}>
          <option>Select Status</option>
          <option>Booked</option>
          <option>Completed</option>
          <option>Expired</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="appointment-content-container">
          <AppointmentCard
            appointments={displayedAppointments}
            searchTerm={searchTerm} // Pass search term for highlighting
            isUser={true}
            isAppointment={true}
            isEdit={true}
            offline={true}
            setRefresh={setRefresh}
            refresh={refresh}
            setRefetch={setRefetch}
            fetchOfflineAppointment={fetchOfflineAppointment}
            totalPages={totalPages}
            setCurrentAppointmentPage={setCurrentAppointmentPage}
            currentAppointmentPage={currentAppointmentPage}
            setEditFormVisible={setEditFormVisible}
            editFormVisible={editFormVisible}
            totalOfflineAppopointment={totalOfflineAppopointment}
          />
        </div>
      )}
    </div>
  );
};

export default OfflineAppointment;
