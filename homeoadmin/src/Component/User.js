import React, { useState, useEffect } from "react";
import { getAllUsersByDoctorEmail } from "../backend";
import Loading from "./Loading";
import { useAuth } from "./UserContext.js";
import AppointmentCard from "./AppointmentCard";
import { FaEye } from "react-icons/fa";

const User = () => {
  const { currentDoctor } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user

  // Fetch users assigned to this doctor
  const fetchUsers = async () => {
    try {
      const response = await getAllUsersByDoctorEmail(currentDoctor?.doctor.email);
      setUsers(response);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserAppointments = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="appointment-main-container">
      <h1 className="dashboard-title2">Users</h1>
      {loading ? (
        <Loading />
      ) : (
        <div className="appointment-content-container">
          <table className="orders-table15">
            <thead>
              <tr className="table-header16">
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <React.Fragment key={user._id}>
                  <tr   className="table-row18" style={{border:"1px solid var(--primary)",boxShadow:"0px 4px 6px rgba(0, 0, 0, 0.1)"}}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.age}</td>
                    <td>{user.gender}</td>
                    <td className="action-btn">
                      <FaEye 
                        className="view-icon"
                        onClick={() => toggleUserAppointments(user._id)}
                      />
                    </td>
                  </tr>
                  {expandedUserId === user._id && (
                    <tr>
                      <td colSpan="6">
                        <AppointmentCard appointments={user.appointments} isUser={true} isEdit={false} />
                      </td>
                    </tr>
                  )}
                  
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default User;
