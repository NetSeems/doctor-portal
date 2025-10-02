import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BiEditAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./UserContext.js"; // Importing useAuth for currentPharmacy

const AppointmentCard = ({ appointments, isDashboard, isUser }) => {
  const { currentPharmacy } = useAuth();
  const navigate = useNavigate();
  const [editFormVisible, setEditFormVisible] = useState({});
  const [remedies, setRemedies] = useState({});
  const [totals, setTotals] = useState({});
  const handleEditClick = (index) => {
    setEditFormVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addRemedy = (index) => {
    if (!remedies[index]) remedies[index] = [];
    remedies[index].push({
      name: "",
      quantity: 0,
      price: 0,
    });
    setRemedies({ ...remedies });
  };

  const updateRemedy = (index, remedyIndex, field, value) => {
    remedies[index][remedyIndex][field] =
      field === "quantity" || field === "price" ? parseFloat(value) : value;

    // Update total price
    const totalPrice = remedies[index].reduce(
      (sum, remedy) => sum + remedy.quantity * remedy.price,
      0
    );
    setTotals((prev) => ({ ...prev, [index]: totalPrice }));
    setRemedies({ ...remedies });
  };



  return (
    <div>
      <table className="orders-table15" style={{ cursor: "pointer" }}>
        <thead>
          <tr className="table-header16">
            <th>Order Id</th>
            <th>Date</th>
            <th>Patient Name</th>
            <th>Doctor Id</th>
            <th>Order Status</th>
            {!isDashboard && <th>Remedies</th>}
            {!isDashboard && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {appointments?.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  color: "var(--primary)",
                  paddingTop: "20px",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {!isUser && "No Orders Available"}
              </td>
            </tr>
          ) : (
            appointments?.map((appointment, index) => (
              <React.Fragment key={index}>
                <tr
                  className="table-row18"
                  onClick={() => {
                    if (appointment.orderStatus !== "Completed") {
                      const state = !isUser
                        ? { index }
                        : {
                            pharmacyid: currentPharmacy?.pharmacyId,
                            orderid: appointment.appointmentId,
                          };
                      navigate("/pending", { state });
                    } else{
                      alert("This order is completed.")
                    }
                  }}
                >
                  <td>{appointment?.orderId}</td>
                  <td>
                 { new Date(appointment?.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {appointment?.appointment?.firstName +
                      " " +
                      appointment?.appointment?.lastName || "N/A"}
                  </td>
                  <td>{appointment?.appointment?.doctorId}</td>
                  <td>{appointment?.orderStatus}</td>
                  {!isDashboard && (
                    <td className="action-btn">
                      <BiEditAlt onClick={() => handleEditClick(index)} />
                      <FaEye />
                      <MdDelete />
                    </td>
                  )}
                </tr>

                {/* Editable Form */}
                {editFormVisible[index] && (
                  <>
                    {/* Display added remedies */}
                    {remedies[index]?.map((remedy, remedyIndex) => (
                      <tr key={remedyIndex}>
                        <td colSpan="5">
                          Remedy: {remedy.name}, Quantity: {remedy.quantity},
                          Price: ₹{remedy.price}
                        </td>
                      </tr>
                    ))}

                    {/* Add new remedy form */}
                    <tr>
                      <td colSpan="5">
                        {remedies[index]?.map((remedy, remedyIndex) => (
                          <div
                            key={remedyIndex}
                            style={{ marginBottom: "10px" }}
                          >
                            Remedy Name:
                            <input
                              type="text"
                              value={remedy.name}
                              onChange={(e) =>
                                updateRemedy(
                                  index,
                                  remedyIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                            Quantity:
                            <input
                              type="number"
                              value={remedy.quantity}
                              onChange={(e) =>
                                updateRemedy(
                                  index,
                                  remedyIndex,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                            Price:
                            <input
                              type="number"
                              value={remedy.price}
                              onChange={(e) =>
                                updateRemedy(
                                  index,
                                  remedyIndex,
                                  "price",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                        {/* Add new remedy button */}
                        <button onClick={() => addRemedy(index)}>
                          + Add Remedy
                        </button>

                        {/* Total Price */}
                        {totals[index] !== undefined && (
                          <div style={{ marginTop: "10px" }}>
                            Total Price: ₹{totals[index]}
                          </div>
                        )}

                        {/* Pay Now Button */}
                        {totals[index] > 0 && (
                          <button
                            style={{
                              marginTop: "10px",
                              backgroundColor: "#4caf50",
                              color: "#fff",
                              padding: "10px",
                              borderRadius: "5px",
                            }}
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentCard;
