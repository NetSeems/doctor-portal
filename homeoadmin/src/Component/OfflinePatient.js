import React, { useEffect, useState, useRef } from "react";
import "../Style/OfflinePatient.css";
import { useAuth } from "./UserContext";
import { addAppointment, getConsultation } from "../backend";
import OfflineAppointment from "./OfflineAppointments";
import OfflineUser from "./OfflineUser";
import socket from "../socket";
import ShowAlert from "./ShowAlert";

const OfflinePatient = () => {
  const { currentDoctor, setRefresh, editFormVisible, setEditFormVisible } =
    useAuth();
  const [refetch, setRefetch] = useState(false);
  const [view, setView] = useState("view");
  const [fee, setFee] = useState(0);
  const [feeUpdateState, setFeeUpdateState] = useState(0);
  const [visible, setVisible] = useState(false);
  const [alertCount, setAlertCount] = useState(0); // multiple alerts counter
  const [feeState, setFeeState] = useState("yes");
  const audioRef = useRef(null); // reference to audio element

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    age: "",
    fee: "",
    gender: "",
    paymentMode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    const location = localStorage.getItem("doctorlocationoffline");
    event.preventDefault();

    const data = {
      ...formData,
      doctorName: currentDoctor?.name,
      doctorId: currentDoctor?.id,
      location: location,
      appointmentFee: fee,
      medicines: {
        complain: "",
        remedies: [
          {
            medicineName: "",
            dosage: "",
            potency: "",
            frequency: "",
          },
        ],
        potency: "",
        duration: "",
        pharmacyName: "",
        pharmacyId: "",
        instructions: "",
        showMedicine: "",
      },
    };

    try {
      const res = await addAppointment(data);
      if (res) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          age: "",
          fee: "",
          gender: "",
          paymentMode: "",
        });
        alert("Appointment Created Successfully.");
        setRefresh((pre) => pre + 1);
         setView("view");
      }
    } catch (error) {
      alert(error);
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchConsultationFee();
  }, []);

  const fetchConsultationFee = async () => {
    try {
      const res = await getConsultation();
      const clinicFee = res?.data?.filter(
        (data) => data.consultationType === "Clinic Visit"
      );
      setFeeUpdateState(clinicFee[0]?.consultationFee);
      setFee(clinicFee[0]?.consultationFee);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleChangeFeeState = (e) => {
    setFeeState(e.target.value);
    if (e.target.value === "yes") {
      setFee(feeUpdateState);
    } else {
      setFee(0);
    }
  };

  // Close all alerts
  const handleCloseAlerts = () => {
    setVisible(false);
    setAlertCount(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  const isEditOpenRef = useRef(false);

  useEffect(() => {
    isEditOpenRef.current = Object.values(editFormVisible || {}).some(Boolean);
  }, [editFormVisible]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newAppointment", () => {
      
      if (!isEditOpenRef.current) {
        
        setRefetch((pre) => !pre);
        setVisible(true);
        setAlertCount((prev) => prev + 1);

        // Play sound
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.log("Audio play blocked:", err);
          });
        }
      }
    });

    return () => {
      setVisible(false);
      setAlertCount(0);
      socket.off("newAppointment");
      socket.off("connect");
    };
  }, []);

  return (
    <div>
      {/* 🔊 Alert Sound */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />

      {/* 🔔 Multiple Alerts */}
      {visible && alertCount > 0 && (
        <ShowAlert
          setVisible={handleCloseAlerts} // close all alerts once
          message={`You have ${alertCount} new appointment(s).`}
        />
      )}

      <div className="tab-buttons">
        <button
          style={{
            backgroundColor: view === "view" ? "var(--primary)" : "",
            color: view === "view" ? "#fff" : "",
            borderRadius: view === "view" ? "10px" : "",
          }}
          onClick={() => {
            setView("view");
            setRefresh((pre) => pre + 1);
          }}
        >
          Appointment
        </button>
        <button
          style={{
            backgroundColor: view === "users" ? "var(--primary)" : "",
            color: view === "users" ? "#fff" : "",
            borderRadius: view === "users" ? "10px" : "",
          }}
          onClick={() => {
            setView("users");
            setRefresh((pre) => pre + 1);
          }}
        >
          Patient
        </button>
        <button
          style={{
            backgroundColor: view === "create" ? "var(--primary)" : "",
            color: view === "create" ? "#fff" : "",
            borderRadius: view === "create" ? "10px" : "",
          }}
          onClick={() => {
            setView("create");
            setRefresh((pre) => pre + 1);
          }}
        >
          Create New Appointment
        </button>
      </div>

      {view === "view" && (
        <OfflineAppointment
          key={refetch}
          setRefetch={setRefetch}
          refetch={refetch}
          editFormVisible={editFormVisible}
          setEditFormVisible={setEditFormVisible}
        />
      )}
      {view === "users" && (
        <OfflineUser
          offline={true}
          setView={setView}
          editFormVisible={editFormVisible}
          setEditFormVisible={setEditFormVisible}
        />
      )}
      {view === "create" && (
        <form
          onSubmit={(event) => handleSubmit(event)}
          className="form-data-add"
        >
          <div>
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="age"
              value={formData.age}
              placeholder="Patient Age"
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* <div>
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div> */}
          <div>
            <input
              name="email"
              type="text"
              value={formData.email}
              placeholder="Patient Email / Address"
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="phoneNumber"
              placeholder="Patient Phone Number"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <select value={feeState} onChange={handleChangeFeeState}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          {feeState === "yes" && (
            <div>
              <input placeholder={feeUpdateState} readOnly />
            </div>
          )}
          {feeState === "yes" && <div>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleChange}
            >
              <option value="">Select Payment Mode</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
          </div>}
          <button type="submit" className="form-data-btn1" style={{marginTop:"20px"}}>
            Create Appointment
          </button>
        </form>
      )}
    </div>
  );
};

export default OfflinePatient;
