import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import UserProfileUpdate from "../UserComponent/UserProfileUpdate";

const ViewAllBankCustomers = () => {
  let navigate = useNavigate();
  const [allCustomer, setAllCustomer] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [editTransaction, setEditTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const retrieveBankAllCustomerByName = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/all/customer/search?customerName=${customerName}`,
      {
        headers: {
          Authorization: `Bearer ${admin_jwtToken}`,
        },
      }
    );
    return response.data;
  };

  const retrieveAllCustomers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/fetch/role?role=CUSTOMER`,
      {
        headers: {
          Authorization: `Bearer ${admin_jwtToken}`,
        },
      }
    );
    return response.data;
  };

  useEffect(() => {
    if (customerName !== "") {
      const getAllCustomersByName = async () => {
        const customers = await retrieveBankAllCustomerByName();
        if (customers) {
          setAllCustomer(customers.users);
        }
      };
      getAllCustomersByName();
    } else {
      const getAllCustomers = async () => {
        const customers = await retrieveAllCustomers();
        if (customers) {
          setAllCustomer(customers.users);
        }
      };
      getAllCustomers();
    }
  }, [customerName]);

  const handleCloseEditForm = () => {
    setEditTransaction("");
    setShowModal(false);
  };

  const handleSubmitEdit = async (e) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/user/update-profile`,
        editTransaction
      );
      if (response.status === 200) {
        toast.success("Profile updated successfully.", {
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
          handleCloseEditForm();
        }, 1000);
      } else {
        toast.error("Failed to update profile. Unexpected status code.");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again later.");
    }
  };

  const handleEdit = (customer) => {
    setEditTransaction(customer);
    setShowModal(true);
  };

  const handleBackClick = () => {
    setShowModal(false);
  };

  return (
    <div className="container">
      <div className="mt_2" style={{ display: showModal ? "none" : "block" }}>
        <div className="card" style={{ height: "45rem" }}>
          <div className="card-header custom-bg-text text-center">
            <h4 className="text-color">All Bank Customers</h4>
          </div>
          <div className="card-body" style={{ overflowY: "auto" }}>
            <div className="table-responsive mt-3">
              <table className="table table-hover text-color text-start">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                  <th scope="col">Customer ID</th>
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
                      <td><b>{customer.id}</b></td>
                      <td><b>{customer.name}</b></td>
                      <td><b>{customer.email}</b></td>
                      <td><b>{customer.gender}</b></td>
                      <td><b>{customer.contact}</b></td>
                      <td><b>{customer.country}</b></td>
                      <td><b>{customer.status}</b></td>
                      <td>
                        <button
                          className="btn btn-primary me-2"
                          onClick={() => handleEdit(customer)}
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
        <div>
          <UserProfileUpdate userId={editTransaction.id} handleClose={handleCloseEditForm} />

        </div>    

      )}
    </div>
  );
};

export default ViewAllBankCustomers;
