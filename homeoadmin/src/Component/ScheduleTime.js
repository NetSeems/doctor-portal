import React, { useState, useEffect } from "react";
import "../Style/ScheduleTime.css";
import {
  updateDoctor,
  getDoctorSchedule,
  updateDoctorSchedule,
  updateDoctorScheduleSlot,
  getDoctorTimeSlots,
} from "../backend.js";
import { useAuth } from "./UserContext.js";
import { MdKeyboardArrowDown } from "react-icons/md";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";

const ScheduleTime = () => {
  const { currentDoctor } = useAuth();
  const today = new DateObject();
  const [selectedDates, setSelectedDates] = useState([]);
  const [view, setView] = useState("show");
  const [schedules, setSchedules] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workingStartTime, setWorkingStartTime] = useState("");
  const [workingEndTime, setWorkingEndTime] = useState("");
  const [lunchEndTime, setLunchEndTime] = useState("");
  const [lunchStartTime, setLunchStartTime] = useState("");
  const [email, setEmail] = useState("");
  const [locations, setLocations] = useState([]);
  const [showLocation, setShowLocations] = useState("");
  const [selectedTime, setSelectedTime] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedLocation, setSelectedLocations] = useState("Select Location");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("active");
  const [timeSlots, setTimeSlots] = useState([]);
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [todayDate, setTodayDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    if (view === "show") {
      fetchSchedules();
    }
  }, [view]);
  useEffect(() => {
    if (currentDoctor) {
      setLocations(currentDoctor.doctor.locations);
    }
  }, []);
  useEffect(() => {
    if (currentDoctor) {
      fetchDoctorTimeSlots(currentDoctor.doctor.email, date, selectedLocation);
    }
  }, [selectedLocation, date]);
  const fetchDoctorTimeSlots = async (email, date, selectedLocation) => {
    try {
      const response = await getDoctorTimeSlots(email, date, selectedLocation);
      if (!response) {
        setTimeSlots([]);
      }
      // setStartDate(formatDateForInput(response.schedule[0].startDate));
      const slots = response.slots;
      const disabled = slots
        .filter(
          (slot) => slot.status === "booked" || slot.status === "unavailable"
        )
        .map((slot) => slot.time);
      setTimeSlots(slots);
      setDisabledSlots(disabled);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}`;
  };
  let filteredLocation = [];
  if (currentDoctor) {
    filteredLocation = locations?.filter((p) =>
      p.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  const fetchSchedules = async () => {
    try {
      const response = await getDoctorSchedule(currentDoctor?.doctor._id);
      setSchedules(response.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    const updateData = {
      location: selectedLocation,
      date: date,
      time: selectedTime,
      status,
    };

    try {
      const res = await updateDoctorScheduleSlot(
        currentDoctor?.doctor._id,
        updateData
      );
      if (res) {
        alert("Schedule updated successfully!");
      }
      setDate("");
      setSelectedTime("");
      setSelectedLocations("Select Location");
      setStatus("available");
    } catch (error) {
      alert("Failed to update schedule.");
    }
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Ensure start time is before end time
    if (workingStartTime >= workingEndTime) {
      alert("Start time must be before end time!");
      return;
    }

    const updateData = {
      schedule: [
        {
          location: selectedLocation,
          dates: selectedDates.map((date) => date.format("DD-MM-YYYY")),
          startWorkingHour: workingStartTime,
          endWorkingHour: workingEndTime,
          lunchBreak: { start: lunchStartTime, end: lunchEndTime },
        },
      ],
    };
    try {
      const response = await updateDoctor(
        currentDoctor?.doctor._id,
        updateData
      );
      if (response) {
        alert("Schedule saved successfully!");
        setSelectedDates("");
        setWorkingStartTime("");
        setWorkingEndTime("");
        setLunchStartTime("");
        setLunchEndTime("");
      }
    } catch (error) {
      console.error(
        "Error updating schedule:",
        error.response?.data || error.message
      );
      alert("Failed to save schedule. Please try again.");
    }
  };
  return (
    <div className="schedule-main-container">
      <div className="tab-buttons">
        <button
          style={{
            backgroundColor: view === "show" ? "var(--primary)" : "",
            color: view === "show" ? "#fff" : "",
            borderRadius: view === "show" ? "10px" : "",
          }}
          onClick={() => setView("show")}
        >
          Show Schedule
        </button>
        <button
          style={{
            backgroundColor: view === "set" ? "var(--primary)" : "",
            color: view === "set" ? "#fff" : "",
            borderRadius: view === "set" ? "10px" : "",
          }}
          onClick={() => setView("set")}
        >
          Set Schedule
        </button>
        <button
          style={{
            backgroundColor: view === "update" ? "var(--primary)" : "",
            color: view === "update" ? "#fff" : "",
            borderRadius: view === "update" ? "10px" : "",
          }}
          onClick={() => setView("update")}
        >
          Update Schedule
        </button>
      </div>

      {view === "show" && (
        <table className="orders-table15">
          <thead>
            <tr className="table-header16">
              <th>Location</th>
              <th>Dates</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Lunch Time</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule, index) => (
              <tr key={index} className="table-row18">
                <td>{schedule.location}</td>
                <td>
                  {schedule.workingDates
                    .slice() // create a shallow copy to avoid mutating original array
                    .sort((a, b) => new Date(a.date) - new Date(b.date)) // sort ascending
                    .map((date, index) => (
                      <span key={index}>
                        {formatDate(date.date)}
                        {index !== schedule.workingDates.length - 1 ? ", " : ""}
                      </span>
                    ))}
                </td>
                <td>{schedule.startTime}</td>
                <td>{schedule.endTime}</td>
                <td>{schedule.lunchTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {view === "set" && (
        <form onSubmit={handleFormSubmit} className="form-data-add">
          <div className="custom-dropdown-container-1">
            <label>Select Location</label>
            <div className="custom-dropdown-container">
              {showLocation ? (
                <input
                  type="text"
                  placeholder="Search Location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              ) : (
                <p>{selectedLocation}</p>
              )}
              <MdKeyboardArrowDown
                size={25}
                onClick={() => {
                  setShowLocations(!showLocation);
                }}
                style={{
                  transform: showLocation ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>
            {showLocation && (
              <div
                className="custom-dropdown-container-drop"
                style={{ top: "210px", width: "33%" }}
              >
                {filteredLocation.length > 0 ? (
                  filteredLocation.map((p, idx) => (
                    <p
                      key={idx}
                      onClick={() => {
                        setSelectedLocations(p);
                        setShowLocations(false);
                        setSearchTerm("");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p>No Location found</p>
                )}
              </div>
            )}
          </div>
          {/* <div>
            <label>Select Date:</label>
            <input
              type="date"
              value={startDate}
              min={todayDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div> */}
          <div>
            <label>Select Dates:</label>
            <DatePicker
              multiple
              value={selectedDates}
              onChange={setSelectedDates}
              format="DD-MM-YYYY"
              minDate={today}
              style={{ width: "96%" }}
            />
          </div>
          <div>
            <label>Working Start Time:</label>
            <input
              type="time"
              value={workingStartTime}
              onChange={(e) => setWorkingStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Working End Time:</label>
            <input
              type="time"
              value={workingEndTime}
              onChange={(e) => setWorkingEndTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Lunch Start Time:</label>
            <input
              type="time"
              value={lunchStartTime}
              onChange={(e) => setLunchStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Lunch End Time:</label>
            <input
              type="time"
              value={lunchEndTime}
              onChange={(e) => setLunchEndTime(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-data-btn">
            Schedule Time
          </button>
        </form>
      )}

      {view === "update" && (
        <form onSubmit={handleUpdateSubmit} className="form-data-add">
          <div className="custom-dropdown-container-1">
            <label>Select Location</label>
            <div className="custom-dropdown-container">
              {showLocation ? (
                <input
                  type="text"
                  placeholder="Search Location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              ) : (
                <p>{selectedLocation}</p>
              )}
              <MdKeyboardArrowDown
                size={25}
                onClick={() => {
                  setShowLocations(!showLocation);
                }}
                style={{
                  transform: showLocation ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>
            {showLocation && (
              <div
                className="custom-dropdown-container-drop"
                style={{ top: "210px", width: "33%" }}
              >
                {filteredLocation.length > 0 ? (
                  filteredLocation.map((p, idx) => (
                    <p
                      key={idx}
                      onClick={() => {
                        setSelectedLocations(p);
                        setShowLocations(false);
                        setSearchTerm("");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p>No Location found</p>
                )}
              </div>
            )}
          </div>
          <div>
            <label>Select Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayDate}
              required
            />
          </div>
          <div id="time-slots">
            {timeSlots === null || timeSlots.length === 0 ? (
              <p
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--primary)",
                  fontWeight: "bolder",
                  marginTop: "30px",
                }}
              >
                No schedule found for selected date.
              </p>
            ) : (
              timeSlots.map((slot, index) => {
                const isDisabled =
                  slot.status === "booked" || slot.status === "unavailable";
                const tooltipMessage =
                  slot.status === "booked"
                    ? "This slot is already booked"
                    : slot.status === "unavailable"
                    ? "This slot is unavailable"
                    : "";
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedTime(slot.time)}
                    className={`slot-btn ${
                      selectedTime === slot.time ? "selected" : ""
                    } ${isDisabled ? "disabled-slot" : ""}`}
                    title={tooltipMessage}
                  >
                    {slot.time}
                  </button>
                );
              })
            )}
          </div>
          <div>
            <label>Status: </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="booked">Booked</option>
            </select>
          </div>
          <button type="submit">Update Schedule</button>
        </form>
      )}
    </div>
  );
};

export default ScheduleTime;
