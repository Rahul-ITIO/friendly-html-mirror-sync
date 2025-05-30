import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

const UserForm = () => {
  const [emailDetails, setEmailDetails] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [editedEmailSubject, setEditedEmailSubject] = useState("");
  const [id, setId] = useState("");
  const [editedEmailBody, setEditedEmailBody] = useState("");
  const [editedAssignee, setEditedAssignee] = useState("");
  const [editedStatus, setEditedStatus] = useState("Open");
  const [editedUser, setEditedUser] = useState("");
  const [editedPriority, setEditedPriority] = useState("Low");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));

  // Function to retrieve email details from the server
  const retrieveEmailDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/ticket/fetch/all`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("admin-jwtToken"),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching email details:", error);
    }
  };
  //The filterEmailsByDateRange function filters an array of emailDetails based on a specified date range
  const filterEmailsByDateRange = () => {
    switch (dateRange) {
      case "today":
        return emailDetails.filter(
          (detail) =>
            new Date(detail.date).toDateString() === new Date().toDateString()
        );
      case "last7days":
        const last7days = new Date();
        last7days.setDate(last7days.getDate() - 7);
        return emailDetails.filter(
          (detail) => new Date(detail.date) >= last7days
        );
      case "last30days":
        const last30days = new Date();
        last30days.setDate(last30days.getDate() - 30);
        return emailDetails.filter(
          (detail) => new Date(detail.date) >= last30days
        );
      case "custom":
        const customDateValue = new Date(customDate);
        return emailDetails.filter(
          (detail) =>
            new Date(detail.date).toDateString() ===
            customDateValue.toDateString()
        );
      default:
        return emailDetails;
    }
  };
  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    if (value !== "custom") {
      setCustomDate(""); // Reset custom date when another option is selected
    }
  };

  const handleCustomDateChange = (e) => {
    setCustomDate(e.target.value);
  };
  // Effect hook to retrieve email details when component mounts
  useEffect(() => {
    const getAllEmailDetails = async () => {
      const emailResponse = await retrieveEmailDetails();
      if (emailResponse) {
        console.log(emailResponse);
        setEmailDetails(emailResponse.ticketDetails);
      }
    };

    getAllEmailDetails();
  }, []);

  // Function to handle edit button click
  const handleEditClick = (index = null) => {
    if (index !== null) {
      setEditRowIndex(index);
      setShowModal(true);
      setId(emailDetails[index].id);
      setEditedEmailSubject(emailDetails[index].subject);
      setEditedEmailBody(emailDetails[index].body);
      setEditedAssignee(emailDetails[index].assignee);
      setEditedStatus(emailDetails[index].status);
      setEditedUser(emailDetails[index].user);
      setEditedPriority(emailDetails[index].priority);
    } else {
      setEditRowIndex(null);
      setShowModal(true);
      setEditedEmailSubject("");
      setEditedEmailBody("");
      setEditedAssignee("");
      setEditedStatus("Open");
      setEditedUser("");
      setEditedPriority("Low");
    }
  };

  // Function to close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditRowIndex(null);
  };

  // Function to save changes
  const handleSaveChanges = async () => {
    try {
      const updatedEmailDetail = emailDetails.reduce(
        (acc, detail, editRowIndex) => {
          return {
            ...detail,
            id: id,
            date: "",
            updateDate: "",
            subject: editedEmailSubject,
            body: editedEmailBody,
            assignee: editedAssignee,
            status: editedStatus,
            user: editedUser,
            priority: editedPriority,
          };
        },
        {}
      );
      console.log(updatedEmailDetail);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/ticket/add`,
        updatedEmailDetail,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("admin-jwtToken"),
          },
        }
      );
      if (response.status === 200) {
        const updatedEmailDetails = emailDetails.map((detail, index) => {
          if (index === editRowIndex) {
            return {
              ...detail,
              subject: editedEmailSubject,
              body: editedEmailBody,
              assignee: editedAssignee,
              status: editedStatus,
              user: editedUser,
              priority: editedPriority,
            };
          } else {
            return detail;
          }
        });
        toast.success("Edit Ticket sucsessfully", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => { }, 1000);

        setEmailDetails(updatedEmailDetails);
        handleCloseModal();
      } else {
        toast.error("Edit Ticket Faild", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Error updating email details:", error);
      toast.error("Edit Ticket Faild", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Function to filter emails based on status and priority
  const filteredEmails = filterEmailsByDateRange().filter((detail) => {
    const statusMatches = statusFilter === "" || detail.status === statusFilter;
    const priorityMatches =
      priorityFilter === "" || detail.priority === priorityFilter;
    return statusMatches && priorityMatches;
  });
  return (

    <div className="container bg-white">
      <div >
        <div className="card-header custom-bg-text text-center">
          <h4 className=" text-color " >User Tickets</h4>
        </div>
        <div className="card-body" style={{ overflowY: "auto" }}>
          <div className="row">
            <div className="col">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Hold">Hold</option>
                <option value="In Progress">In Progress</option>
                <option value="Close">Close</option>
              </select>
            </div>
            <div className="col">
              <select
                id="priorityFilter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="form-select"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col">
              <select
                className="form-select"
                value={dateRange}
                onChange={handleDateRangeChange}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {dateRange === "custom" && (
              <div className="col">
                <input
                  type="date"
                  className="form-control"
                  value={customDate}
                  onChange={handleCustomDateChange}
                />
              </div>
            )}
          </div>
          <div className="table-responsive mt-3">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">User Name</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Status</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Last Replay</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((detail, index) => (
                  <tr key={index}>
                    <td>
                      <b>{detail.date}</b>
                    </td>
                    <td>
                      <b>{detail.userName}</b>
                    </td>
                    <td>
                      <b>{detail.subject}</b>
                    </td>
                    <td>
                      <b
                        style={{
                          color:
                            detail.status === "Close"
                              ? "green"
                              : detail.status === "Open"
                                ? "red"
                                : "orange",
                        }}
                      >
                        {detail.status}
                      </b>
                    </td>{" "}
                    <td>
                      <b>{detail.priority}</b>
                    </td>
                    <td>
                      <b>{detail.updateDate}</b>
                    </td>
                    <td>
                      &nbsp;<button className="btn btn-primary" onClick={() => handleEditClick(index)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ToastContainer />
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop-blur"></div>}
      <div className="modal" style={{ display: showModal ? "block" : "none", zIndex: 1050 }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editRowIndex !== null ? "Edit" : "Add"} Ticket
              </h5>
              &nbsp;<button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row g-2">
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="emailSubject" className="form-label">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="emailSubject"
                    value={editedEmailSubject}
                    onChange={(e) => setEditedEmailSubject(e.target.value)}
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="assignee" className="form-label">
                    Assignee
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="assignee"
                    value={editedAssignee}
                    onChange={(e) => setEditedAssignee(e.target.value)}
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-control form-select"
                    id="status"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Hold">Hold</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Close">Close</option>
                  </select>
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="user" className="form-label">
                    User
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="user"
                    value={editedUser}
                    onChange={(e) => setEditedUser(e.target.value)}
                  />
                </div>
                <div className="col-md-6 col-sm-12">
                  <label htmlFor="priority" className="form-label">
                    Priority
                  </label>
                  <select
                    className="form-control form-select"
                    id="priority"
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="col-md-12 col-sm-12">
                  <label htmlFor="emailBody" className="form-label">
                    Body
                  </label>
                  <textarea
                    className="form-control"
                    id="emailBody"
                    value={editedEmailBody}
                    onChange={(e) => setEditedEmailBody(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              &nbsp;<button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
              &nbsp;<button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveChanges}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
