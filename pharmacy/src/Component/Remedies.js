// import React, { useState, useEffect } from "react";
// import "../Style/Remedies.css";
// import {
//   addRemedies,
//   updateRemedies,
//   getAllRemedies,
//   deleteRemedyById,
//   createRemediesOrder,
//   getRemediesOrder,
//   updateRemediesOrder,
// } from "../backend"; // Ensure correct import
// import { MdDelete } from "react-icons/md";
// import { BiEditAlt } from "react-icons/bi";

// const Remedies = () => {
//   const [selectedOption, setSelectedOption] = useState("view");
//   const [remedies, setRemedies] = useState([]);
//   const [remedyName, setRemedyName] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [editRemedyId, setEditRemedyId] = useState(null);
//   const [editRemedyName, setEditRemedyName] = useState("");
//   const [editQuantity, setEditQuantity] = useState("");
//   const [remediesOrder, setRemediesOrder] = useState([]);
//   const [editStatusRemedyId, setEditStatusRemedyId] = useState("");
//   const [editRemedyQuantity, setEditRemedyQuantity] = useState("");
//   const [editRemedyStatus, setEditRemedyStatus] = useState("Received");

//   // Fetch remedies on mount
//   useEffect(() => {
//     fetchRemedies();
//     fetchRemediesOrder();
//   }, []);
//   const fetchRemediesOrder = async () => {
//     const pharmacyEmail = localStorage.getItem("pharmacyemail");
//     const res = await getRemediesOrder(pharmacyEmail);
//     console.log("OrderRemedies", res);
//     if (res) {
//       setRemediesOrder(res);
//     }
//   };
//   const fetchRemedies = async () => {
//     const pharmacyEmail = localStorage.getItem("pharmacyemail");
//     try {
//       const response = await getAllRemedies(pharmacyEmail);
//       console.log("Res", response);
//       setRemedies(response.remedies || []);
//     } catch (error) {
//       console.error("Error fetching remedies:", error);
//     }
//   };

//   const handleEditClick = (remedy) => {
//     setEditRemedyId(remedy._id);
//     setEditRemedyName(remedy.remediesName);
//     setEditQuantity(remedy.quantity);
//     setSelectedOption("update");
//   };
//   const handleUpdateStatusRemedy = async (e) => {
//     e.preventDefault();
//     const pharmacyEmail = localStorage.getItem("pharmacyemail");
   
//     try {
//       const res = await updateRemediesOrder(pharmacyEmail, editStatusRemedyId, {
//         pharmacyStatus: editRemedyStatus,
//       });
      
//       if (res) {
//         fetchRemediesOrder();
//         setSelectedOption("order");
//       }
//     } catch (err) {
//       console.error("Failed to update status:", err);
//     }
//   };

//   const handleUpdateRemedy = async (event) => {
//     const pharmacyEmail = localStorage.getItem("pharmacyemail");
//     event.preventDefault();
//     let obj = {
//       pharmacyEmail,
//       remedyId: editRemedyId,
//       remedyName: editRemedyName,
//       quantity: editQuantity,
//     };
//     try {
//       const res = await createRemediesOrder(obj);
//       console.log("After Create", res);
//       setEditRemedyId(null);
//       fetchRemedies(); // Refresh list
//       setSelectedOption("view");
//     } catch (error) {
//       console.error("Error updating remedy:", error);
//     }
//   };

