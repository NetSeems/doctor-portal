import React, { useState, useEffect } from "react";
import {
  deleteOfflineUser,
  getAllOfflineUsersByDoctorId,
  getUserNextAppointments,
  setZeroFeeAppointment,
  updateOfflineUser,
} from "../backend";
import { IoArrowBack } from "react-icons/io5";
import { BiEditAlt } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Loading from "./Loading";
import { useAuth } from "./UserContext.js";
import AppointmentCard from "./AppointmentCard";
import { FaEye } from "react-icons/fa";

const OfflineUser = ({
  refresh,
  offline,
  setView,
  setEditFormVisible,
  editFormVisible,
}) => {
  const {
    currentDoctor,
    currentPatientPage,
    setCurrentPatientPage,
    fetchOfflinePatient,
    users,
    setUsers,
    totalPatientPage,
  } = useAuth();

  const [usersDisplay, setUsersDisplay] = useState([]);
  const [viewOption, setViewOption] = useState("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [usersAppointment, setUsersAppointment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showConfirmPopupBook, setShowConfirmPopupBook] = useState(false);
  const [userData, setUserData] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userPageId, setUserPageId] = useState(null);
  const [totalAppointmentPages, setTotalAppointmentPages] = useState(1);
  const [currentPatientAppointmentPage, setCurrentPatientAppointmentPage] =
    useState(1);
  const [appointment, setAppointment] = useState([]);
  const handleEdit = (data) => {
    setEditData(data);
    setViewOption("edit");
  };
  const fetchUserNextAppointment = async (doctorId, userId, currentPage) => {
    try {
      const appointmentsResponse = await getUserNextAppointments(
        doctorId,
        userId,
        currentPage
      );
      setAppointment(appointmentsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchUserNextAppointment(
      currentDoctor.id,
      userPageId,
      currentPatientAppointmentPage
    );
  }, [currentPatientAppointmentPage]);
  const handleDelete = async () => {
    try {
      const res = await deleteOfflineUser(deleteId);
      if (res) {
        setCurrentPatientPage(1);
        fetchUsers(1);
        setShowConfirmPopup(false);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleSubmit = async (event) => {
    let formData = {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      userId: userData?.userId || "",
      email: userData?.email || "",
      phoneNumber: userData?.phoneNumber || "",
      gender: userData?.gender || "",
      age: userData?.age || "",
    };
    const location = localStorage.getItem("doctorlocationoffline");
    event.preventDefault();

    const data = {
      ...formData,
      doctorName: currentDoctor?.name,
      doctorId: currentDoctor?.id,
      location: location,
      appointmentFee:userData?.appointments?.data[0]?.appointmentFee,
      paymentMode: userData?.appointments?.data[0]?.appointmentPaymentMode,
      medicines: userData?.appointments?.data[0]?.medicines,
     
    };
    //  medicines: {
    //     complain: "", // Default complaint
    //     remedies: [
    //       {
    //         medicineName: "", // Default medicine name
    //         dosage: "", // Default dosage
    //         frequency: "", // Default frequency
    //         potency: "", // Default potency
    //       },
    //     ],
    //     duration: "", // Default duration
    //     pharmacyName: "", // Default pharmacy
    //     pharmacyId: "", // Default pharmacy
    //     instructions: "", // Default instructions
    //     showMedicine: "", // Default showMedicine
    //   },
    try {
      const res = await setZeroFeeAppointment(data);

      if (res) {
        alert("Appointment Created Successfully.");
        setView("view");
      }
    } catch (error) {
      alert(error);
      console.error("Error:", error);
    }
  };

  const fetchUsers = async (currentPatientPage) => {
    try {
      const patients = await fetchOfflinePatient(currentPatientPage);
      if (patients?.length > 0) {
        setUsersDisplay(patients);
        setLoading(false);
      }
    } catch (err) {
      console.log("Eror", err);
      setError(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers(currentPatientPage);
  }, [refresh]);
  useEffect(() => {
    fetchUsers(currentPatientPage);
  }, [currentPatientPage]);

  const toggleUserAppointments = (user) => {
    setAppointment(user.appointments.data);
    setCurrentPatientAppointmentPage(user.appointments.page);
    setTotalAppointmentPages(user.appointments.totalPages);
    setUserPageId(user.userId);
    setExpandedUserId(expandedUserId === user.userId ? null : user.userId);
  };
  const handleUpdateUser = async (event, userId) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await updateOfflineUser(userId, data);
      if (res) {
        setViewOption("view");
        setCurrentPatientPage(1);
        fetchUsers(1);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users?.filter((user) => {
      return (
        user?.userId?.toString().toLowerCase().includes(term) ||
        user?.firstName?.toLowerCase().includes(term) ||
        user?.lastName?.toLowerCase().includes(term) ||
        user?.phoneNumber?.toString().includes(term)
      );
    });

    setUsersDisplay(filtered);
  };
  const handleNext = () => setCurrentPatientPage((prev) => prev + 1);
  const handlePrev = () =>
    setCurrentPatientPage((prev) => Math.max(1, prev - 1));
  return (
    <div className="appointment-main-container">
      {/* <h1 className="dashboard-title2">Users</h1> */}
      {loading ? (
        <Loading />
      ) : (
        viewOption === "view" && (
          <div
            className="appointment-content-container"
            style={{ marginTop: "20px" }}
          >
            <div style={{ marginBottom: "20px" }}>
              <input
                style={{ padding: "10px", width: "40%" }}
                placeholder="Search By User Id, Name, Number"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <table className="orders-table15">
              <thead>
                <tr className="table-header16">
                  <th>Patient Id</th>
                  <th>Name</th>
                  <th>Email/Address</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Book Re-Appointment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersDisplay?.map((user) => (
                  <React.Fragment key={user?.id}>
                    <tr
                      className="table-row18"
                      style={{
                        border: "1px solid var(--primary)",
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <td>{user?.userId}</td>
                      <td>
                        {user.firstName} {user.lastName}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{user.age}</td>
                      <td>{user.gender}</td>
                      <td
                      
                        className="cureMakeAppo"
                        onClick={() => {
                          setUserData(user);
                          setShowConfirmPopupBook(true);
                        }}
                      >
                        Re-book-Appointment
                      </td>
                      <td className="action-btn">
                        <BiEditAlt
                          onClick={() => {
                            handleEdit(user);
                          }}
                        />
                        <FaEye
                          className="view-icon"
                          onClick={() => {
                            console.log("Hello ");
                            toggleUserAppointments(user);
                          }}
                        />
                        <MdDelete
                          onClick={() => {
                            setShowConfirmPopup(true);
                            setDeleteId(user?.userId);
                          }}
                        />
                      </td>
                    </tr>
                    {expandedUserId === user?.userId && (
                      <tr>
                        <td colSpan={offline ? 8 : 6}>
                          <AppointmentCard
                            appointments={appointment}
                            isUser={true}
                            isEdit={false}
                            offline={true}
                            patientId={user?.userId}
                            doctorId={currentDoctor?.Id}
                            isPatient={true}
                            currentPatientAppointmentPage={
                              currentPatientAppointmentPage
                            }
                            setUserPageId={setUserPageId}
                            setCurrentPatientAppointmentPage={
                              setCurrentPatientAppointmentPage
                            }
                            setEditFormVisible={setEditFormVisible}
                            editFormVisible={editFormVisible}
                            totalAppointmentPages={totalAppointmentPages}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {totalPatientPage > 1 && (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "10px" }}
                    >
                      <button
                        onClick={handlePrev}
                        disabled={currentPatientPage === 1}
                      >
                        Prev
                      </button>
                      <span style={{ margin: "0 10px" }}>
                        {currentPatientPage}
                      </span>
                      <button
                        disabled={currentPatientPage >= totalPatientPage} // disable when no more data
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
        )
      )}
      {viewOption === "edit" && (
        <form
          onSubmit={(event) => handleUpdateUser(event, editData?.userId)}
          className="form-data-add"
        >
          <IoArrowBack
            style={{ cursor: "pointer" }}
            size={30}
            onClick={() => setViewOption("view")}
          />
          <div>
            <input
              defaultValue={editData.firstName}
              name="firstName"
              placeholder="First Name"
              required
            />
          </div>
          {/* <div>
            <input
              defaultValue={editData.lastName}
              name="lastName"
              placeholder="Last Name"
             
            />
          </div> */}
          <div>
            <input
              defaultValue={editData.email}
              name="email"
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              defaultValue={editData.phoneNumber}
              name="phoneNumber"
              placeholder="Phone Number"
              required
            />
          </div>
          <div>
            <input
              defaultValue={editData.age}
              name="age"
              placeholder="Age"
              required
            />
          </div>
          <div>
            <input
              defaultValue={editData.gender}
              name="gender"
              placeholder="Gender"
              required
            />
          </div>
          <button type="submit" className="form-data-btn1">
            Update
          </button>
        </form>
      )}
      {showConfirmPopup && (
        <div className="delete-popup">
          <p>Would you like to delete this patient ?</p>
          <button onClick={(event) => handleDelete(event)}>Yes</button>
          <button onClick={() => setShowConfirmPopup(false)}>No</button>
        </div>
      )}
      {showConfirmPopupBook && (
        <div className="delete-popup">
          <p>Would you like to book appointment ?</p>
          <button onClick={(event) => handleSubmit(event)}>Yes</button>
          <button onClick={() => setShowConfirmPopupBook(false)}>No</button>
        </div>
      )}
    </div>
  );
};

export default OfflineUser;
