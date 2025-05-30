//This component effectively manages and displays pending customers, allowing administrators to approve or reject user requests while handling errors gracefully and providing user feedback.
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewAllPendingCustomers = () => {
  let navigate = useNavigate();
  const [allCustomer, setAllCustomer] = useState([]);
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const retrieveAllCustomers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/customer/pending/request`,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      return { users: [] };
    }
  };

  useEffect(() => {
    const getAllCustomers = async () => {
      const customers = await retrieveAllCustomers();
      if (customers) {
        let users=customers.users
        users.sort((a, b) => {
          const dateA = a.id;
          const dateB = b.id;

          return dateB - dateA; // For descending order (latest date first)
          // return dateB - dateA; // For descending order
        });
        setAllCustomer(users);
      }
    };
    getAllCustomers();
  }, []);

  const handleUserStatusUpdate = async (userId, status) => {
    const updateUserStatusRequest = { userId, status };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/user/update/status`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + admin_jwtToken,
          },
          body: JSON.stringify(updateUserStatusRequest),
        }
      );
      const res = await response.json();
      if (res.success) {
        toast.success(res.responseMessage, {
          position: "top-center",
          autoClose: 1000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("It seems server is down", {
        position: "top-center",
        autoClose: 1000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
 // Function to approve a user
  const approveUser = (userId) => {
    handleUserStatusUpdate(userId, "Active");
  };
// Function to reject a user
  const rejectUser = (userId) => {
    handleUserStatusUpdate(userId, "Reject");
  };

  return (
    <div className="container">
      <div className="mt_2">
        <div >
          <div className="card-header custom-bg-text text-center m-2">
            <h4 className=" text-color ">All Pending Customers</h4>
          </div>

          {/* For Showing  Massege   */}
          <div className="card-body" style={{ overflowY: "auto" }}>
            {allCustomer.length === 0 ? (
              <div className="text-center mt-3">
                <h4 className=" text-color ">No pending customers found</h4>
              </div>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-hover text-color text-start">
                  <thead className="table-bordered border-color bg-color custom-bg-text">
                    <tr>
                      <th scope="col">Customer Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Gender</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Country</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCustomer.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <b>{customer.name}</b>
                        </td>
                        <td>
                          <b>{customer.email}</b>
                        </td>
                        <td>
                          <b>{customer.gender}</b>
                        </td>
                        <td>
                          <b>{customer.contact}</b>
                        </td>
                        <td>
                          <b>{customer.country}</b>
                        </td>
                        <td>
                          <b>{customer.status}</b>
                        </td>
                        <td>
                          &nbsp;
                          <button
                            onClick={() => rejectUser(customer.id)}
                            className="btn btn-sm bg-danger text-white ms-2"
                          >
                            Reject
                          </button>
                          &nbsp;
                          <button
                            onClick={() => approveUser(customer.id)}
                            className="btn btn-sm bg-success text-white ms-2"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ViewAllPendingCustomers;
