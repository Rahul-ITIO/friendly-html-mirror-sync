import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa"; // Import the user plus icon from Font Awesome

//user loginForm function component
const UserLoginForm = () => {
  //
  //The useNavigate hook is provided by the react-router-dom library and is used for programmatic navigation
  //navigate allows you to redirect or navigate to different routes within the application after certain events, like successful login
  let navigate = useNavigate();

  //loginRequest: Stores the user input data required for login (e.g., username, password).
 // setLoginRequest is a function to update this state
  const [loginRequest, setLoginRequest] = useState({});
 // authResponse: Stores the response received from the server after a login attempt.
  const [authResponse, setAuthResponse] = useState({});
  const [userRes, setUserRes] = useState({});
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  //The handleUserInput function updates the loginRequest state dynamically with the user's input for the corresponding form field by spreading the existing state and setting the value based on the input's name attribute
  const handleUserInput = (e) => {
    setLoginRequest({ ...loginRequest, [e.target.name]: e.target.value });
  };

  const handleOtpInput = (e) => {
    setOtpCode(e.target.value);
  };

  const loginAction = (e) => {
    e.preventDefault();// Prevents the default form submission behavior.
    fetch(`${process.env.REACT_APP_BASE_URL}/api/user/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginRequest),// Converts the `loginRequest` state object to JSON.
    })
      .then((result) => result.json()) // Converts the response to a JSON object.
      .then((res) => {
        if (res.success) { // If login is successful
          if (res.user && res.user.twoFactorEnabled !== null) { // Check for 2FA
            if (res.user.twoFactorEnabled) {  // 2FA is enabled
              setUserRes(res);// Store user response for later use
              setAuthResponse(res);// Store the authentication response
              setShowOtpInput(true);// Show OTP input field for 2FA
            } else {
              handleLoginSuccess(res);// Handle login success if 2FA is not required
            }
          } else {
            handleLoginSuccess(res); // Handle login success when no user or 2FA info is provided
          }
        } else {
          // Show error notification if login fails
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
      })
      .catch((error) => {
        console.error(error);// Catch network or server errors
         // Show a toast notification if there is a server error
        toast.error("It seems the server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  const handleLoginSuccess = (res) => {
    const { user, jwtToken } = res;// Destructure the user and JWT token from the response
    if (jwtToken) { // If JWT token is present
      sessionStorage.setItem(
        `active-${user.roles.toLowerCase()}`,
        JSON.stringify(user)// Store user data in sessionStorage
      );
      sessionStorage.setItem(`${user.roles.toLowerCase()}-jwtToken`, jwtToken);// Store JWT token in sessionStorage
      toast.success(res.responseMessage, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        if (user.roles === "CUSTOMER" && !user.profileComplete) {
          navigate("/customer/kyc", { state: user });// Navigate to KYC page if customer profile is incomplete
        } else {
          window.location.href = "/home"; // Navigate to home page
        }
      }, 1000);
    } else {
      // Show error notification if JWT token is missing
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
  };

  const verifyCode = () => {
    const verifyRequest = {
      emailId: loginRequest.emailId,// Email ID from the login request
      twoFactorCode: otpCode,// OTP entered by the user
    };
    fetch(`${process.env.REACT_APP_BASE_URL}/api/user/verify`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyRequest), // Converts the OTP verification request to JSON
    })
      .then((result) => result.json())// Converts the response to a JSON object
      .then((res) => {
        console.log(res.mfaEnabled);
        if (res.mfaEnabled) {  // If 2FA is successful
          handleLoginSuccess(userRes);// Call the success handler with the stored user response
        } else {
           // Show error notification if 2FA fails
          toast.error("Code Not Correct", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      })
      .catch((error) => {// Catch network or server errors
        console.error(error);
         // Show a toast notification if there is a server error
        toast.error("It seems the server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  return (
    <div className="container base p">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-color text-white text-center">
              <span className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="white"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 15a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v4a2 2 0 0 0 2 2zM10 9V7a4 4 0 0 1 8 0v2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11c0-1.1.9-2 2-2h2z" />
                </svg>
              </span>
              <h4>User Login</h4>
            </div>
            <div className="card-body">
              {!showOtpInput ? (
                <form onSubmit={loginAction}>
                  
                  <div className="mb-3">
                    <label htmlFor="emailId" className="form-label">
                      <b>Email Id  or  User Name</b>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="emailId"
                      name="emailId"
                      onChange={handleUserInput}
                      value={loginRequest.emailId}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <b>Password</b>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      onChange={handleUserInput}
                      value={loginRequest.password}
                      autoComplete="on"
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    &nbsp;<button type="submit" className="btn btn-primary">
                      Login
                    </button>
                    <div>
                      <NavLink to="/user/customer/register">
                        <FaUserPlus
                          style={{
                            fontSize: "2.5em",
                            color: "#007bff",
                            paddingRight: "0.2em",
                          }}
                        />
                      </NavLink>
                    </div>
                  </div>
                  <NavLink to="/user/forget/password" className="nav-link">
                    <b>Forgot Password?</b>
                  </NavLink>
                </form>
              ) : (
                <div>
                  <h4 className=" text-color " >Two-Factor Authentication</h4>
                  <div className="form-group">
                    <label htmlFor="validationCode" className="form-label">
                      Enter 6 digits Validation Code Generated by the app
                    </label>
                    <input
                      type="text"
                      id="validationCode"
                      name="validationCode"
                      className="form-control"
                      required
                      value={otpCode}
                      onChange={handleOtpInput}
                    />
                  </div>
                  &nbsp;<button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="btn btn-secondary mt-3 "
                  >
                    Back
                  </button>
                  &nbsp;<button
                    type="button"
                    onClick={verifyCode}
                    className={`btn btn-primary mt-3 ${
                      otpCode.length < 6 ? "button-disabled" : ""
                    }`}
                  >
                    Verify code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default UserLoginForm;
