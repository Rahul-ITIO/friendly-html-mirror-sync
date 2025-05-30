import "./App.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Route, Routes } from "react-router-dom";
import AboutUs from "./page/AboutUs";
import ContactUs from "./page/ContactUs";
import logo from "./images/Logo_bank.jpeg";
import bg from "./images/new.jpg";
import { Link } from "react-router-dom";
import RoleNav from "./NavbarComponent/RoleNav";
import ProfileHeader from "./NavbarComponent/ProfileHeader";
import HomePage from "./page/HomePage";
import AdminDashboard from "./page/AdminDashboard";
import UserRegister from "./UserComponent/UserRegister";
import UserLoginForm from "./UserComponent/UserLoginForm";
import AdminRegisterForm from "./UserComponent/AdminRegisterForm";
import AddBankForm from "./BankComponent/AddBankForm";
import ViewAllBanks from "./BankComponent/ViewAllBanks";
import ViewBankManagers from "./UserComponent/ViewBankManagers";
import ViewAllBankCustomers from "./UserComponent/ViewAllBankCustomers";
import ViewBankAccount from "./BankAccountComponent/ViewBankAccount";
import ViewBankCustomers from "./UserComponent/ViewBankCustomers";
import ViewAllBankAccounts from "./BankAccountComponent/ViewAllBankAccounts";
import ViewBankAccounts from "./BankAccountComponent/ViewBankAccounts";
import AddBankAccount from "./BankAccountComponent/AddBankAccount";
import ViewBankAllTransactions from "./BankTransactionComponent/ViewBankAllTransactions";
import ViewCustomerTransactions from "./BankTransactionComponent/ViewCustomerTransactions";
import ViewAllBankTransactions from "./BankTransactionComponent/ViewPendingTransactions";
import CustomerAccountFundTransfer from "./BankTransactionComponent/CustomerAccountFundTransfer";
import ViewAllPendingCustomers from "./UserComponent/ViewAllPendingCustomers";
import AddMoney from "./BankTransactionComponent/AddMoney";
import AccountTransfer from "./BankTransactionComponent/AccountTransfer";
import ViewPendingTransactions from "./BankTransactionComponent/ViewPendingTransactions";
import ViewMyTransactions from "./BankTransactionComponent/ViewMyTransactions";
import UserProfile from "./UserComponent/UserProfile";
import UserProfileUpdate from "./UserComponent/UserProfileUpdate";
import AddBeneficiaryForm from "./BeneficiaryComponent/AddBeneficiaryForm";
import ViewBeneficiaryAccounts from "./BeneficiaryComponent/ViewBeneficiaryAccounts";
import UpdateBeneficiaryForm from "./BeneficiaryComponent/UpdateBeneficiaryForm";
import QuickAccountTransfer from "./BankTransactionComponent/QuickAccountTransfer";
import MoneyExchange from "./BankTransactionComponent/MoneyExchange.jsx";
import QuickPay from "./BankTransactionComponent/QuickPay";
import AddFeeDetail from "./FeeDetailComponent/AddFeeDetail";
import ViewFeeDetail from "./FeeDetailComponent/ViewFeeDetail";
import EmailTemplate from "./FeeDetailComponent/EmailTemplate";
import UserTicket from "./TicketComponent/UsertTcket";
import AdminTicket from "./TicketComponent/AdminTicket";
import ForgetPassword from "./UserComponent/ForgetPassword";
import ResetPassword from "./UserComponent/ResetPassword";
import UserAccounts from "./UserComponent/UserAccounts.jsx";
import AddCurrency from "./CurrencyComponent/AddCurrency.jsx";
import AdminAccount from "./CurrencyComponent/AdminAccount.jsx";
import CommonBankAccounts from "./CurrencyComponent/CommonBankAccount.jsx";
import EditHostDetailsPage from "./CurrencyComponent/EditHostDetailsPage.jsx";
import ViewAllPendingCustomerAccounts from "./UserComponent/ViewAllPendingCustomersAccounts.jsx";
import TwofectorVerification from "./Security/TwofectorVerification.jsx";
import CheckoutSuccess from "./BankTransactionComponent/handleCheckoutSuccess.jsx";
import CustomerKYC from "./UserComponent/CustomerKYC.jsx";

