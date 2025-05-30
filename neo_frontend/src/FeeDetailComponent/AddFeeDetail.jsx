//This component provides a user interface for admins to manage fee details, including adding new ones or editing existing entries. It uses axios for data fetching and react-toastify for user notifications.
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
// Component for adding or editing fee details
const AddFeeDetail = (obj, closeModal) => {
  let navigate = useNavigate();
// State to manage form data
  const [feeRequest, setFeeRequest] = useState({
    type: "",
    fee: "",
    feeAmount: "",
  });
// // State to store fee types fetched from the server
  const [feeTypes, setFeeTypes] = useState([]);
 // Retrieve JWT token and admin data from session storage
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const admin = JSON.parse(sessionStorage.getItem("active-admin"));
  // Handle input changes in the form
  const handleUserInput = (e) => {
     // Initialize form with existing fee details or default values
    setFeeRequest({
      ...feeRequest,
      [e.target.name]: e.target.value,
    });
  };
 // Function to retrieve all fee types from the server
  const retrieveAllFeeType = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/fee/detail/type`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
        },
      }
    );

    return response.data;
  };
   // Function to close the form and navigate to the view page
  const handleClose = (e) => {
    window.location.href = "/admin/fee/detail/view";
  };
  // Function to retrieve all fee details from the server
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
    return response.data.feeDetails;
  };
   // Effect to run on component mount
  useEffect(() => {
    const getAlltypes = async () => {
      // Fetch existing fee details and fee types
      const feeResponse = await retrieveFeeDetails();
      const types = await retrieveAllFeeType();
      console.log(feeResponse);
       // Filter out fee types that already exist
      const feeDetailTypes = feeResponse.map((detail) => detail.type);
      const filteredTypes = types.filter(
        (type) => !feeDetailTypes.includes(type)
      );
      // Set fee types in the state
      if (filteredTypes.length > 0) {
        setFeeTypes(filteredTypes);
      }
      setFeeRequest(
        obj?.feeDetail || {
          type: "",
          fee: "",
          feeAmount: "",
        }
      );
    };
    console.log(obj.feeDetail);
    getAlltypes();
  }, []);
// Function to handle form submission for adding/editing fee details
  const addFeeDetail = (e) => {
    if (feeRequest.type === "") {
      toast.error("Select Fee Type", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      // Make API request to add or update fee details
      fetch(`${process.env.REACT_APP_BASE_URL}/api/fee/detail/add`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + admin_jwtToken,// Use JWT token for authorization
        },
        body: JSON.stringify(feeRequest),
      })
        .then((result) => {
          result.json().then((res) => {
            if (res.success) {
               // Show success message and redirect
              toast.success(res.responseMessage, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setTimeout(() => {
                window.location.href = "/admin/fee/detail/view";
              }, 1000);  // Redirect after 1 second
            } else {
              // Show error message if the response is not successful
              console.log("Didn't got success response");
              toast.error(res.responseMessage, {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          });
        })
        .catch((error) => {
          console.error(error);
          // Show error message if there's a server issue
          toast.error("It seems server is down", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        });
    }

    e.preventDefault();
  };

  return (
    <div>
      <div className="mt_3 d-flex aligns-items-center justify-content-center">
        <div
          className="card form-card border-color custom-bg"
          style={{ width: "25rem" }}
        >
          <div className="card-header text-center custom-bg-text "
          style={{ height: "15%" }}>
            <h4 className="text-color ">
              {obj.feeDetail !== null ? "Edit" : "Add"} Fee Detail
            </h4>
          </div>
          <div className="card-body">
            <form>
              <div
                class="mb-3 text-color"
                style={{ display: obj.feeDetail !== null ? "none" : "block" }}
              >
                <label for="role" class="form-label">
                  <b>Fee Type</b>
                </label>
                <select
                  onChange={handleUserInput}
                  className="form-control"
                  name="type"
                  value={feeRequest.type}
                >
                  <option value="">Select Fee Type</option>
                  {feeTypes.map((type) => {
                    return <option value={type}>{type}</option>;
                  })}
                </select>
              </div>
              <div className="mb-3 text-color">
                <label for="beneficiaryName" class="form-label">
                  <b>Fee %</b>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="fee"
                  name="fee"
                  onChange={handleUserInput}
                  value={feeRequest.fee}
                  required
                />
              </div>
              <div className="mb-3 text-color">
                <label for="beneficiaryName" class="form-label">
                  <b>Minimum Fee Amount</b>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="feeAmount"
                  name="feeAmount"
                  onChange={handleUserInput}
                  value={feeRequest.feeAmount}
                  required
                />
              </div>
              &nbsp;
              <button
                type="submit"
                onClick={handleClose}
                className="btn bg-color custom-bg-text"
              >
                close
              </button>
              &nbsp; &nbsp;
              <button
                type="submit"
                className="btn bg-color custom-bg-text"
                onClick={addFeeDetail}
              >
                Save
              </button>
              <ToastContainer />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeeDetail;
