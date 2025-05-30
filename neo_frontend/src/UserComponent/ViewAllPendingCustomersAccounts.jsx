//This React component, ViewAllPendingCustomerAccounts, is used to display and manage pending customer accounts. It fetches customer data from an API, allows viewing detailed information about each customer, and provides options to update their status
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ViewAllPendingCustomerAccounts = () => {
  const [allCustomer, setAllCustomer] = useState([]);
  const [users, setUsers] = useState("");
  const [editTransaction, setEditTransaction] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [updateUserStatusRequest, setUpdateUserStatusRequest] = useState({
    userId: "",
    status: "",
    currencyId: "",
  });

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  //retrieveAllCustomers and retrieveAllUsers are asynchronous functions that fetch data from the server. retrieveAllCustomers gets pending customer accounts, and retrieveAllUsers fetches user details
  const retrieveAllCustomers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/fetch/customerAccounts/pending/request`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
        },
      }
    );
    const users = await retrieveAllUsers();
    if (users) {
      setUsers(users.users);
    }
    console.log(response.data);
    return response.data;
  };

  const retrieveAllUsers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/fetch/role?role=CUSTOMER`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
        },
      }
    );
    console.log(response.data);
    return response.data;
  };
  //useEffect is used to run the getAllCustomers function once when the component mounts. This function fetches and sets customer and user data
  useEffect(() => {
    const getAllCustomers = async () => {
      const customers = await retrieveAllCustomers();
      if (customers) {
        customers.accounts.sort((a, b) => {
          const dateA = a.id;
          const dateB = b.id;

          return dateB - dateA; // For descending order (latest date first)
          // return dateB - dateA; // For descending order
        });
        setAllCustomer(customers.accounts);
      }
      const users = await retrieveAllUsers();
      if (users) {
        setUsers(users.users);
      }
    };

    getAllCustomers();
  }, []);
  //handleEditTransaction opens the modal and sets the state with the customer and user details to be edited
  const handleEditTransaction = (customer, user) => {
    console.log(customer, user);
    setEditTransaction({ customer: customer, user: user });
    console.log(editTransaction);
    setShowModal(true);
  };
  //handleCloseEditForm closes the modal and resets the editTransaction state.
  const handleCloseEditForm = () => {
    setEditTransaction("");
    setShowModal(false);
  };
  //handleStatusChange updates the status of the customer in the editTransaction state
  const handleStatusChange = (e) => {
    setEditTransaction((prevState) => ({
      ...prevState,
      customer: {
        ...prevState.customer,
        status: e.target.value,
      },
    }));
  };
  // handleSubmitEdit sends the updated data to the server and handles the response by showing success or error messages
  const handleSubmitEdit = (userId, e) => {
    updateUserStatusRequest.userId = editTransaction.customer.id;
    updateUserStatusRequest.status = editTransaction.customer.status;
    updateUserStatusRequest.currencyId = editTransaction.customer.currency;
    console.log(editTransaction.customer.status);

    fetch(`${process.env.REACT_APP_BASE_URL}/api/user/update/accountStatus`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify(updateUserStatusRequest),
    })
      .then((result) => {
        console.log("result", result);
        result.json().then((res) => {
          console.log(res);

          if (res.success) {
            console.log("Got the success response");

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
              window.location.reload(true);
            }, 1000); // Redirect after 3 seconds
          } else {
            console.log("Didn't got success response");
            toast.error("It seems server is down", {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              window.location.reload(true);
            }, 1000); // Redirect after 3 seconds
          }
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.reload(true);
        }, 1000); // Redirect after 3 seconds
      });
  };

  return (
    <div className="container">
      <div className="mt_2" style={{ display: showModal ? "none" : "block" }}>
        <div>
          <div className="card-header custom-bg-text text-center m-2">
            <h4 className=" text-color ">All Pending Cutsomers Accounts</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="table-responsive mt-3">
              <table className="table table-hover text-color text-start">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Contact</th>
                    {/* <th scope="col">Account Number</th> */}
                    <th scope="col">Currency</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomer.map((customer) => {
                    const user = users.find((u) => u.id == customer.userId);
                    return (
                      <tr>
                        <td>
                          <b>{user?.name || "N/A"}</b>
                        </td>
                        <td>
                          <b>{user?.email || "N/A"}</b>
                        </td>
                        <td>
                          <b>{user?.gender || "N/A"}</b>
                        </td>
                        <td>
                          <b>{user?.contact || "N/A"}</b>
                        </td>
                        {/* <td> */}
                        {/* <b>{customer.accountNumber}</b> */}
                        {/* </td> */}
                        <td>
                          <b>{customer?.currency || "N/A"}</b>
                        </td>
                        <td>
                          <b>{customer?.status || "N/A"}</b>
                        </td>
                        <td>
                          &nbsp;
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              handleEditTransaction(customer, user)
                            }
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <ToastContainer />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="mt_3 " style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="card  custom-bg border-color ">
              <div className="card-header custom-bg-text text-center">
                <h4 className=" text-color ">Account Details</h4>
              </div>
              <div className="modal-header p-4">
                <div className="col-md-6">
                  <h4>User Name: {editTransaction?.user?.name || ""}</h4>
                </div>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Assign Currency:</b>{" "}
                    {editTransaction?.customer?.currency || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Assign Account No:</b>{" "}
                    {editTransaction?.user?.accountNumber || "None"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Address:</b> {editTransaction?.user?.address || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Company Name:</b>{" "}
                    {editTransaction?.user?.companyName || "None"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Company Address:</b>{" "}
                    {editTransaction?.user?.companyAddress || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Pin code:</b> {editTransaction?.user?.pincode || "None"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Contact Number:</b>{" "}
                    {editTransaction?.user?.contact || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Email:</b> {editTransaction?.user?.email || "None"}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Place Of Birth:</b>{" "}
                    {editTransaction?.user?.placeOfBirth || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Date Of Birth:</b>{" "}
                    {editTransaction?.user?.dateOfBirth || "None"}
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="status me-2">
                    <b>Status:</b>{" "}
                  </div>
                  <div className="status-value w-100" style={{ maxWidth: "200px" }}>
                    <select
                      className="form-select"
                      value={editTransaction?.customer?.status || "None"}
                      onChange={handleStatusChange}
                    >
                      <option value="Success">Success</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <div >
                    &nbsp;
                    <button
                      type="button"
                      style={{ marginRight: "10px" }}
                      className="btn btn-primary"
                      onClick={handleCloseEditForm}
                    >
                      Close
                    </button>
                    &nbsp;
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmitEdit}
                    >
                      Save changes
                    </button>
                  </div>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ViewAllPendingCustomerAccounts;
