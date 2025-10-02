import React, { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Loading from "./Loading";
import "../Style/Dashboard.css";
import AppointmentCard from "./AppointmentCard";
import {
  getAllOrdersByPharmacyEmail,
  getAllOrdersByPharmacyId,
  getStats,
} from "../backend";
import socket from "../socket.js";
import ShowAlert from "./ShowAlert.js";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [todaysCompletedOrders, setTodaysCompletedOrders] = useState([]);
  const [visible, setVisible] = useState(false);
  const [todayCollection, setTodayCollection] = useState(0);
  const [todayAdditionalFee, setTodayAdditionalFee] = useState(0);
  const fetchOrders = async () => {
    const pharmacyId = localStorage.getItem("pharmacyId");

    const orderData = await getAllOrdersByPharmacyId(pharmacyId);

    // Filter completed orders from today's orders

    setOrders(orderData);
  };
  const fetchStats = async () => {
    const pharmacyId = localStorage.getItem("pharmacyId");
    try {
      if (pharmacyId) {
        const res = await getStats(pharmacyId);
        setTodaysOrders(res?.todayOrder);
        setTodaysCompletedOrders(res?.todayCompletedOrder);
        setTodayCollection(res?.todayCollection);
        setTodayAdditionalFee(res?.todayAdditionalFee);
      }
    } catch (error) {
      console.log("Err", error);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newOrder", (order) => {
      //   audioRef.current = new Audio("/alert.mp3");
      //   audioRef.current.play().catch((err) => console.log("Play error:", err));
      setVisible(true);
      fetchOrders(); // or just append order to state
    });

    return () => {
      setVisible(false);
      socket.off("newOrder"); // cleanup
      socket.off("connect");
    };
  }, []);
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="dashboard-container1">
      {visible && (
        <ShowAlert
          setVisible={setVisible}
          visible={visible}
          fetchOrders={fetchOrders}
        />
      )}
      <h1 className="dashboard-title2">Dashboard</h1>
      <div className="data-cards3">
        {[
          {
            label: "Today's Orders",
            number: todaysOrders,
          },
          {
            label: "Today's Completed Orders",
            number: todaysCompletedOrders,
          },
          { label: "Total Orders", number: orders?.length ?? 0 },
          { label: "Today Collection", number: todayCollection },
          { label: "Today Additonal Fee", number: todayAdditionalFee },
          { label: "Total Collection", number: todayAdditionalFee+todayCollection },
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
        <h2 className="orders-title14">Recent Orders</h2>
        <AppointmentCard
          appointments={orders}
          isDashboard={true}
          // handleShowComponent={handleShowComponent}
        />
      </div>
    </div>
  );
};

export default Dashboard;