function App() {
  const [profileImg, setProfileImg] = useState(null);
  const [name, setName] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true); // State to control sidebar visibility

  useEffect(() => {
    document.body.style.backgroundImage = `url(${bg})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed"; // Keep the background image fixed while scrolling
    fetchHostDetails();
    return () => {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundSize = "auto";
      document.body.style.backgroundAttachment = "scroll";
    };
  }, []);

  const fetchHostDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchHostDetail`
      );
      // const img = await import(`./images/${response.data.hostingDetail.logo}`);
      setProfileImg(logo);
      setName(response.data.hostingDetail.longName);
      document.documentElement.style.setProperty(
        "--header-color",
        response.data.hostingDetail.headerColor
      );
      document.documentElement.style.setProperty(
        "--sidebar-color",
        response.data.hostingDetail.sidebarColor
      );
      console.log(response);
    } catch (error) {
      setProfileImg(logo);
      console.error("Error fetching host details:", error);
    }
  };

  const isMobile = () => {
    return window.innerWidth <= 768; // You can adjust this width based on your design
  };

  const toggleSidebar = () => {
    if (isMobile()) {
      setShowSidebar(!showSidebar);
    }
  };
  const toggleSidebar2 = () => {
    if (isMobile()) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="container">
      {/* First Left Panel */}
      <div className="first-left-panel">
        <h1>BOF BANK</h1>
      </div>

      {/* Second Left Panel */}
      <div className="second-left-panel">
        <h2>Customer Panel</h2>
        <ul>
          <li><Link to="/home">Dashboard</Link></li>
          <li><Link to="/customer/transaction/all">Transactions</Link></li>
          <li><Link to="/customer/profile">Profile</Link></li>
          <li><Link to="/user/login">Logout</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <nav className="navbar navbar-expand-lg sidebar-text">
            <div className="container-fluid sidebar-text">
              <img
                src={profileImg}
                width="50"
                height="50"
                className="d-inline-block nav-items"
                alt=""
              />
              <Link className="navbar-brand me-auto mb-2 mb-lg-0">
                <i>
                  {name ? (
                    <h3 className="sidebar-text ms-3 nav-items">{name}</h3>
                  ) : (
                    <p className="sidebar-text ms-3 nav-items">Online Banking System</p>
                  )}{" "}
                </i>
              </Link>
              <div className="nav-items">
                <ProfileHeader toggleSidebar={toggleSidebar2} />
              </div> &nbsp;
              &nbsp;<button
                className="navbar-toggler nav-items"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={toggleSidebar} // Call toggleSidebar function when the button is clicked
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<UserLoginForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/home/all/hotel/location" element={<HomePage />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="/user/customer/register" element={<UserRegister />} />
          <Route path="/user/bank/register" element={<UserRegister />} />
          <Route path="/user/login" element={<UserLoginForm />} />
          <Route path="/user/admin/register" element={<AdminRegisterForm />} />
          <Route path="/admin/bank/register" element={<AddBankForm />} />
          <Route path="/admin/bank/all" element={<ViewAllBanks />} />
          <Route path="/admin/bank/managers" element={<ViewBankManagers />} />
          <Route
            path="/admin/all/bank/customers"
            element={<ViewAllBankCustomers />}
          />
          <Route path="/bank/customer/all" element={<ViewBankCustomers />} />
          <Route
            path="customer/bank/account/detail"
            element={<ViewBankAccount />}
          />
          <Route
            path="/admin/bank/account/all"
            element={<ViewAllBankAccounts />}
          />
          <Route path="/bank/account/all" element={<ViewBankAccounts />} />
          <Route path="/bank/customer/account/add" element={<AddBankAccount />} />
          <Route
            path="/bank/customer/account/transactions"
            element={<ViewBankAllTransactions />}
          />
          {/* <Route
          path="/customer/bank/account/statement"
          element={<ViewCustomerTransactions />}
        /> */}
          <Route
            path="/admin/bank/customer/transaction/all"
            element={<ViewAllBankTransactions />}
          />
          <Route
            path="/customer/account/transfer"
            element={<CustomerAccountFundTransfer />}
          />
          <Route
            path="/admin/customer/pending"
            element={<ViewAllPendingCustomers />}
          />
          <Route
            path="/admin/customer/pendingAccounts"
            element={<ViewAllPendingCustomerAccounts />}
          />
          <Route path="/customer/add/money" element={<AddMoney />} />
          <Route
            path="/customer/account/money/transfer"
            element={<AccountTransfer />}
          />
          <Route path="/customer/account/moneyExchange" element={<MoneyExchange />} />
          <Route
            path="/admin/customer/transaction/pending"
            element={<ViewPendingTransactions />}
          />
          <Route
            path="/admin/customer/transaction/success"
            element={<ViewCustomerTransactions />}
          />
          <Route
            path="/customer/transaction/all"
            element={<ViewMyTransactions />}
          />
          <Route path="/customer/profile" element={<UserProfile />} />
          <Route
            path="/customer/profile/update"
            element={<UserProfileUpdate />}
          />
          <Route
            path="/customer/beneficiary/add"
            element={<AddBeneficiaryForm />}
          />
          <Route
            path="/customer/beneficiary/view"
            element={<ViewBeneficiaryAccounts />}
          />
          <Route
            path="/customer/beneficiary/account/update"
            element={<UpdateBeneficiaryForm />}
          />
          <Route
            path="/customer/quick/account/transfer"
            element={<QuickAccountTransfer />}
          />
          <Route path="/customer/UserAccounts" element={<UserAccounts />} />
          <Route path="/customer/kyc" element={<CustomerKYC />} />
          <Route path="/customer/beneficiary/quick/pay" element={<QuickPay />} />
          <Route path="/admin/fee/detail/add" element={<AddFeeDetail />} />
          <Route path="/admin/fee/detail/view" element={<ViewFeeDetail />} />
          <Route path="/admin/fee/detail/email" element={<EmailTemplate />} />
          <Route
            path="/customer/ticket/detail/UserTicket"
            element={<UserTicket />}
          />
          <Route
            path="/Admin/ticket/detail/AdminTicket"
            element={<AdminTicket />}
          />
          <Route path="/Admin/Currency/AddCurrency" element={<AddCurrency />} />
          <Route
            path="/Admin/Currency/CommonBankAccounts"
            element={<CommonBankAccounts />}
          />
          <Route path="/Admin/Currency/AdminAccount" element={<AdminAccount />} />
          <Route
            path="/Admin/Currency/EditHostDetailsPage"
            element={<EditHostDetailsPage />}
          />
          <Route path="/user/forget/password" element={<ForgetPassword />} />
          <Route path="/:customerId/reset-password" element={<ResetPassword />} />
          <Route path="/customer/security/:id" element={<TwofectorVerification />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;