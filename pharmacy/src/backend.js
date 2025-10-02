import axios from "axios";

const API_URL = "https://apirk.drrkvishwakarma.com/api";
// const API_URL = "http://localhost:8081/api";

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
export const getOption = async () => {
  try {
    const response = await axios.get(`${API_URL}/option/get`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getStats = async (pharmacyId) => {
  try {
    const response = await axios.get(`${API_URL}/pharmacy/stats/${pharmacyId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const sendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/otp/send-otp`, {
      email, // dynamically send either email or phone
    });

    if (response) {
      console.log("OTP sent successfully");
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
      console.log("OTP validated successfully");
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
export const getPharmacyByEmail = async (email) => {
  try {
    const response = await axios.get(
      `${API_URL}/pharmacy/getpharmacy/${email}`
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

export const createRemediesOrder = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/remedyorder/add`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Error adding remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add remedy",
    };
  }
};
export const updateRemediesOrder = async (pharmacyEmail, id, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/remedyorder/updatestatus/${pharmacyEmail}/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add remedy",
    };
  }
};
export const getRemediesOrder = async (pharmacyEmail) => {
  try {
    const response = await axios.get(
      `${API_URL}/remedyorder/all/${pharmacyEmail}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add remedy",
    };
  }
};
export const addRemedies = async (pharmacyEmail, remedyName, quantity) => {
  try {
    const response = await axios.post(`${API_URL}/remedies/add`, {
      pharmacyEmail,
      remedyName,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error adding remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to add remedy",
    };
  }
};

// ✅ Update a remedy by ID
export const updateRemedies = async (pharmacyEmail, id, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/remedies/update/${pharmacyEmail}/${id}`,
      updateData
    );
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

// ✅ Get a remedy by ID
export const getRemedyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/remedies/get/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch remedy",
    };
  }
};

// ✅ Get all remedies
// export const getAllRemedies = async (pharmacyEmail) => {
//   try {
//     const response = await axios.get(`${API_URL}/remedies/getAll/${pharmacyEmail}`);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error fetching remedies:",
//       error.response?.data || error.message
//     );
//     return {
//       success: false,
//       message: error.response?.data?.message || "Failed to fetch remedies",
//     };
//   }
// };

// ✅ Delete a remedy by ID
export const deleteRemedyById = async (pharmacyEmail, id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/remedies/delete/${pharmacyEmail}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting remedy:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete remedy",
    };
  }
};

export const getOrdersByPharmacyIdAndOrderId = async (pharmacyId, orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/pharmacy/getallorder/${pharmacyId}/${orderId}`
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

export const getAllOrdersByPharmacyId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/pharmacy/getallorders/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching doctor:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const getAllPendingOrdersByPharmacyId = async (id, currentPage) => {
  try {
    const response = await axios.get(
      `${API_URL}/pharmacy/getallpendingorders/${id}?page=${currentPage}`
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

export const getAllCompletedOrdersByPharmacyEmail = async (id, currentPage) => {
  try {
    const response = await axios.get(
      `${API_URL}/pharmacy/getallcompletedorders/${id}?page=${currentPage}`
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

export const updatePaymentMethodByPharmacyEmail = async (paymentData) => {
  try {
    const response = await axios.get(
      `${API_URL}/pharmacy/updatepaymentmethod`,
      paymentData
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

export const updateOrder = async (orderData) => {
  try {
    const response = await axios.put(
      `${API_URL}/pharmacy/updateorder`,
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

// const fetchAllRemedies = async () => {
//   const pharmacyEmail = localStorage.getItem("pharmacyemail");
//   const res = await getAllRemedies(pharmacyEmail);
//   setFetchRemedies(res.remedies);
// };
