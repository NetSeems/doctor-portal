import React from "react";
import "../Style/Loading.css";

const Loading = () => {
  return (
    <div className="loadingOverlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Loading;