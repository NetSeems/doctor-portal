import React, { useState, useEffect } from "react";
import "../Style/Appointment.css";
import { fetchUser } from "../backend";
import Loading from "./Loading";
import AppointmentCard from "./AppointmentCard";
import { useLocation } from "react-router-dom";
import { useAuth } from "./UserContext.js";
const Appointment = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();
  const { currentDoctor, onlineAppointments, fetchData } = useAuth();
  // const [appointments, setAppointments] = useState([]);
  const [displayedAppointments, setDisplayedAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
  const [searchTerm, setSearchTerm] = useState("");

  let { index } = location.state || {};
  const batchSize = 5;

  useEffect(() => {
    if (!index) index = 0;
    fetchAppointments();
    fetchData();
  }, [refreshKey]);

  const fetchAppointments = async () => {
    try {
      setDisplayedAppointments(onlineAppointments.slice(index, index + 1));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleViewMore = () => {
    const currentLength = displayedAppointments.length;

    let filteredList =
      selectedStatus === "Select Status"
        ? onlineAppointments
        : onlineAppointments.filter(
            (app) => app.appointmentStatus === selectedStatus
          );

    if (currentLength >= filteredList.length) return;

    const newItems = filteredList.slice(
      currentLength,
      currentLength + batchSize
    );
    setDisplayedAppointments([...displayedAppointments, ...newItems]);
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);

    let filtered =
      status === "Select Status"
        ? onlineAppointments.slice(0, batchSize)
        :  onlineAppointments.filter((app) => app.appointmentStatus === status);

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

    const filtered =  onlineAppointments.filter((app) =>
      app.appointmentId.toString().includes(term)
    );

    setDisplayedAppointments(filtered);
  };

  return (
    <div className="appointment-main-container">
      <div className="appointment-option-1">
        <h1 className="dashboard-title2">Appointments</h1>
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
            setRefreshKey={setRefreshKey}
            refreshKey={refreshKey}
          />
        </div>
      )}

      {displayedAppointments.length > 0 &&
        displayedAppointments.length <
          (selectedStatus === "Select Status"
            ? onlineAppointments.length
            :  onlineAppointments.filter(
                (app) => app.appointmentStatus === selectedStatus
              ).length) && (
          <div className="view-usera-all">
            <button onClick={handleViewMore}>View More</button>
          </div>
        )}
    </div>
  );
};

export default Appointment;
