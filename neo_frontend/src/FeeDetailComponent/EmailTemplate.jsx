import React, { useState, useEffect } from "react";
import axios from "axios";
const EmailTemplate = () => {
   // State to store email details fetched from the server
  const [emailDetails, setEmailDetails] = useState([]);
  // State to track which row (index) is currently being edited
  const [editRowIndex, setEditRowIndex] = useState(null);
   // State to show or hide the modal for editing/adding templates
  const [showModal, setShowModal] = useState(false);
  // State to store the subject of the email being edited/added
  const [editedEmailSubject, setEditedEmailSubject] = useState("");
   // State to store the message of the email being edited/added
  const [editedEmailMessage, setEditedEmailMessage] = useState("");
  // State to store the code of the email being edited/added
  const [editedCode, setEditedCode] = useState("");
  
// Retrieve JWT token for authentication from session storage
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
 // Function to fetch email templates from the server
  const retrieveEmailDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/fee/detail/fetch/emailTemp/all`,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching email details:", error);
    }
  };
// Fetch email details when the component is first mounted
  useEffect(() => {
    const getAllEmailDetails = async () => {
      const emailResponse = await retrieveEmailDetails();
      if (emailResponse) {
        setEmailDetails(emailResponse.emailTempDetails);
      }
    };

    getAllEmailDetails();
  }, []);
// Function to handle clicking the "Edit" button or "Add" button
  const handleEditClick = (index = null) => {
    console.log("Edit button clicked for index:", index);
    if (index !== null) {
      // Editing existing template
      setEditRowIndex(index);
      setShowModal(true);
      // Set initial values for editing
      setEditedEmailSubject(emailDetails[index].emailSubject);
      setEditedEmailMessage(emailDetails[index].emailMessage);
      setEditedCode(emailDetails[index].code);
    } else {
      // Adding new template
      setEditRowIndex(null);
      setShowModal(true);
      // Set initial values for adding (email code fixed)
      setEditedEmailSubject("");
      setEditedEmailMessage("");
      setEditedCode(""); // Set your fixed email code here
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditRowIndex(null);
  };

  const handleSaveChanges = async () => {
    try {
      // Create a new object with the updated values
      const updatedEmailDetail = {
        emailSubject: editedEmailSubject,
        emailMessage: editedEmailMessage,
        code: editedCode,
      };
  
      // POST request to save changes
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/fee/detail/update/emailTemp`,
        updatedEmailDetail, // Send only the updated detail object
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      if (response.status === 200) {
        const updatedEmailDetails = emailDetails.map((detail, index) => {
          if (index === editRowIndex) {
            return {
              ...detail,
              emailSubject: editedEmailSubject,
              emailMessage: editedEmailMessage,
              code: editedCode,
            };
          } else {
            return detail;
          }
        });
        setEmailDetails(updatedEmailDetails);
      }
      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error updating email details:", error);
      // You can handle the error here, e.g., display an error message to the user
    }
  };

  return (
   
      <div className="container">
          <div className="card-header custom-bg-text text-center">
            <h4 className=" text-color " >Email Templates</h4>
          </div>
          <div >
            <div className="table-responsive mt-3">
              <table className="table table-hover text-color text-center">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">Email Subject</th>
                    <th scope="col">Email Message</th>
                    <th scope="col">Code</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emailDetails.map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.emailSubject}</td>
                      <td>{detail.emailMessage}</td>
                      <td>{detail.code}</td>
                      <td>
                        &nbsp;<button className="btn btn-primary" onClick={() => handleEditClick(index)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      </div>
      {/* <div className="text-center mb-3">
        &nbsp;<button className="btn btn-primary" onClick={() => handleEditClick()}>Add Template</button>
      </div> */}
      {editRowIndex !== null && (
        <div className="modal modal-overlay" style={{ display: showModal ? "block" : "none" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editRowIndex !== null ? "Edit" : "Add"} Email Template</h5>
                &nbsp;<button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="emailSubject" className="form-label">Email Subject</label>
                  <input type="text" className="form-control" id="emailSubject" value={editedEmailSubject} onChange={(e) => setEditedEmailSubject(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="emailMessage" className="form-label">Email Message</label>
                  <textarea className="form-control" id="emailMessage" value={editedEmailMessage} onChange={(e) => setEditedEmailMessage(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="code" className="form-label">Code</label>
                  <input type="text" className="form-control" id="code" value={editedCode} onChange={(e) => setEditedCode(e.target.value)} disabled={editRowIndex !== null} />
                </div>
              </div>
              <div className="modal-footer">
                &nbsp;<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
                &nbsp;<button type="button" className="btn btn-primary" onClick={handleSaveChanges}>
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplate;
