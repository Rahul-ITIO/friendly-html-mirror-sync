import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBill, faExchangeAlt, faUserPlus, faEye, faListAlt, faTicketAlt,faMortarBoard } from "@fortawesome/free-solid-svg-icons";

// Define the CustomerHeader component
const CustomerHeader = ({toggleSidebar, setIsLoggedIn}) => {
  // Initialize navigate hook for navigation
  let navigate = useNavigate();
  // Retrieve customer information from session storage
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  console.log("==active-customer==",customer);

   // Function to handle user logout
  
   const userLogout = () => {
        toast.success("Logged out!!!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

        // Remove customer data and JWT token from session storage
        sessionStorage.removeItem("active-customer");
        sessionStorage.removeItem("customer-jwtToken");
        sessionStorage.removeItem("user-role"); // Remove role on logout

        // 🔹 Hide Sidebar by setting isLoggedIn to false
        setIsLoggedIn(true);

        setTimeout(() => {
            window.location.reload();
        }, 1000);

        // Navigate to home after logout
        navigate("/");
    };


  return (
    <div className="second-left-panel">
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 me-5">
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/home"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faListAlt} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>Dashboard BANK</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/UserAccounts"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faListAlt} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>My Accounts</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/add/money"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faMoneyBill} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>Add Money</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/account/money/transfer"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faExchangeAlt} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>Account Transfer</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/beneficiary/add"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faUserPlus} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>Add Beneficiary</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/beneficiary/view"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faEye} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>View Beneficiary</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/transaction/all"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faListAlt} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>My Transactions</></span>
        </Link>
      </li>
      <li className="nav-item " onClick={toggleSidebar}>
        <Link
          to="/customer/ticket/detail/UserTicket"
          className="nav-link active"
          aria-current="page"
        >
          <FontAwesomeIcon icon={faTicketAlt} className="icon sidebar-text" />&nbsp;
          <span className="sidebar-text"> <>User Tickets</></span>
        </Link>
      </li>
      <ToastContainer />
    </ul>
    </div>
  );
};

export default CustomerHeader;
