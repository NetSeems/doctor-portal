import React, { useEffect, useState, useRef } from "react";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BiEditAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import {
  addMedicinesDetails,
  addOfflineMedicinesDetails,
  addOrderToPharmacy,
  deleteAppointment,
  getAllPharmacy,
  getAllRemedies,
  getOption,
  registerFeeNotification,
  updateAppointment,
  updateAppointmentMedicines,
  updateOfflineAppointment,
} from "../backend";
import socket from "../socket.js";
import { MdKeyboardArrowDown } from "react-icons/md";

const AppointmentCard = ({
  appointments,
  isDashboard,
  isUser,
  isEdit,
  isAppointment,
  offline,
  setRefetch,
  currentAppointmentPage,
  setCurrentAppointmentPage,
  totalPages,
  totalAppointmentPages,
  setCurrentPatientAppointmentPage,
  currentPatientAppointmentPage,
  setUserPageId,
  editFormVisible,
  setEditFormVisible,
}) => {
  // Core form state
  const [complain, setComplain] = useState("");
  const [instruction, setInstruction] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("Select Remedy");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [dosage, setDosage] = useState([]);
  const [selectedDosage, setSelectedDosage] = useState("Dosage");
  const [selectedRepetition, setSelectedRepetition] = useState("Repetition");
  const [selectedPotency, setSelectedPotency] = useState("Potency");
  const [frequency, setFrequency] = useState([]);
  const [showMedicine, setShowMedicine] = useState("");
  const [potency, setPotency] = useState([]);
  const [days, setDays] = useState([]);
  const [duration, setDuration] = useState("Duration");
  const [pharmacy, setPharmacy] = useState([]);
  const [fetchRemedies, setFetchRemedies] = useState([]);
  const [selectedPharmacyName, setSelectedPharmacyName] = useState(
    "Select Pharmacy Name"
  );
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("");
  const [selectedPharmacyEmail, setSelectedPharmacyEmail] = useState("");
  const [viewDetails, setViewDetails] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedRemedies, setSelectedRemedies] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dropdownEmail, setDropdownEmail] = useState(false);
  const [dropdownDuration, setDropdownDuration] = useState(false);
  const [dropdownPotency, setDropdownPotency] = useState(false);
  const [dropdownDosage, setDropdownDosage] = useState(false);
  const [dropdownRemedies, setDropdownRemedies] = useState(false);
  const [dropdownRepetition, setDropdownRepetition] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReportImages, setShowReportImages] = useState([]);
  const [showAppointmentFee, setAppointmentFee] = useState(
    "Set Appointment Fee"
  );
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isEditOpenRef = useRef(false);
  const navigate = useNavigate();

  // Helper: prefill local state from an appointment
  const prefillFromAppointment = (appt, option) => {
    const medsArray = Array.isArray(appt?.medicines?.remedies)
      ? appt.medicines.remedies
      : [];
    setMedicines(medsArray);
    // if (option === "edit") {
    //   setMedicines([]);
    // } else {
    //   setMedicines(medsArray);
    // }
    setComplain(appt?.medicines?.complain ?? appt?.complain ?? "");
    setDuration(
      appt?.medicines?.duration ?? appt?.duration ?? "Select Duration"
    );
    setSelectedPharmacyName(
      appt?.medicines?.pharmacyName ??
        appt?.pharmacyName ??
        "Select Pharmacy Name"
    );
    setSelectedPharmacyId(
      appt?.medicines?.pharmacyId ?? appt?.pharmacyId ?? ""
    );
    setInstruction(appt?.medicines?.instruction ?? appt?.instruction ?? "");
    const imgs = Array.isArray(appt?.medicines?.reportImageUrls)
      ? appt.medicines.reportImageUrls
      : Array.isArray(appt?.reportImageUrls)
      ? appt.reportImageUrls
      : [];
    setImageUrls(imgs);
    // Reset per-entry selectors
    setSelectedMedicine("Select Remedy");
    setSelectedDosage("Dosage");
    setSelectedRepetition("Repetition");
    setSelectedPotency("Potency");
    // Close all dropdowns to avoid stale UI
    setDropdownEmail(false);
    setDropdownDuration(false);
    setDropdownPotency(false);
    setDropdownDosage(false);
    setDropdownRemedies(false);
    setDropdownRepetition(false);
  };

  // Existing sockets and data fetchers
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    socket.on("option", () => {
      fetchOptions();
    });
    return () => {
      socket.off("option");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    socket.on("remedy", () => {
      fetchAllRemedies();
    });
    return () => {
      socket.off("remedy");
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    isEditOpenRef.current = Object.values(editFormVisible || {}).some(Boolean);
  }, [editFormVisible]);

  useEffect(() => {
    const onConnect = () => console.log("Connected to socket server");
    const onNewOrder = () => {
      if (!isEditOpenRef.current) {
        setRefetch((pre) => !pre);
      }
    };
    socket.on("connect", onConnect);
    socket.on("newOrder", onNewOrder);
    return () => {
      socket.off("newOrder", onNewOrder);
      socket.off("connect", onConnect);
    };
  }, [setRefetch, editFormVisible]);

  const fetchOptions = async () => {
    const res = await getOption();
    if (res) {
      setPotency(res[0]?.potency);
      setDosage(res[0]?.dosage);
      setFrequency(res[0]?.repetition);
      setDays(res[0]?.days);
    }
  };

  const fetchAllPharmacy = async () => {
    const pharmacyData = await getAllPharmacy();
    setPharmacy(pharmacyData);
  };

  const fetchAllRemedies = async () => {
    const res = await getAllRemedies();
    setFetchRemedies(res?.data);
  };

  useEffect(() => {
    fetchAllPharmacy();
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchAllRemedies();
  }, []);

  // File / image helpers
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newUrls]);
  };

  const handleDeleteImage = (indexToRemove) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleImageClick = (url) => setSelectedImage(url);
  const closePopup = () => setSelectedImage(null);

  // Table paging
  const handleNext = () => setCurrentAppointmentPage((prev) => prev + 1);
  const handlePrev = () =>
    setCurrentAppointmentPage((prev) => Math.max(1, prev - 1));
  const handleNextPatient = () => {
    setUserPageId(appointments[0].userId);
    setCurrentPatientAppointmentPage((prev) => prev + 1);
  };
  const handlePrevPatient = () => {
    setUserPageId(appointments[0].userId);
    setCurrentPatientAppointmentPage((prev) => Math.max(1, prev - 1));
  };

  // Dropdown search filtering
  const filteredPharmacyEmail = (pharmacy || []).filter((p) =>
    p.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRemedies = (fetchRemedies || []).filter((p) =>
    p.remediesName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPotency = (potency || []).filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDosage = (dosage || []).filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredDays = (days || []).filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRepetition = (frequency || []).filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pharmacy selection
  const handleSelectChange = (name, id) => {
    setSelectedMedicine(name);
    setSelectedMedicineId(id);
  };

  // Row actions
  const handleEditClick = (index) => {
    const appt = appointments[index];
    prefillFromAppointment(appt, "edit");
    setEditFormVisible((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleUpdateAppointment = (app) => {
    const idx = appointments.findIndex(
      (a) => a.appointmentId === app.appointmentId
    );
    if (idx === -1) return;
    prefillFromAppointment(app);
    setEditFormVisible((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleViewDetails = (index) => {
    setViewDetails((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShowAllReport = (appointment) => {
    setShowReportImages(appointment?.reportImageUrls);
    setShowReport(true);
  };

  const handleImageReport = (url) => {
    setSelectedImage(url);
    setShowReport(false);
  };

  const handlePayNow = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentPopup(true);
  };

  const closeThePopup = () => setShowPaymentPopup(false);
  const closeThePopupReport = () => setShowReport(false);

  // Medicine list edits
  const handleRemoveMedicine = (indexToRemove) => {
    setMedicines((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const addMedicine = () => {
    if (
      !selectedMedicine ||
      selectedMedicine === "Select Remedy" ||
      !selectedPotency ||
      selectedPotency === "Potency" ||
      !selectedDosage ||
      selectedDosage === "Dosage" ||
      !selectedRepetition ||
      selectedRepetition === "Repetition"
    ) {
      alert("Please select all fields before adding medicine");
      return;
    }
    setMedicines([
      ...medicines,
      {
        medicineName: selectedMedicine,
        remediesId: selectedMedicineId,
        dosage: selectedDosage,
        potency: selectedPotency,
        frequency: selectedRepetition,
      },
    ]);
    setSelectedMedicine("Select Remedy");
    setSelectedDosage("Dosage");
    setSelectedRepetition("Repetition");
    setSelectedPotency("Potency");
  };

  // Submit for not-completed (original finalize flow)
  const handleEditDetails = async (
    e,
    email,
    id,
    patientName,
    fee,
    doctorEmail,
    userId
  ) => {
    e.preventDefault();
    if (!complain) {
      alert("Please enter complain details.");
      return;
    }
    if (medicines.length === 0) {
      alert("You have not added any remedies.");
      return;
    }
    if (selectedPharmacyName === "Select Pharmacy Name") {
      alert("Please select pharmacy name.");
      return;
    }
    if (duration === "Select Duration") {
      alert("Please select duration.");
      return;
    }
    const formData = {
      complain,
      remedies: JSON.parse(JSON.stringify(medicines)),
      duration,
      showMedicine,
      showAppointmentFee,
      pharmacyName: selectedPharmacyName,
      pharmacyId: selectedPharmacyId,
      reportImageUrls: imageUrls,
      instruction,
    };
    const orderData = {
      appointmentId: id,
      instruction,
    };
    try {
      let updatedData = {};
      if (offline) {
        updatedData = await addOfflineMedicinesDetails(userId, id, formData);
        setRefetch((pre) => !pre);
      } else {
        updatedData = await addMedicinesDetails(email, id, formData);
        setRefetch((pre) => !pre);
      }
      const orderResData = await addOrderToPharmacy(
        selectedPharmacyId,
        orderData
      );
      if (updatedData && orderResData) {
        if (offline) {
          await updateOfflineAppointment(userId, id, {
            appointmentStatus: "Completed",
          });
          if (showAppointmentFee === "No") {
            await registerFeeNotification({
              appointmentId: id,
              appointmentFee: fee,
            });
          }
        } else {
          await updateAppointment(email, id, {
            appointmentStatus: "Completed",
          });
        }
        setEditFormVisible({});
        setRefetch((pre) => !pre);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Submit for completed (update only medicines container)
  const saveMedicinesOnly = async (appt) => {
    const payload = {
      medicines: {
        complain,
        remedies: medicines,
        duration,
        pharmacyName: selectedPharmacyName,
        pharmacyId: selectedPharmacyId,
      },
      feeInstruction: instruction,
    };
    const res = await updateAppointmentMedicines(appt?.appointmentId, payload);
    setEditFormVisible({});
    setRefetch((pre) => !pre);
  };
  function extractDateTime(isoString) {
    const dateObj = new Date(isoString);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toTimeString().split(" ")[0];
    return date + " " + time;
  }

  const handleDelete = async () => {
    try {
      await deleteAppointment(deleteAppointmentId);
      setRefetch((pre) => !pre);
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <div>
      <table className="orders-table15">
        <thead>
          {appointments?.length !== 0 ? (
            <tr className="table-header16">
              <th>Appoint. Id</th>
              <th>Date</th>
              <th className="header-item17">Patient Name</th>
              <th>Appointment Status</th>
              <th>Appointment Fee</th>
              {!offline && <th>Time</th>}
              {offline && <th>Mob. Number</th>}
              {!isDashboard && <th>Action</th>}
            </tr>
          ) : (
            ""
          )}
        </thead>
        <tbody>
          {appointments?.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                style={{
                  textAlign: "center",
                  color: "var(--primary)",
                  paddingTop: "20px",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                {(!isUser || isAppointment) && "No Appointments Available."}
              </td>
            </tr>
          ) : (
            appointments.map((appointment, index) => {
              if (!isUser) {
                return (
                  <tr
                    key={index}
                    className="table-row18"
                    onClick={() => {
                      if (!offline) {
                        navigate("/appointment", {
                          state: { email: appointment.email },
                        });
                      }
                    }}
                  >
                    <td>{appointment.appointmentId}</td>
                    {!offline && <td>{appointment.date}</td>}
                    <td className="order-item19">
                      {appointment.firstName + " " + appointment.lastName ||
                        "N/A"}
                    </td>
                    <td
                      className="status-text21"
                      style={{
                        color:
                          appointment.appointmentStatus === "Completed"
                            ? "var(--primary)"
                            : "#FF8C00",
                      }}
                    >
                      {appointment.appointmentStatus}
                    </td>
                    <td>{appointment.appointmentFee}</td>
                    {!offline && (
                      <td className="order-item19">{appointment.startTime}</td>
                    )}
                    {!isDashboard && (
                      <td className="action-btn">
                        <BiEditAlt />
                        <FaEye />
                        <MdDelete />
                      </td>
                    )}
                  </tr>
                );
              } else {
                return (
                  <React.Fragment key={index}>
                    <tr
                      className="table-row18"
                      onClick={() => {
                        if (!offline && isEdit) {
                          navigate("/appointment", {
                            state: { email: appointment.email },
                          });
                        }
                      }}
                    >
                      <td>{appointment.appointmentId}</td>
                      {!offline && <td>{appointment.date}</td>}
                      {offline && (
                        <td>{extractDateTime(appointment.createdAt)}</td>
                      )}
                      <td className="order-item19">
                        {appointment.firstName + " " + appointment.lastName ||
                          "N/A"}
                      </td>
                      <td
                        className="status-text21"
                        style={{
                          color:
                            appointment.appointmentStatus === "Completed"
                              ? "var(--primary)"
                              : "#FF8C00",
                        }}
                      >
                        {appointment.appointmentStatus}
                      </td>
                      <td>{appointment.appointmentFee}</td>
                      {!offline && (
                        <td className="order-item19">
                          {appointment.startTime}
                        </td>
                      )}
                      {offline && <td>{appointment.phoneNumber}</td>}
                      {!isDashboard && (
                        <td className="action-btn">
                          {isEdit &&
                            appointment.appointmentStatus !== "Expired" &&
                            appointment.appointmentStatus !== "Completed" && (
                              <>
                                <BiEditAlt
                                  onClick={() => handleEditClick(index)}
                                />
                                {offline && (
                                  <MdDelete
                                    onClick={() => {
                                      setShowConfirmPopup(true);
                                      setDeleteAppointmentId(
                                        appointment?.appointmentId
                                      );
                                    }}
                                  />
                                )}
                              </>
                            )}
                          {appointment.appointmentStatus === "Completed" && (
                            <BiEditAlt
                              onClick={() =>
                                handleUpdateAppointment(appointment)
                              }
                            />
                          )}
                          {appointment.appointmentStatus !== "Booked" && (
                            <FaEye onClick={() => handleViewDetails(index)} />
                          )}
                        </td>
                      )}
                    </tr>

                    {editFormVisible[index] && (
                      <tr>
                        <td colSpan="7">
                          <div className="edit-div-form">
                            <div
                              style={{ marginBottom: "10px" }}
                              className="div-text-area"
                            >
                              <label>
                                <strong>Complain:</strong>
                              </label>
                              <textarea
                                type="text"
                                value={complain}
                                onChange={(e) => setComplain(e.target.value)}
                              />
                            </div>

                            {Array.isArray(medicines) &&
                              medicines.length > 0 && (
                                <div style={{ marginBottom: "10px" }}>
                                  <label>Added Medicines:</label>
                                  <ol>
                                    {medicines.map((med, idxInner) => (
                                      <li
                                        key={idxInner}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                        }}
                                      >
                                        {med.medicineName}- {med.potency} -{" "}
                                        {med.dosage} - {med.frequency}
                                        <button
                                          onClick={() =>
                                            handleRemoveMedicine(idxInner)
                                          }
                                          style={{
                                            background: "red",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "2px 6px",
                                            cursor: "pointer",
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                            {/* Remedies */}
                            <div className="all-dropdown-ingrid">
                              <div className="custom-dropdown-container-1">
                                <label>
                                  <strong>Remedy Name</strong>
                                </label>
                                <div
                                  className="custom-dropdown-container"
                                  onClick={() => {
                                    setDropdownRemedies(!dropdownRemedies);
                                  }}
                                >
                                  {dropdownRemedies ? (
                                    <input
                                      type="text"
                                      placeholder="Search Remedy Name"
                                      value={searchTerm}
                                      onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                      }
                                      className="searchInputEdit"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <p>{selectedMedicine}</p>
                                  )}
                                  <MdKeyboardArrowDown
                                    size={25}
                                    style={{
                                      transform: dropdownRemedies
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 0.3s ease",
                                    }}
                                  />
                                </div>
                                {dropdownRemedies && (
                                  <div className="custom-dropdown-container-drop1">
                                    {filteredRemedies.length === 0 ? (
                                      <p>No Remedies found</p>
                                    ) : filteredRemedies.length > 0 ? (
                                      filteredRemedies.map((p, idx) => (
                                        <p
                                          key={idx}
                                          onClick={() => {
                                            handleSelectChange(
                                              p.remediesName,
                                              p.id
                                            );
                                            setDropdownRemedies(false);
                                            setSearchTerm("");
                                          }}
                                          style={{ cursor: "pointer" }}
                                        >
                                          {p?.remediesName}
                                        </p>
                                      ))
                                    ) : (
                                      <p>No Remedies found</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="custom-potency-width">
                                {/* Potency */}
                                <div className="custom-dropdown-container-1">
                                  <label>
                                    <strong>Potency</strong>
                                  </label>
                                  <div
                                    className="custom-dropdown-container"
                                    onClick={() => {
                                      setDropdownPotency(!dropdownPotency);
                                    }}
                                  >
                                    {dropdownPotency ? (
                                      <input
                                        type="text"
                                        placeholder="Potency"
                                        value={searchTerm}
                                        onChange={(e) =>
                                          setSearchTerm(e.target.value)
                                        }
                                        className="searchInputEdit2"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <p>{selectedPotency}</p>
                                    )}
                                    <MdKeyboardArrowDown
                                      size={25}
                                      style={{
                                        transform: dropdownPotency
                                          ? "rotate(180deg)"
                                          : "rotate(0deg)",
                                        transition: "transform 0.3s ease",
                                      }}
                                    />
                                  </div>
                                  {dropdownPotency && (
                                    <div className="custom-dropdown-container-drop">
                                      {filteredPotency.length > 0 ? (
                                        filteredPotency.map((p, idx) => (
                                          <p
                                            key={idx}
                                            onClick={() => {
                                              setSelectedPotency(p);
                                              setDropdownPotency(false);
                                              setSearchTerm("");
                                            }}
                                            style={{ cursor: "pointer" }}
                                          >
                                            {p}
                                          </p>
                                        ))
                                      ) : (
                                        <p>No Potency found</p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Dosage */}
                                <div className="custom-dropdown-container-1">
                                  <label>
                                    <strong>Dosage</strong>
                                  </label>
                                  <div
                                    className="custom-dropdown-container"
                                    onClick={() => {
                                      setDropdownDosage(!dropdownDosage);
                                    }}
                                  >
                                    {dropdownDosage ? (
                                      <input
                                        type="text"
                                        placeholder="Search Dosage"
                                        value={searchTerm}
                                        onChange={(e) =>
                                          setSearchTerm(e.target.value)
                                        }
                                        className="searchInputEdit1"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <p>{selectedDosage}</p>
                                    )}
                                    <MdKeyboardArrowDown
                                      size={25}
                                      style={{
                                        transform: dropdownDosage
                                          ? "rotate(180deg)"
                                          : "rotate(0deg)",
                                        transition: "transform 0.3s ease",
                                      }}
                                    />
                                  </div>
                                  {dropdownDosage && (
                                    <div
                                      className="custom-dropdown-container-drop"
                                      style={{ width: "7.5%" }}
                                    >
                                      {filteredDosage.length > 0 ? (
                                        filteredDosage.map((p, idx) => (
                                          <p
                                            key={idx}
                                            onClick={() => {
                                              setSelectedDosage(p);
                                              setDropdownDosage(false);
                                              setSearchTerm("");
                                            }}
                                            style={{ cursor: "pointer" }}
                                          >
                                            {p}
                                          </p>
                                        ))
                                      ) : (
                                        <p>No Dosage found</p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Repetition */}
                                <div
                                  className="custom-dropdown-container-1"
                                  style={{ width: "160px" }}
                                >
                                  <label>
                                    <strong>Repetition</strong>
                                  </label>
                                  <div
                                    className="custom-dropdown-container"
                                    onClick={() => {
                                      setDropdownRepetition(
                                        !dropdownRepetition
                                      );
                                    }}
                                  >
                                    {dropdownRepetition ? (
                                      <input
                                        type="text"
                                        placeholder="Search Repetition"
                                        value={searchTerm}
                                        onChange={(e) =>
                                          setSearchTerm(e.target.value)
                                        }
                                        className="searchInputEdit1"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <p>{selectedRepetition}</p>
                                    )}
                                    <MdKeyboardArrowDown
                                      size={25}
                                      style={{
                                        transform: dropdownRepetition
                                          ? "rotate(180deg)"
                                          : "rotate(0deg)",
                                        transition: "transform 0.3s ease",
                                      }}
                                    />
                                  </div>
                                  {dropdownRepetition && (
                                    <div
                                      className="custom-dropdown-container-drop"
                                      style={{ width: "10%" }}
                                    >
                                      {filteredRepetition.length > 0 ? (
                                        filteredRepetition.map((p, idx) => (
                                          <p
                                            key={idx}
                                            onClick={() => {
                                              setSelectedRepetition(p);
                                              setDropdownRepetition(false);
                                              setSearchTerm("");
                                            }}
                                            style={{ cursor: "pointer" }}
                                          >
                                            {p}
                                          </p>
                                        ))
                                      ) : (
                                        <p>No Repetition found</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="add-morebtn"
                                  onClick={addMedicine}
                                >
                                  + Add Remedy
                                </button>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="all-dropdown-ingrid1">
                              <div className="custom-dropdown-container-1">
                                <label>
                                  <strong>Select Duration(Days):</strong>
                                </label>
                                <div
                                  className="custom-dropdown-container"
                                  onClick={() => {
                                    setDropdownDuration(!dropdownDuration);
                                  }}
                                >
                                  {dropdownDuration ? (
                                    <input
                                      className="searchInputEdit"
                                      type="text"
                                      placeholder="Search Duration"
                                      value={searchTerm}
                                      onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                      }
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <p>{duration}</p>
                                  )}
                                  <MdKeyboardArrowDown
                                    size={25}
                                    style={{
                                      transform: dropdownDuration
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 0.3s ease",
                                    }}
                                  />
                                </div>
                                {dropdownDuration && (
                                  <div
                                    className="custom-dropdown-container-drop"
                                    style={{ width: "15.5%" }}
                                  >
                                    {filteredDays.length > 0 ? (
                                      filteredDays.map((p, idx) => (
                                        <p
                                          key={idx}
                                          onClick={() => {
                                            setDuration(p);
                                            setDropdownDuration(false);
                                            setSearchTerm("");
                                          }}
                                          style={{ cursor: "pointer" }}
                                        >
                                          {p}
                                        </p>
                                      ))
                                    ) : (
                                      <p>No Duration Days Found.</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {Number(appointment.appointmentFee) !== 0 && (
                                <div style={{ marginBottom: "10px" }}>
                                  <label>
                                    <strong>Set Appointment Fee:</strong>
                                  </label>
                                  <select
                                    value={showAppointmentFee}
                                    onChange={(e) =>
                                      setAppointmentFee(e.target.value)
                                    }
                                  >
                                    <option value="">
                                      Set Appointment Fee
                                    </option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                              )}

                              <div style={{ marginBottom: "10px" }}>
                                <label>
                                  <strong>Surcharge:</strong>
                                </label>
                                <textarea
                                  type="text"
                                  value={instruction}
                                  onChange={(e) =>
                                    setInstruction(e.target.value)
                                  }
                                />
                              </div>

                              <div
                                className="custom-dropdown-container-1"
                                onClick={() => {
                                  setDropdownEmail(!dropdownEmail);
                                }}
                              >
                                <label>
                                  <strong>Pharmacy Name</strong>
                                </label>
                                <div className="custom-dropdown-container">
                                  {dropdownEmail ? (
                                    <input
                                      type="text"
                                      placeholder="Search Pharmacy Name"
                                      value={searchTerm}
                                      onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                      }
                                      autoFocus
                                      className="searchInputEdit"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <p>{selectedPharmacyName}</p>
                                  )}
                                  <MdKeyboardArrowDown
                                    size={25}
                                    style={{
                                      transform: dropdownEmail
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 0.3s ease",
                                    }}
                                  />
                                </div>
                                {dropdownEmail && (
                                  <div
                                    className="custom-dropdown-container-drop"
                                    style={{ width: "15.5%" }}
                                  >
                                    {filteredPharmacyEmail.length > 0 ? (
                                      filteredPharmacyEmail.map((p, idx) => (
                                        <p
                                          key={idx}
                                          onClick={() => {
                                            const selectedPharmacy =
                                              pharmacy.find(
                                                (pharmacyEntry) =>
                                                  pharmacyEntry.pharmacyName ===
                                                  p?.pharmacyName
                                              );
                                            setSelectedPharmacyName(
                                              p.pharmacyName
                                            );
                                            setSelectedPharmacyId(
                                              selectedPharmacy?.pharmacyId
                                            );
                                            setSelectedPharmacyEmail(
                                              selectedPharmacy?.email
                                            );
                                            setDropdownEmail(false);
                                            setSearchTerm("");
                                          }}
                                          style={{ cursor: "pointer" }}
                                        >
                                          {p?.pharmacyName}
                                        </p>
                                      ))
                                    ) : (
                                      <p>No Pharmacy Name found</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ marginBottom: "10px", width: "25%" }}>
                              <label>Upload Report:</label>
                              <input
                                style={{ marginTop: "12px" }}
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                              />
                            </div>

                            <div className="image-thumbnails">
                              {imageUrls.map((url, idxImg) => (
                                <div className="thumbnail-wrapper" key={idxImg}>
                                  <img
                                    src={url}
                                    alt={`img-${idxImg}`}
                                    className="thumbnail"
                                    onClick={() => handleImageClick(url)}
                                  />
                                  <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteImage(idxImg)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>

                            {appointment.appointmentStatus === "Completed" ? (
                              <button
                                onClick={() => saveMedicinesOnly(appointment)}
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={(e) =>
                                  handleEditDetails(
                                    e,
                                    appointment.email,
                                    appointment.appointmentId,
                                    appointment.firstName +
                                      " " +
                                      appointment.lastName,
                                    appointment.appointmentFee,
                                    appointment.doctorId,
                                    offline ? appointment.userId : ""
                                  )
                                }
                              >
                                Submit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {viewDetails[index] && (
                      <tr>
                        <td colSpan="6">
                          <table
                            className="orders-table15"
                            style={{ width: "100%" }}
                          >
                            <thead>
                              <tr className="table-header16">
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Appointment Details</th>
                                <th>View Report</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                className="table-row18"
                                style={{
                                  border: "1px solid var(--primary)",
                                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                <td>{appointment.phoneNumber || "N/A"}</td>
                                <td>{appointment.email || "N/A"}</td>
                                <td
                                  onClick={() => handlePayNow(appointment)}
                                  style={{ cursor: "pointer" }}
                                >
                                  View Appointment Details
                                </td>
                                <td
                                  onClick={() =>
                                    handleShowAllReport(appointment)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  View All Report
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }
            })
          )}
          {totalPages > 1 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                <button
                  onClick={handlePrev}
                  disabled={currentAppointmentPage === 1}
                >
                  Prev
                </button>
                <span style={{ margin: "0 10px" }}>
                  {currentAppointmentPage}
                </span>
                <button
                  disabled={currentAppointmentPage >= totalPages}
                  onClick={handleNext}
                >
                  Next
                </button>
              </td>
            </tr>
          )}
          {totalAppointmentPages > 1 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                <button
                  onClick={handlePrevPatient}
                  disabled={currentPatientAppointmentPage === 1}
                >
                  Prev
                </button>
                <span style={{ margin: "0 10px" }}>
                  {currentPatientAppointmentPage}
                </span>
                <button
                  disabled={
                    currentPatientAppointmentPage >= totalAppointmentPages
                  }
                  onClick={handleNextPatient}
                >
                  Next
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedImage && (
        <div className="popup-overlay" onClick={closePopup}>
          <div
            className="popup-image-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedImage} alt="Full View" className="popup-image" />
            <button className="close-button" onClick={closePopup}>
              ×
            </button>
          </div>
        </div>
      )}

      {showReport && (
        <div className="popup-overlay">
          <div className="popup">
            <div
              style={{ textAlign: "left", fontSize: "24px", cursor: "pointer" }}
              onClick={closeThePopupReport}
            >
              <IoArrowBack />
            </div>
            {showReportImages.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--primary)",
                }}
              >
                No report available.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  cursor: "pointer",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gridTemplate: "auto",
                }}
              >
                {showReportImages.map((r, i) => (
                  <div key={i} onClick={() => handleImageReport(r)}>
                    <img src={r} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirmPopup && (
        <div className="delete-popup">
          <p>do you want to delete this appointment ?</p>
          <button onClick={(event) => handleDelete(event)}>Yes</button>
          <button onClick={() => setShowConfirmPopup(false)}>No</button>
        </div>
      )}

      {showPaymentPopup && selectedAppointment && (
        <div className="popup-overlay">
          <div className="popup">
            <div
              style={{ textAlign: "left", fontSize: "24px", cursor: "pointer" }}
              onClick={closeThePopup}
            >
              <IoArrowBack />
            </div>
            <h2>Appointment Details</h2>
            <div className="appo-details-1">
              <div>
                <b>Complain</b>:{` ${selectedAppointment.medicines?.complain}`}
              </div>
              {offline && (
                <div>
                  <b>Fee</b>:{` ${selectedAppointment.appointmentFee}`}
                </div>
              )}
              <div className="show-all-remedies-div">
                {selectedAppointment?.medicines?.remedies?.map(
                  (remedies, i) => (
                    <div key={i} className="remedies-show-11">
                      <div>
                        <div>
                          <strong>Remedies Name</strong>
                        </div>
                        <div>{remedies.medicineName}</div>
                      </div>
                      <div>
                        <div>
                          <strong>Potency</strong>
                        </div>
                        <div>{remedies.potency}</div>
                      </div>
                      <div>
                        <div>
                          <strong>Dosage</strong>
                        </div>
                        <div>{remedies.dosage}</div>
                      </div>
                      <div>
                        <div>
                          <strong>Repetition</strong>
                        </div>
                        <div>{remedies.frequency}</div>
                      </div>
                    </div>
                  )
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div>
                  <strong>Duration: </strong>
                  {`${selectedAppointment.medicines.duration}`}
                </div>
              </div>
              <div>
                <strong>Pharmacy Name: </strong>
                {`${selectedAppointment.medicines.pharmacyName}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
