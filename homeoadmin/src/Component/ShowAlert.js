import React, { useEffect,useRef } from "react";
import socket from "../socket";

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  popup: {
    background: "white",
    padding: "20px 30px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  },
  button: {
    marginTop: "15px",
    padding: "8px 16px",
    backgroundColor: "var(--primary)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
const ShowAlert = ({ setVisible, visible, fetchOrders }) => {
  const audioRef = useRef(null);
  const handleClose = () => {
    setVisible(false);
    // if (audioRef.current) {
    //   audioRef.current.pause();
    //   audioRef.current.currentTime = 0; // reset to start
    // }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h2>New Appointment Received!</h2>
        <p>You have received a new appointment. Please check your appointments.</p>
        <button onClick={handleClose} style={styles.button}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ShowAlert;
