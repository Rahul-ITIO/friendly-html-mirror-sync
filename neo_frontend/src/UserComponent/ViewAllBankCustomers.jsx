import { useState, useEffect } from "react";
import { toast } from "react-toastify";// For displaying notifications
import "react-toastify/dist/ReactToastify.css";// Toastify CSS for styling notifications
import { useNavigate } from "react-router-dom";// For navigation between routes
import axios from "axios";// For making HTTP requests
import { FaEdit } from "react-icons/fa";// Import the edit icon from Font Awesome
import UserProfileUpdate from "../UserComponent/UserProfileUpdate";// Import the component for editing user profiles
import '../new-dash.css';

const ViewAllBankCustomers = () => {
  let navigate = useNavigate();// Hook for navigation
  const [allCustomer, setAllCustomer] = useState([]);// State to store the list of all customers
  const [customerName, setCustomerName] = useState("");// State for storing the search term
  const [editTransaction, setEditTransaction] = useState(null);// State for storing the customer to be edited
  const [showModal, setShowModal] = useState(false);// State to control the visibility of the edit modal

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");// Retrieve JWT token for authorization
  
   // Function to fetch customers by name
  const retrieveBankAllCustomerByName = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/all/customer/search?customerName=${customerName}`,
      {
        headers: {
          Authorization: `Bearer ${admin_jwtToken}`,
        },
      }
    );
    return response.data;// Return the data from the API response
  };
  
// Function to fetch all customers
  const retrieveAllCustomers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/fetch/role?role=CUSTOMER`,
      {
        headers: {
          Authorization: `Bearer ${admin_jwtToken}`,
        },
      }
    );
    return response.data;// Return the data from the API response
  };
// useEffect to fetch customers based on the search term or fetch all customers if the search term is empty
  useEffect(() => {
    if (customerName !== "") {
      // Fetch customers by name if search term is provided
      const getAllCustomersByName = async () => {
        const customers = await retrieveBankAllCustomerByName();
        if (customers) {
          setAllCustomer(customers.users);// Update state with fetched customers
        }
      };
      getAllCustomersByName();
    } else {
      // Fetch all customers if search term is empty
      const getAllCustomers = async () => {
        const customers = await retrieveAllCustomers();
        // if (customers) {
        //   setAllCustomer(customers.users);
        // }
        if (customers) {
          let users=customers.users
          // Sort customers by ID in descending order
          users.sort((a, b) => {
            const dateA = a.id;
            const dateB = b.id;
    
            return dateB - dateA; // For descending order (latest date first)
            // return dateB - dateA; // For descending order
          });
          setAllCustomer(users);  // Update state with fetched customers
          }
      };
      getAllCustomers();
    }
  }, [customerName]);// Dependency array includes customerName to refetch data when it changes
  
// Function to close the edit form modal
  const handleCloseEditForm = () => {
    setEditTransaction("");// Clear the customer data
    setShowModal(false);// Hide the modal
  };
 // Function to handle form submission for updating user profile
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
          window.location.reload(true);// Reload the page to reflect changes
          handleCloseEditForm();// Close the modal
        }, 1000);
      } else {
        toast.error("Failed to update profile. Unexpected status code.");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again later.");
    }
  };
 // Function to handle edit button click
  const handleEdit = (customer) => {
    setEditTransaction(customer);
    setShowModal(true);
  };
// Function to handle back button click in the modal
  const handleBackClick = () => {
    setShowModal(false);
  };

  return (
    <div className="container">
      <div  style={{ display: showModal ? "none" : "block" }}>
        <div className="">
          <div className="text-center">
            <h4 className="text-color">All Bank Customers</h4>
          </div>
          <div className="card-body" style={{ overflowY: "auto" }}>
            <div className="table-responsive mt-3">
              <table className="table table-hover text-start">
                <thead className="table-bordered border-color bg-color">
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