//   const formatDate = (isoString) => {
//     const date = new Date(isoString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   };
//   return (
//     <div className="doctor-main-container">
//       <table className="first-table-1">
//         <thead style={{ textAlign: "center" }}>
//           <tr className="first-table-tr">
//             {["view", "order"].map((option) => (
//               <td
//                 key={option}
//                 onClick={() => setSelectedOption(option)}
//                 style={{
//                   backgroundColor:
//                     selectedOption === option ? "var(--primary)" : "",
//                   padding: "10px",
//                   borderRadius: "10px",
//                   color: selectedOption === option ? "#fff" : "black",
//                   width: "30%",
//                   margin: "auto",
//                   fontSize: "18px",
//                   fontWeight: "bold",
//                   cursor: "pointer",
//                 }}
//               >
//                 {option.charAt(0).toUpperCase() + option.slice(1)} Remedies
//               </td>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="first-table-tr-content1">
//             <td colSpan="3">
//               {/* View Remedies */}
//               {selectedOption === "order" && (
//                 <div>
//                   {remediesOrder.length > 0 ? (
//                     <table
//                       className="orders-table15"
//                       style={{ cursor: "pointer" }}
//                     >
//                       <thead>
//                         <tr className="table-header16">
//                           <th>Date</th>
//                           <th>Remedies Name</th>
//                           <th>Quantity</th>
//                           <th>Pharmacy Status</th>
//                           <th>Admin Status</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {remediesOrder.map((remedy) => (
//                           <tr key={remedy._id} className="table-row18">
//                             <td>{formatDate(remedy.createdAt)}</td>
//                             <td>{remedy.remedyName}</td>
//                             <td>{remedy.quantity}</td>
//                             <td>{remedy.pharmacyStatus}</td>
//                             <td>{remedy.adminStatus}</td>
//                             <td className="action-btn">
//                               <button
//                                 style={{
//                                   fontSize: "20px",
//                                   fontWeight: "600",
//                                   cursor: "pointer",
//                                 }}
//                                 disabled={remedy.pharmacyStatus === "Received"}
//                                 title={
//                                   remedy.pharmacyStatus === "Received"
//                                     ? "This remedy is already status updated."
//                                     : "Click to update status"
//                                 }
//                                 onClick={() => {
//                                   setEditStatusRemedyId(remedy._id);

//                                   setEditRemedyStatus("Received");
//                                   setSelectedOption("updatestatus");
//                                 }}
//                               >
//                                 Update Status
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <p
//                       style={{
//                         textAlign: "center",
//                         color: "var(--primary)",
//                         fontSize: "20px",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       No Remedies Order Available.
//                     </p>
//                   )}
//                 </div>
//               )}
//               {selectedOption === "view" && (
//                 <div>
//                   {remedies.length > 0 ? (
//                     <table
//                       className="orders-table15"
//                       style={{ cursor: "pointer" }}
//                     >
//                       <thead>
//                         <tr className="table-header16">
//                           <th>Date</th>
//                           <th>Remedies Name</th>
//                           <th>Quantity</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {remedies.map((remedy) => (
//                           <tr key={remedy._id} className="table-row18">
//                             <td>{formatDate(remedy.createdAt)}</td>
//                             <td>{remedy.remediesName}</td>
//                             <td>{remedy.quantity}</td>
//                             <td className="action-btn">
//                               <button
//                                 style={{
//                                   fontSize: "20px",
//                                   fontWeight: "600",
//                                   cursor: "pointer",
//                                 }}
//                                 onClick={() => handleEditClick(remedy)}
//                               >
//                                 Create Order
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <p
//                       style={{
//                         textAlign: "center",
//                         color: "var(--primary)",
//                         fontSize: "20px",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       No Remedies Available.
//                     </p>
//                   )}
//                 </div>
//               )}

//               {/* Update Remedies (Shown when editing) */}
//               {selectedOption === "update" && editRemedyId && (
//                 <form
//                   onSubmit={handleUpdateRemedy}
//                   className="form-data-update"
//                 >
//                   <div>
//                     <input
//                       type="text"
//                       placeholder="Remedies ID"
//                       value={editRemedyId}
//                       disabled
//                     />
//                   </div>
//                   <div>
//                     <input
//                       type="text"
//                       placeholder="New Remedies Name"
//                       value={editRemedyName}
//                       onChange={(e) => setEditRemedyName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <input
//                       type="text"
//                       placeholder="New Quantity"
//                       value={editQuantity}
//                       onChange={(e) => setEditQuantity(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <button type="submit" className="form-data-btn">
//                     Create Remedies Order
//                   </button>
//                 </form>
//               )}

//               {selectedOption === "updatestatus" && (
//                 <form
//                   onSubmit={handleUpdateStatusRemedy}
//                   className="form-data-update"
//                 >
//                   <div>
//                     <input
//                       type="text"
//                       placeholder="Remedies ID"
//                       value={editStatusRemedyId}
//                       disabled
//                     />
//                   </div>
//                   <div>
//                     <input
//                       type="text"
//                       placeholder="New Quantity"
//                       value={editQuantity}
//                       onChange={(e) => setEditQuantity(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <select
//                       style={{ width: "89%" }}
//                       value={editRemedyStatus}
//                       onChange={(e) => setEditRemedyStatus(e.target.value)}
//                     >
//                       <option value="Received">Received</option>
//                       {/* Add more statuses if needed */}
//                     </select>
//                   </div>
//                   <button type="submit" className="form-data-btn">
//                     Update Order Status
//                   </button>
//                 </form>
//               )}
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Remedies;
