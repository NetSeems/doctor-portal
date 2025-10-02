import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import {
  fetchUser,
  getAllAppointments,
  getDashboardStats,
  updateDoctorSchedule,
} from "../backend";
import Loading from "./Loading";
import "../Style/Dashboard.css";
import AppointmentCard from "./AppointmentCard";
import { useAuth } from "./UserContext.js";

const Dashboard = ({ handleShowComponent }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { currentDoctor, appointments, fetchData } = useAuth();
  const [todayAppointments, setTodayAppointment] = useState(0);
  const [totalAppointments, setTotalAppointment] = useState(0);
  const [todayCompletedAppointments, setTodayCompletedAppointment] =
    useState(0);
  const [todayCollection, setTodayCollection] = useState(0);

  const fetchStats = async () => {
    try {
      if (currentDoctor) {
        const res = await getDashboardStats(currentDoctor?.id);
        setTodayAppointment(res?.todayTotalAppointment);
        setTodayCollection(res?.todayCollection);
        setTodayCompletedAppointment(res?.todayCompleted);
        setTotalAppointment(res?.totalAppointments);
        console.log("Line 31",res)
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    updateDoctorSchedule();
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container1">
      <h1 className="dashboard-title2">Dashboard</h1>
      <div className="data-cards3">
        {[
          {
            label: "Today's Appointments",
            number: todayAppointments,
          },
          {
            label: "Today's Completed Appointments",
            number: todayCompletedAppointments,
          },
          { label: "Today Collection", number: `₹ ${todayCollection}` },
          { label: "Total Appointments", number: totalAppointments },
        ].map((value, index) => (
          <div
            key={index}
            className={`data-card4 ${
              index === 0 ? "bg-red-100" : "bg-green-100"
            }`}
          >
            <p className="data-label5">{value.label}</p>
            <p className="data-value6">{value.number}</p>
          </div>
        ))}
      </div>
      <div className="recent-orders13">
        <h2 className="orders-title14">Recent Appointments</h2>
        <AppointmentCard
          appointments={appointments}
          isDashboard={true}
          setRefreshKey={setRefreshKey}
          handleShowComponent={handleShowComponent}
        />
      </div>
    </div>
  );
};

export default Dashboard;
