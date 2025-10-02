import axios from "axios";

const API_URL = "https://apirk.drrkvishwakarma.com/api";
// const API_URL = "http://localhost:8081/api";
export const addAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/offlineappointment/add`,
      appointmentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Axios automatically parses the response, no need for .json()
    return response.data;
  } catch (error) {
    // Handle errors properly
    throw error.response?.data?.message || "Something went wrong.";
  }
};
export const registerFeeNotification = async (appointmentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/notification/register`,
      appointmentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Axios automatically parses the response, no need for .json()
    return response.data;
  } catch (error) {
    // Handle errors properly
    throw error.response?.data?.message || "Something went wrong.";
  }
};
export const setZeroFeeAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/offlineappointment/setzerofee`,
      appointmentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Axios automatically parses the response, no need for .json()
    return response.data;
  } catch (error) {
    // Handle errors properly
    throw error.response?.data?.message || "Something went wrong.";
  }
};

export const updateAppointmentMedicines = async (appointmentId,appointmentData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/offlineappointment/updatemedicines/${appointmentId}`,
      appointmentData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Axios automatically parses the response, no need for .json()
    return response.data;
  } catch (error) {
    // Handle errors properly
    throw error.response?.data?.message || "Something went wrong.";
  }
};

export const getConsultation = async () => {
  try {
    const response = await axios.get(`${API_URL}/appointmentfee/all`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching remedies:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch remedies",
    };
  }
};
export const getDashboardStats = async (doctorId) => {
  try {
    const response = await axios.get(`${API_URL}/offlineappointment/stats/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching remedies:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch remedies",
    };
  }
};
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/auth/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update remedy",
    };
  }
};
export const deleteOfflineUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/offline/deleteoffline/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update remedy",
    };
  }
};
export const updateOfflineUser = async (id, data) => {
  try {
    const response = await axios.patch(
      `${API_URL}/offline/updateofflineusers/${id}`,
      { data }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating user details:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update",
    };
  }
};
const fetchUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/getUserAllAppointment`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/offlineappointment/delete/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getOption = async () => {
  try {
    const response = await axios.get(`${API_URL}/option/get`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const fetchUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/auth/getUser/${email}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getAllAppointments = async (email) => {
  try {
    const response = await axios.get(
      `${API_URL}/doctor/getallappointment/${email}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getAllOfflineAppointments = async (id,currentPage) => {
  try {
    const response = await axios.get(
      `${API_URL}/doctor/getallofflineappointment/${id}?page=${currentPage}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getAllUsersByDoctorEmail = async (email) => {
  try {
    const response = await axios.get(
      `${API_URL}/auth/getUserByDoctoremail/${email}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getAllOfflineUsersByDoctorId = async (id,currentPage) => {
  try {
    const response = await axios.get(
      `${API_URL}/offline/getUserByDoctor/${id}?page=${currentPage}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getUserNextAppointments = async (doctorId,userId,currentPage) => {
  try {
    const response = await axios.get(
      `${API_URL}/offline/moreappointment/${userId}/${doctorId}?page=${currentPage}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const getAllAppointmentsByEmail = async (email) => {
  try {
    const response = await axios.get(
      `${API_URL}/appointment/getappointmentbyemail/${email}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const forgotPassword = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/forgotpassword`,
      userData
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getAllRemedies = async (pharmacyEmail) => {
  try {
    const response = await axios.get(
      `${API_URL}/superremedies/getall`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const addMedicinesDetails = async (email, appointmentId, updatedData) => {
  try {
    const response = await axios.put(
      `${API_URL}/appointment/addmedicines/${email}/${appointmentId}`,
      updatedData // Send the updated data in the request body
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating medicines:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const addOfflineMedicinesDetails = async (
  userId,
  appointmentId,
  updatedData
) => {
  try {
    const response = await axios.put(
      `${API_URL}/offlineappointment/addmedicines/${userId}/${appointmentId}`,
      updatedData // Send the updated data in the request body
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating medicines:",
      error.response?.data || error.message
    );
    throw error;
  }
};
const updateAppointment = async (email, appointmentId, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/appointment/update/${email}/${appointmentId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating doctor:",
      error.response?.data || error.message
    );
  }
};
const updateOfflineAppointment = async (userId, appointmentId, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/offlineappointment/update/${userId}/${appointmentId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating doctor:",
      error.response?.data || error.message
    );
  }
};
export const updateDoctorSchedule = async () => {
  try {
    const response = await axios.put(`${API_URL}/doctor/updateschedule`);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding doctor:",
      error.response?.data || error.message
    );
  }
};
const updateDoctor = async (doctorId, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/doctor/update/${doctorId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating doctor:",
      error.response?.data || error.message
    );
  }
};

export const updateDoctorScheduleSlot = async (doctorId, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/doctor/updatescheduleslot/${doctorId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating doctor:",
      error.response?.data || error.message
    );
  }
};

export const getDoctor = async (doctorData) => {
  try {
    const response = await axios.post(
      `${API_URL}/doctor/getdoctoremail`,
      doctorData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const getAllDoctor = async (currentPage) => {
  try {
    const response = await axios.get(`${API_URL}/doctor/getall?page=${currentPage}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor:",
      error.response?.data || error.message
    );
    return null;
  }
};
export const fetchDoctorDetails = async () => {
  try {
    const token = localStorage.getItem("doctortoken"); // Retrieve token from local storage

    if (!token) {
      return;
    }

    const response = await axios.get(`${API_URL}/doctor/getdoctortoken`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send token in headers
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor details:",
      error.response?.data || error.message
    );
  }
};
export const getAllPharmacy = async () => {
  try {
    const response = await axios.get(`${API_URL}/pharmacy/getallpharmacy`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor:",
      error.response?.data || error.message
    );
    return null;
  }
};
export const getDoctorTimeSlots = async (email, date, location) => {
  try {
    const response = await axios.get(
      `${API_URL}/doctor/gettimeslot/${email}/${location}/${date}` // ✅ location before date
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor time slots:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const getDoctorSchedule = async (doctorId) => {
  try {
    const response = await axios.get(
      `${API_URL}/doctor/getschedule/${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error", error);
  }
};
export const sendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/otp/send-otp`, {
      email, // dynamically send either email or phone
    });

    if (response) {
      return true; // Indicating OTP was sent successfully
    } else {
      console.error("Failed to send OTP");
      return false;
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};

export const validateOtp = async (emailOrPhone, otp, type = "email") => {
  try {
    const response = await axios.post(`${API_URL}/otp/validate-otp`, {
      [type]: emailOrPhone, // dynamically use either email or phone
      otp: otp, // OTP entered by the user
    });
    if (response) {
      return true; // Indicating OTP is valid
    } else {
      console.error("Invalid OTP");
      return false; // OTP is invalid
    }
  } catch (error) {
    console.error("Error validating OTP:", error);
    return false; // Error in OTP validation
  }
};
export const addOrderToPharmacy = async (id, orderData) => {
  try {
    const response = await axios.post(
      `${API_URL}/pharmacy/addorder/${id}`,
      orderData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor:",
      error.response?.data || error.message
    );
    return null;
  }
};
export {
  fetchUser,
  getAllAppointmentsByEmail,
  getAllAppointments,
  updateDoctor,
  fetchUserByEmail,
  addMedicinesDetails,
  getAllUsersByDoctorEmail,
  updateAppointment,
  getAllOfflineAppointments,
  addOfflineMedicinesDetails,
  updateOfflineAppointment,
  getAllOfflineUsersByDoctorId,
  getUserNextAppointments,
};
