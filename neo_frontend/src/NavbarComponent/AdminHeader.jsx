import React from "react";// Import React library
import { Link, useNavigate } from "react-router-dom";// Import Link and useNavigate hooks from react-router-dom for navigation
import { ToastContainer, toast } from "react-toastify";// Import ToastContainer and toast for showing notifications
import "react-toastify/dist/ReactToastify.css";// Import CSS for toast notifications
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";// Import FontAwesomeIcon component to use icons
import {
  faListAlt,
  faEye,
  faEnvelope,
  faUserClock,
  faUsers,
  faMoneyCheckAlt,
  faDatabase ,
  faTicketAlt,
  faCog,
  faChartLine,
  faBell,
  faClipboardList,
  faSignOutAlt,
  faUserShield,
  faUniversity,
  faServer,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

// Define a functional component named AdminHeader
const AdminHeader = ({ toggleSidebar, isAdminLoggedIn }) => {
  // useNavigate hook to programmatically navigate between routes
  let navigate = useNavigate();
 // Retrieve the currently active admin's information from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("active-admin"));
  console.log("==active-admin==",user);
  
 // Function to handle the admin logout action
  const adminLogout = () => {
    // Show a success message using react-toastify
    toast.success("Logged out!!!", {
      position: "top-center",
      autoClose: 1000,// The toast will automatically close after 1 second
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
     // Remove user data from sessionStorage to log them out
    sessionStorage.removeItem("active-admin");
    sessionStorage.removeItem("admin-jwtToken");
    sessionStorage.removeItem("user-role"); // Remove role on logout
    // Reload the page after 1 second to apply changes

     // 🔹 Hide Sidebar by setting isLoggedIn to false
     isAdminLoggedIn(true);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
    // Navigate to the home page
    navigate("/");
  };
  // Return the JSX to be rendered
  return (
    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 me-5">
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/home" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faListAlt} className="icon sidebar-text" />
          &nbsp;
          <span className="sidebar-text">Dashboard</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/all/bank/customers" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faUsers} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">All Customers</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/customer/pending" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faUserClock} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Pending Customers</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/customer/pendingAccounts" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faUserClock} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Pending Accounts</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/customer/transaction/success" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faServer} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">ALL Transactions</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/customer/transaction/pending" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faMoneyCheckAlt} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Pending Transactions</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
  <Link to="/Admin/Currency/AdminAccount" className="nav-link active" aria-current="page">
    <FontAwesomeIcon icon={faUserShield} className="icon sidebar-text" />
    &nbsp;<span className="sidebar-text">Admin Account</span>
  </Link>
</li>
<li className="nav-item" onClick={toggleSidebar}>
  <Link to="/Admin/Currency/CommonBankAccounts" className="nav-link active" aria-current="page">
    <FontAwesomeIcon icon={faUniversity} className="icon sidebar-text" />
    &nbsp;<span className="sidebar-text">Common Bank Accounts</span>
  </Link>
</li>
<li className="nav-item" onClick={toggleSidebar}>
  <Link to="/Admin/Currency/EditHostDetailsPage" className="nav-link active" aria-current="page">
    <FontAwesomeIcon icon={faDatabase } className="icon sidebar-text" />
    &nbsp;<span className="sidebar-text">Hosting Details</span>
  </Link>
</li>
<li className="nav-item" onClick={toggleSidebar}>
  <Link to="/Admin/Currency/AddCurrency" className="nav-link active" aria-current="page">
    <FontAwesomeIcon icon={faPlusCircle} className="icon sidebar-text" />
    &nbsp;<span className="sidebar-text">Add Currency</span>
  </Link>
</li>

      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/fee/detail/view" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faEye} className="icon sidebar-text" /> &nbsp;
          <span className="sidebar-text">Fee Details</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/fee/detail/email" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faEnvelope} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Email Templates</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/Admin/ticket/detail/AdminTicket" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faTicketAlt} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">User Tickets</span>
        </Link>
      </li>
      {/* <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/settings" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faCog} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Settings</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/analytics" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faChartLine} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Analytics</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/notifications" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faBell} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Notifications</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="/admin/reports" className="nav-link active" aria-current="page">
          <FontAwesomeIcon icon={faClipboardList} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Reports</span>
        </Link>
      </li>
      <li className="nav-item" onClick={toggleSidebar}>
        <Link to="#" className="nav-link active" aria-current="page" onClick={adminLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="icon sidebar-text" />
          &nbsp;<span className="sidebar-text">Logout</span>
        </Link>
      </li> */}
      <ToastContainer />
    </ul>
  );
};

export default AdminHeader;
