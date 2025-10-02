import React, { useState, useEffect, useRef } from "react";
import "../Style/Orders.css";
import {
  getAllPendingOrdersByPharmacyId,
  getAllRemedies,
  getOption,
  updateOrder,
} from "../backend";
import Loading from "./Loading";
import { useLocation } from "react-router-dom";
import { BiEditAlt } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "./UserContext.js";
import socket from "../socket.js";
import ShowAlert from "./ShowAlert.js";

const PendingOrders = () => {
  const { currentPharmacy } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [remedies, setRemedies] = useState([]);
  const [remedy, setRemedy] = useState({ price: "", quantity: "" });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Select Payment Method");
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [remediesId, setRemediesId] = useState("");
  const [unitName, setUnitDrop] = useState("Select Unit");
  const [selectedOrder, setSelectedOrder] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [unit, setUnit] = useState([]);
  const [orderIndex, setOrderIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [visible, setVisible] = useState(false);
  const [additionalFee, setAdditionalFee] = useState(0);
  const audioRef = useRef(null);
  const [alertCount, setAlertCount] = useState(0);
  let { index } = location.state || {};
  const isEditOpenRef = useRef(false);
  useEffect(() => {
    isEditOpenRef.current = editingOrder !== null;
  }, [editingOrder]);
  // useEffect(() => {

  //   socket.on("connect", () => {
  //     console.log("Connected to socket server");
  //   });

  //   socket.on("newOrder", (order) => {
  //     if (!isEditOpenRef.current) {
  //       fetchOrders();
  //       setVisible(true);
  //       setAlertCount((prev) => prev + 1);
  //       if (audioRef.current) {
  //         audioRef.current.play().catch((err) => {
  //           console.log("Audio play blocked:", err);
  //         });
  //       }
  //     } else {
  //       setVisible(true);
  //       setAlertCount((prev) => prev + 1);
  //       if (audioRef.current) {
  //         audioRef.current.play().catch((err) => {
  //           console.log("Audio play blocked:", err);
  //         });
  //       }
  //     }
  //   });

  //   return () => {
  //     setVisible(false);
  //     setAlertCount(0);
  //     socket.off("newOrder"); // cleanup
  //     socket.off("connect");
  //   };
  // }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newOrder", (order) => {
      setVisible(true);
      setAlertCount((prev) => prev + 1);

      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Audio play blocked:", err);
        });
      }

      // ✅ only refresh if not in edit mode
      if (!isEditOpenRef.current) {
        fetchOrders();
      }
    });

    return () => {
      setVisible(false);
      setAlertCount(0);
      socket.off("newOrder");
      socket.off("connect");
    };
  }, []);

  const fetchOrders = async () => {
    const pharmacyId = localStorage.getItem("pharmacyId");
    try {
      const response = await getAllPendingOrdersByPharmacyId(
        pharmacyId,
        currentPage
      );
      setLoading(false);
      setOrders(response.data);
      setDisplayedOrders(response.data);
      setTotalPage(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!index) {
      index = 0;
    }
    fetchOrders();
    fetchOptions();
  }, []);

  const closeThePopup = () => {
    setShowPaymentPopup(false);
  };

  const closeThePopupFirst = () => {
    setShowTransactionPopup(false);
    setShowPaymentPopup(true);
  };

  const handleEditClick = (order, index) => {
    setEditingOrder(editingOrder === index ? null : index);
    setSelectedOrder(order);
    setRemedies([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRemedy((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRemedy = () => {
    if (!remediesId || !remedy.price || !remedy.quantity) {
      alert("Please select a remedy and enter both price and quantity.");
      return;
    }
    const selectedRemedy = selectedOrder.medicines.remedies.find(
      (r) => r.remediesId === Number(remediesId)
    );

    if (!selectedRemedy) {
      alert("Selected remedy not found.");
      return;
    }

    setRemedies([
      ...remedies,
      {
        remediesId: selectedRemedy.remediesId,
        medicineName: selectedRemedy.medicineName,
        potency: selectedRemedy.potency,
        dosage: selectedRemedy.dosage,
        frequency: selectedRemedy.frequency,
        price: Number(remedy.price),
        quantity: Number(remedy.quantity),
        unit: unitName,
      },
    ]);

    setRemedy({ price: "", quantity: "" });
    setRemediesId("");
    setUnitDrop("Select Unit");
  };

  const calculateTotalPrice = () => {
    return remedies.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handlePayNow = () => {
    if (remedies?.length !== selectedOrder.medicines.remedies.length) {
      alert("You have not added all remedies.");
      return;
    }
    setShowPaymentPopup(true);
  };

  const handleProceedPayment = async () => {
    let obj = {
      pharmacyId: currentPharmacy.pharmacyId,
      remedies: remedies,
      totalPrice: calculateTotalPrice(),
      appointmentOrderId: selectedOrder.orderId,
      appointmentId: selectedOrder.appointmentId,
      paymentMode: paymentMethod,
      additionalFee,
    };

    try {
      const updatedOrder = await updateOrder(obj);
      if (updatedOrder) {
        fetchOrders();
        setShowPaymentPopup(false);
        setEditingOrder(null);
        alert("Order Completed Successfully.");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleSubmitPayment = async () => {
    if (!transactionId || !imageUrl) {
      alert("Please enter transaction ID and upload proof.");
      return;
    }

    let obj = {
      pharmacyId: currentPharmacy.id,
      remedies: remedies,
      totalPrice: calculateTotalPrice(),
      appointmentOrderId: selectedOrder.id,
      appointmentId: selectedOrder.appointmentId,
      paymentMode: paymentMethod,
      orderPaymentId: transactionId,
      orderPaymentImageUrl: imageUrl,
    };

    try {
      const updatedOrder = await updateOrder(obj);
      if (updatedOrder) {
        fetchOrders();
        setShowTransactionPopup(false);
        setEditingOrder(null);
        alert("Order Completed Successfully.");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filtered = orders.filter((app) =>
      app.orderId.toString().includes(term)
    );
    setDisplayedOrders(filtered);
  };

  const fetchOptions = async () => {
    const res = await getOption();
    if (res) {
      setUnit(res[0]?.unit);
    }
  };

  const handleNext = () => setCurrentPage((prev) => prev + 1);
  const handlePrev = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  useEffect(() => {
    socket.on("appointmentUpdate", (updatedOrder) => {
      setDisplayedOrders((prev) => {
        if (editingOrder !== null) {
          return prev.map((order, idx) =>
            idx === editingOrder
              ? {
                  ...order,
                  medicines: {
                    ...order.medicines,
                    remedies: updatedOrder,
                  },
                }
              : order
          );
        }
        return prev;
      });

      // also update selectedOrder if editing
      if (editingOrder !== null) {
        setSelectedOrder((prev) => ({
          ...prev,
          medicines: {
            ...prev.medicines,
            remedies: updatedOrder,
          },
        }));
      }
    });

    return () => socket.off("appointmentUpdate");
  }, []);
  const handleCloseAlerts = () => {
    setVisible(false);
    setAlertCount(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  return (
    <div className="appointment-main-container">
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />
      {visible && alertCount > 0 && (
        <ShowAlert setVisible={handleCloseAlerts} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1 className="dashboard-title2">Orders</h1>
        <div>
          <input
            style={{ padding: "10px" }}
            placeholder="Search By Order Id"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="appointment-content-container">
          <table className="orders-table15" style={{ cursor: "pointer" }}>
            <thead>
              <tr className="table-header16">
                <th>Patient Id</th>
                <th>Appt. Id</th>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Doctor Id</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders?.length === 0 ? (
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
                    No Orders Available
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order, index) => {
                  const availableRemedies = order.medicines.remedies.filter(
                    (med) =>
                      !remedies.some((r) => r.remediesId === med.remediesId)
                  );

                  return (
                    <React.Fragment key={index}>
                      <tr className="table-row18">
                        <td>{order.userId}</td>
                        <td>{order.appointmentId}</td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td>
                          {order.firstName + " " + order.lastName || "N/A"}
                        </td>
                        <td>{order.doctorName}</td>
                        <td>{order.doctorId}</td>

                        <td>{order.orderStatus}</td>
                        <td className="action-btn">
                          <BiEditAlt
                            onClick={() => {
                              setOrderIndex(index);
                              handleEditClick(order, index);
                            }}
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                      </tr>
                      {editingOrder === index && (
                        <tr>
                          <td colSpan="9">
                            <div className="show-all-remedies-div">
                              <table
                                border="1"
                                cellPadding="3"
                                style={{ width: "100%" }}
                                cellSpacing="0"
                              >
                                <thead>
                                  <tr>
                                    <td>
                                      <strong>Remedies Name</strong>
                                    </td>
                                    <td>
                                      <strong>Potency</strong>
                                    </td>
                                    <td>
                                      <strong>Dosage</strong>
                                    </td>
                                    <td>
                                      <strong>Repetition</strong>
                                    </td>
                                    <td>
                                      <strong>Duration</strong>
                                    </td>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order?.medicines?.remedies?.map((rem) => (
                                    <tr key={rem.remediesId}>
                                      <td>{rem.medicineName}</td>
                                      <td>{rem.potency}</td>
                                      <td>{rem.dosage}</td>
                                      <td>{rem.frequency}</td>
                                      <td>{order.medicines.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <h3>Added Remedies</h3>
                            {remedies.length > 0 && (
                              <ul className="show-added-remedies">
                                {remedies.map((item, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    {item.medicineName} ({item.potency}) - ₹
                                    {item.price} x{" "}
                                    {item.quantity + " " + item.unit} = ₹
                                    {(item.price * item.quantity).toFixed(2)}
                                    {/* Remove Button */}
                                    <button
                                      style={{
                                        marginLeft: "10px",
                                        background: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        padding: "2px 8px",
                                      }}
                                      onClick={() => {
                                        const updated = remedies.filter(
                                          (_, idx) => idx !== i
                                        );
                                        setRemedies(updated);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                {/* <h2
                                  style={{ color: "black", marginTop: "-5px" }}
                                >
                                  Fee Instruction:
                                </h2> */}
                                <h4>
                                  {order.feeInstruction
                                    ? `Surcharge.: ${order.feeInstruction}`
                                    : "Surcharge N/A."}
                                </h4>
                              </div>
                              <h4>
                                Sub Total Price: ₹
                                {Math.ceil(calculateTotalPrice())}
                              </h4>

                              <h4>
                                Total Price:- ₹
                                {Math.ceil(calculateTotalPrice()) +
                                  Number(order.feeInstruction)}
                              </h4>
                            </div>
                            {/* Remedy Selection */}
                            <div
                              className="added-div-reme-1"
                              style={{ marginTop: "10px" }}
                            >
                              <select
                                value={remediesId}
                                onChange={(e) => setRemediesId(e.target.value)}
                                style={{
                                  width: "60%",
                                  borderRadius: "10px",
                                  fontSize: "20px",
                                  padding: "0px 10px",
                                }}
                              >
                                <option value="">Select Remedy</option>
                                {availableRemedies.map((med) => (
                                  <option
                                    key={med.remediesId}
                                    value={med.remediesId}
                                    style={{ fontSize: "20px" }}
                                  >
                                    {med.medicineName} - {med.potency}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                name="price"
                                placeholder="Price"
                                value={remedy.price}
                                onChange={handleInputChange}
                              />

                              <input
                                type="number"
                                name="quantity"
                                placeholder="Quantity"
                                value={remedy.quantity}
                                onChange={handleInputChange}
                              />

                              {/* Unit dropdown */}
                              <select
                                value={unitName}
                                onChange={(e) => setUnitDrop(e.target.value)}
                                style={{
                                  width: "20%",
                                  borderRadius: "10px",
                                  padding: "0px 10px",
                                }}
                              >
                                <option>Select Unit</option>
                                {unit.map((u, idx) => (
                                  <option key={idx} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                              {/* <input
                                type="text"
                                name="addtionalFee"
                                placeholder="Additional Fee"
                                onChange={(e) =>
                                  setAdditionalFee(e.target.value)
                                }
                              /> */}
                              <button
                                onClick={() => {
                                  handleAddRemedy();
                                  setAdditionalFee(
                                    Number(order?.feeInstruction)
                                  );
                                }}
                                className="view-orderbtn-1"
                              >
                                Add Remedy
                              </button>
                            </div>

                            <button
                              onClick={handlePayNow}
                              className="view-orderbtn-1"
                              style={{ marginTop: "20px" }}
                            >
                              Pay Now
                            </button>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
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

      {showPaymentPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div
              style={{
                textAlign: "left",
                fontSize: "24px",
                cursor: "pointer",
              }}
              onClick={closeThePopup}
            >
              <IoArrowBack />
            </div>
            <h2>Select Payment Method</h2>
            <button
              onClick={() => setPaymentMethod("Card")}
              className={paymentMethod === "Card" ? "active" : ""}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod("UPI")}
              className={paymentMethod === "UPI" ? "active" : ""}
            >
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod("Cash")}
              className={paymentMethod === "Cash" ? "active" : ""}
            >
              Cash
            </button>
            <button
              onClick={handleProceedPayment}
              className="view-orderbtn-1"
              style={{
                width: "20%",
                margin: "auto",
                backgroundColor:
                  paymentMethod !== "Select Payment Method"
                    ? "var(--primary)"
                    : "#ccc", // green if selected, gray if not
                color: "#fff",
                cursor:
                  paymentMethod !== "Select Payment Method"
                    ? "pointer"
                    : "not-allowed",
              }}
              disabled={paymentMethod === "Select Payment Method"}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showTransactionPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div
              style={{
                textAlign: "left",
                fontSize: "24px",
                cursor: "pointer",
              }}
              onClick={closeThePopupFirst}
            >
              <IoArrowBack />
            </div>
            <h2>Enter Transaction Details</h2>
            <input
              type="text"
              placeholder="Transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <input type="file" onChange={handleFileUpload} />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded Proof"
                style={{ width: "100px", height: "100px" }}
              />
            )}
            <button onClick={handleSubmitPayment} className="view-orderbtn-1">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
