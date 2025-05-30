//The overall purpose of this component is to provide a user interface for viewing, adding, and editing fee details. It retrieves data from an API, handles user interactions, and displays a modal form for adding or editing fee details
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AddFeeDetail from "../FeeDetailComponent/AddFeeDetail";

const ViewFeeDetail = () => {
   // State to control the modal visibility
  const [showModal, setShowModal] = useState(false);
  // State to store fee details retrieved from the API
  const [feeDetails, setFeeDetails] = useState([]);
  // State to store the currently selected fee detail for editing
  const [selectedFeeDetail, setSelectedFeeDetail] = useState(null);
  // Retrieve JWT token for authorization from session storage
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  
// Function to retrieve fee details from the server
  const retrieveFeeDetails = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/fee/detail/fetch/all`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken,
        },
      }
    );
    console.log(response.data);
    return response.data;
  };
// useEffect hook to fetch all fee details when the component mounts
  useEffect(() => {
    const getAllFeeDetails = async () => {
      const feeResponse = await retrieveFeeDetails();
      if (feeResponse) {
        setFeeDetails(feeResponse.feeDetails);
      }
    };

    getAllFeeDetails();// Call the function to fetch fee details
  }, []);
 // Function to handle the edit button click
  const handleEdit = (feeDetail) => {
    setSelectedFeeDetail(feeDetail);
    setShowModal(true);
  };
 // Function to handle the add button click
  const handleAdd = () => {
    setSelectedFeeDetail(null);
    setShowModal(true);
  };

  return (
    <div className="container">
      <div style={{ display: showModal ? "none" : "block" }}>
        <div >
          <div className="card-header custom-bg-text text-center">
            <h4 className=" text-primary" >Fee Details</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="table-responsive mt-3">
              <h3>Added Fee Details</h3>
              <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary"
                
                onClick={handleAdd}
              >
                ADD <FaPlus />
              </button>
              </div>
              
              <table className="table table-hover text-color text-center">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">Fee type</th>
                    <th scope="col">Fee %</th>
                    <th scope="col">Fee Minimum Amount</th>
                    <th scope="col">Edit Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {feeDetails.map((detail) => (
                    <tr key={detail.id}>
                      <td><b>{detail.type}</b></td>
                      <td><b>{detail.fee}</b></td>
                      <td><b>{detail.feeAmount}</b></td>
                      <td>
                        &nbsp;<button
                          className="btn btn-primary me-2"
                          onClick={() => handleEdit(detail)}
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <AddFeeDetail
          feeDetail={selectedFeeDetail}
          closeModal={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ViewFeeDetail;
