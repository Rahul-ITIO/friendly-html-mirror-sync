import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const HandleCheckoutSuccess = () => {
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const addMoneyRequest = sessionStorage.getItem("addMoneyRequest");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
console.log(addMoneyRequest)
      handleConfirmAddMoney();
    }
, []);

  const handleConfirmAddMoney = () => {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/transaction/addMoney`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + customer_jwtToken,
      },
      body: addMoneyRequest,
    })
      .then((result) => result.json())
      .then((res) => {
        if (res.success) {
          // toast.success(res.responseMessage, {
          //   position: "top-center",
          //   autoClose: 1000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          // });
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        } else {
          toast.error(res.errorMessage || "Unknown error", {
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
        console.error("Error adding money:", error);
        toast.error("Failed to add money. Please try again later.", {
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
          <div className="register">
            <div className="card form-card border-color text-color custom-bg">
              {/* <div className="card-header custom-bg-text text-center">
                 <h5 className="text-color">Added Customer</h5> 
              </div> */}
              <div className="card-body">
                  <div>
                    <div className="alert alert-success" role="alert">
                    Your money has been successfully added to your account. Thank you for using our service.
                    </div>
                    {/* <button
                      type="button"
                      className="btn btn-link text-color"
                      style={{ textDecoration: "none" }} // Remove underline from links
                      onClick={handleBackToLogin}
                    >
                      <FaArrowLeft /> Back to Login
                    </button> */}
                  </div>
                  </div>
          </div>
        </div>
  );
};

export default HandleCheckoutSuccess;
