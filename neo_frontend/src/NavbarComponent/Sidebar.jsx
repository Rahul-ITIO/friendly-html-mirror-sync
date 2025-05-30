import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faTachometerAlt,
    faSignOutAlt,
    faCog,
    faUser,
    faBank,
    faCreditCard, } from "@fortawesome/free-solid-svg-icons"; // Import specific icons
import "./Sidebar.css"; // Import CSS styles

const Sidebar = ({onMenuClick}) => {

     const navigate = useNavigate();

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
         // Navigate to the root URL
        navigate("/");
    };
    
  return (
    <div className="sidebar first-left-panel ">
       
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 me-5">
            <li onClick={() => onMenuClick("bank")}>
                <Link to="/home" className="title" title="Bank">
                    <FontAwesomeIcon icon={faBank} /><br />BANK
                </Link>
            </li>
            <li onClick={() => onMenuClick("pg")}>
                <Link to="/payinhome" className="title" title="Payment Gateway">
                    <FontAwesomeIcon icon={faCreditCard} /><br />PG
                </Link>
            </li>
        </ul>

        <nav className="position-absolute bottom-0 start-0 text-center translate-middle-y">
            <Link to="/home" title="Dashboard">
                <FontAwesomeIcon icon={faTachometerAlt} />
            </Link>

            <Link to="/customer/profile" title="Profile">
                <FontAwesomeIcon icon={faUser} />
            </Link>

            <Link to="/settings" title="Settings">
                <FontAwesomeIcon icon={faCog} />
            </Link>

            <Link to="/" title="Logout" onClick={handleSignOut} >
                <FontAwesomeIcon icon={faSignOutAlt} />
            </Link>

        </nav>
    </div>
  );
};

export default Sidebar;
