//ResetPassword component effectively handles password reset functionality, providing a user-friendly interface with appropriate feedback and validation.
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  let navigate = useNavigate();

  const { customerId } = useParams();
  // State to hold form data
  const [registerRequest, setRegisterRequest] = useState({});
  // Update state based on user input
  const handleUserInput = (e) => {
    setRegisterRequest({ ...registerRequest, [e.target.name]: e.target.value });
  };
  // Handle password reset form submission
  const resetPassword = (e) => {
    if (registerRequest.password !== registerRequest.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      e.preventDefault();
      return;
    }
    // Validate passwords
    if (!registerRequest.password || !registerRequest.confirmPassword) {
      toast.error("Please enter both passwords", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      e.preventDefault();
      return;
    }
    // Add customer ID to the request payload
    registerRequest.userId = customerId;
    // Send password reset request to the server
    fetch(`${process.env.REACT_APP_BASE_URL}/api/user/reset-password`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerRequest),
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
              window.location.href = "/user/login";
            }, 1000); // Redirect after 3 seconds
          } else {
            console.log("Didn't get success response");
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
        });
      })
      .catch((error) => {
        console.error(error);
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
    e.preventDefault();
  };

  return (
    <div className="w-100" style={{marginTop: "10rem", marginLeft: "4rem"}}>
      <div className="d-flex aligns-items-center justify-content-center">
        <div
          className="w-50 card form-card border-color custom-bg"

        >
          <div className="card-header">

            <h4 className="text-primary">Reset Password</h4>
          </div>
          <div className="card-body">
            <form>
              <div className="mb-3 text-color">
                <label htmlFor="password" className="form-label">
                  <b>Password</b>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  onChange={handleUserInput}
                  value={registerRequest.password || ""}
                />
              </div>
              <div className="mb-3 text-color">
                <label htmlFor="confirmPassword" className="form-label">
                  <b>Confirm Password</b>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  onChange={handleUserInput}
                  value={registerRequest.confirmPassword || ""}
                />
              </div>

              &nbsp;<button
                type="submit"
                className="btn btn-primary"
                onClick={resetPassword}
              >
                Reset Password
              </button>
              <ToastContainer />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
