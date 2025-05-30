import { Link } from "react-router-dom";
import profileIcon from "../images/profileIcon.png";
import signOutIcon from "../images/signOut.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const ProfileHeader = ({toggleSidebar}) => {
  const navigate = useNavigate();
   // Retrieve active user, admin, and bank information from session storage
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  const admin = JSON.parse(sessionStorage.getItem("active-admin"));
  const bank = JSON.parse(sessionStorage.getItem("active-bank"));
   // State variables for controlling dropdown visibility and storing account data
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);

 // Function to toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  // Function to handle sign out action
  const handleSignOut = () => {
    // Show a success toast notification on successful logout
    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    sessionStorage.removeItem("active-customer");
    sessionStorage.removeItem("customer-jwtToken");
    sessionStorage.removeItem("active-bank");
    sessionStorage.removeItem("bank-jwtToken");
    sessionStorage.removeItem("active-admin");
    sessionStorage.removeItem("admin-jwtToken");
     // Reload the page after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
     // Navigate to the home page
    navigate("/");
  };
   // Function to fetch account data from the server
  const fetchAccountData = async () => {
    try {
       // Make a GET request to the server to fetch account data for the logged-in customer
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${customer.id}`
      );
      // Update the account state with the fetched data
      setAccounts(response.data.accounts);
    } catch (error) {
      // Handle error
      console.error("Error fetching account data:", error);
      // Notify error
      toast.error("Failed to fetch account data", {
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
  if (customer) {
    // fetchAccountData();
    return (
      <div className="dropdown nav-items ">
        &nbsp;<button
          className="nav-link active"
          aria-current="page"
          onClick={toggleDropdown}
        >
          <b className="h-text nav-items a">
            {customer.firstName} {customer.lastName}
          </b>
          <img
            src={profileIcon}
            width="35"
            height="35"
            className="d-inline-block align-right nav-items"
            alt=""
          />
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu " aria-labelledby="dropdownMenuButton">
            <Link className="dropdown-item" to="/customer/profile"  onClick={toggleSidebar} > 
              Profile
            </Link>
            <Link className="dropdown-item" to={`/customer/security/${customer.id}`} onClick={toggleSidebar}>
            Security
          </Link>
            <button className="dropdown-item" onClick={handleSignOut}>
              Sign Out
              &nbsp;<FontAwesomeIcon icon={faSignOutAlt} className="ml-2" />
            </button>
          </div>
        )}
      </div>
    );
  } else if (admin || bank) {
    return (
      <div className="row">
        {/* <div className="col dropdown">
          <Link
            to="/Admin/Currency/AdminAccount"
            className="nav-link active"
            aria-current="page"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="icon" />
            &nbsp;<b className="text-color">Admin Account</b>
          </Link>
        </div>
        <div className="col dropdown">
          <Link
            to="/Admin/Currency/EditHostDetailsPage"
            className="nav-link active"
            aria-current="page"
          >
            <FontAwesomeIcon icon={faCheckCircle} className="icon" />
            &nbsp;<b className="text-color">Hosting  Details </b>
          </Link>
        </div> */}
        <div className="col dropdown">
         <button onClick={handleSignOut}>
            <b className="sidebar-text " style={{ marginRight: "5px" }}>
              Sign Out
            </b>
            <FontAwesomeIcon icon={faSignOutAlt} className="ml-2 sidebar-text" />
          </button>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default ProfileHeader;
