import React, { useState, useEffect, useRef } from "react";
import "../Style/Orders.css";
import { getAllCompletedOrdersByPharmacyEmail } from "../backend";
import Loading from "./Loading";
import { IoEye } from "react-icons/io5";
import { useAuth } from "./UserContext.js";
import socket from "../socket.js";
import ShowAlert from "./ShowAlert.js";

const CompletedOrders = () => {
  const { currentPharmacy } = useAuth();
  const [visible, setVisible] = useState(false);
  const audioRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showRemediesPopup, setShowRemediesPopup] = useState(false);
  const [selectedRemedies, setSelectedRemedies] = useState([]);
  const [selectAppointmnent, setSelectedAppointment] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const fetchOrders = async () => {
    const pharmacyId = localStorage.getItem("pharmacyId");
    try {
      const response = await getAllCompletedOrdersByPharmacyEmail(
        pharmacyId,
        currentPage
      );
      console.log("fsd", response);
      setDisplayedOrders(response.data);
      setOrders(response.data);
      setCurrentPage(response.currentPage);
      setTotalPage(response.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching completed orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleShowRemedies = (remedies, appointment) => {
    setSelectedRemedies(remedies);
    setSelectedAppointment(appointment);
    setShowRemediesPopup(true);
  };
  const handleNext = () => setCurrentPage((prev) => prev + 1);
  const handlePrev = () => setCurrentPage((prev) => Math.max(1, prev - 1));

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newOrder", (order) => {
      // audioRef.current = new Audio("/alert.mp3");
      // audioRef.current.play().catch((err) => console.log("Play error:", err));
      setVisible(true);
      fetchOrders(); // or just append order to state
    });

    return () => {
      setVisible(false);
      socket.off("newOrder"); // cleanup
      socket.off("connect");
    };
  }, []);

  return (
    <div className="appointment-main-container">
      <h1 className="dashboard-title2">Completed Orders</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className="appointment-content-container">
          {visible && <ShowAlert setVisible={setVisible} />}
          <table className="orders-table15" style={{ cursor: "pointer" }}>
            <thead>
              <tr className="table-header16">
                <th>Order Id</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Doctor Id</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders?.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      paddingTop: "20px",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    No Completed Orders Available
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="table-row18">
                      <td>{order.orderId}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        {order?.firstName + " " + order?.lastName || "N/A"}
                      </td>
                      <td>{order?.doctorName}</td>
                      <td>{order?.doctorId}</td>
                      <td>{order.orderStatus}</td>
                      <td className="action-btn">
                        <IoEye
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleExpandOrder(order.orderId)}
                        />
                      </td>
                    </tr>
                    {expandedOrder === order.orderId && (
                      <tr>
                        <td colSpan="8">
                          <table className="orders-table15">
                            <thead>
                              <tr className="table-header16">
                                <th>Appointment ID</th>
                                <th>Phone Number</th>
                                <th>Payment Status</th>
                                {order.additionalFee>0 && <th>Additional Fee</th>}
                                <th>Payment Mode</th>
                                <th>Total Price</th>
                                <th>Remedies Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="table-row18">
                                <td>{order.appointmentId}</td>
                                <td>{order?.phoneNumber || "N/A"}</td>
                                <td>{order.paymentStatus}</td>
                               {order.additionalFee>0 && <td>₹{order.additionalFee}</td>}
                                <td>{order.paymentMode}</td>
                                <td>₹{order.totalPrice}</td>
                                <td>
                                  <button
                                    className="show-all-remedies-btn"
                                    onClick={() =>
                                      handleShowRemedies(
                                        order?.medicines?.remedies || [],
                                        order?.medicines
                                      )
                                    }
                                  >
                                    Show All Remedies
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
              {totalPage > 1 && (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    <button onClick={handlePrev} disabled={currentPage === 1}>
                      Prev
                    </button>
                    <span style={{ margin: "0 10px" }}>{currentPage}</span>
                    <button
                      disabled={currentPage >= totalPage} // disable when no more data
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showRemediesPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Remedies Details</h2>
            <ol>
              {selectedRemedies.length > 0 ? (
                selectedRemedies.map((remedy, index) => (
                  <li key={index}>
                    <strong>Name: </strong> {remedy.medicineName} |{" "}
                    <strong>Potency: </strong> {remedy.potency}{" "}
                    <strong>Dosage: </strong> {remedy.dosage}{" "}
                    <strong>Repetition: </strong> {remedy.frequency}{" "}
                    <strong>Quantity: </strong>{" "}
                    {remedy.quantity + " " + remedy.unit} |{" "}
                    <strong>Price: </strong> ₹{remedy.price} |{" "}
                    <strong>Total Price: </strong> ₹
                    {remedy.price * remedy.quantity}{" "}
                  </li>
                ))
              ) : (
                <p>No remedies available</p>
              )}
              <p style={{ margin: "0px" }}>
                <strong>Complain: </strong>
                {selectAppointmnent.complain}
              </p>
              <p style={{ margin: "0px" }}>
                <strong>Duration: </strong>
                {selectAppointmnent.duration}
              </p>
              <p style={{ margin: "0px" }}>
                <strong>Pharmacy Name: </strong>
                {selectAppointmnent.pharmacyName}
              </p>
            </ol>
            <button onClick={() => setShowRemediesPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedOrders;
