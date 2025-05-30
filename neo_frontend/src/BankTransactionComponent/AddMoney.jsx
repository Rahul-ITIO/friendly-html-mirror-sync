//this component is designed to handle the process of adding money to a user's account, including form input, fee calculation, currency conversion, and initiating the payment process. It also handles various states related to loading, errors, and user interactions
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Flag from "react-world-flags"; // Import Flag component

const AddMoney = () => {
  let navigate = useNavigate();

  // State variables to manage different parts of the component

  const [addMoneyRequest, setAddMoneyRequest] = useState({});
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [feeDetail, setFeeDetail] = useState([]);
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [errors, setErrors] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);

  const customer = JSON.parse(sessionStorage.getItem("active-customer"));

// Handle user input in the form
  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setAddMoneyRequest({ ...addMoneyRequest, [name]: value });

    if (name === "amount") {
      calculateFee(value); // Calculate fee whenever amount is entered
    }
  };

  // Calculate fee based on amount entered
  const calculateFee = (amount) => {
    if (feeDetail) {
      const feePercentage = feeDetail.fee;
      const fee = (amount * feePercentage) / 100;
      const minimumFee = feeDetail.feeAmount;
      const finalFee = Math.max(fee, minimumFee);

      setCalculatedFee(finalFee);
      setAddMoneyRequest((prevState) => ({ ...prevState, fee: finalFee }));
    }
  };

  useEffect(() => {
        // Fetch all fee details
    const getAllFeeDetails = async () => {
      const feeResponse = await retrieveFeeDetails();
      console.log(feeResponse)
      if (feeResponse) {
        const feeType = "Credit Transaction";
        const feeObject = feeResponse.feeDetails.find(
          (item) => item.type === feeType
        );
        console.log(feeObject)
        setFeeDetail(feeObject);
      }
    };
         // Fetch all currencies
    const fetchAllCurrencies = async () => {
      const currenciesResponse = await fetchCurrencies();
      setCurrencies(currenciesResponse);
    };
    // Fetch exchange rates
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/521c4cac49833694704ab4b3/latest/USD`
        );
        setExchangeRates(response.data.conversion_rates);
      } catch (error) {
        console.error("Error fetching exchange rates", error);
        toast.error("Failed to fetch exchange rates", {
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

    
    getAllFeeDetails();
    fetchAllCurrencies();
    fetchExchangeRates();
  }, []);
  // Retrieve fee details from the server
  const retrieveFeeDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/fee/detail/fetch/all`,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken,
          },
        }
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching fee:", error);
      toast.error("Failed to fetch fee", {
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
  // Fetch user accounts and their currencies from the server
  const fetchCurrencies = async () => {
    try {
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${customer.id}`
      );
      const activeAccounts = response1.data.accounts.filter(
        (account) => account.status.toLowerCase() === "active"
      );
      setAccounts(activeAccounts);
      if (activeAccounts.length > 0) {
        setSelectedAccount(activeAccounts[0]);
        setAddMoneyRequest((prevState) => ({
          ...prevState,
          accountNumber: activeAccounts[0].accountNumber,
        }));
      }
      return response1.data.accounts.map(account => account.currency);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Failed to fetch currencies", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return [];
    }
  };
  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!addMoneyRequest.amount || addMoneyRequest.amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!addMoneyRequest.accountNumber) {
      newErrors.accountNumber = "Please select an account";
    }

    if (!addMoneyRequest.modeOP) {
      newErrors.modeOP = "Please select a mode of payment";
    }

    if (!addMoneyRequest.currency) {
      newErrors.currency = "Please select a currency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle the click event of the Add Money button
  const handleAddMoneyClick = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowModal(true);
    } else {
      toast.error("Please fix the form errors before proceeding", {
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
  // Confirm and process the Add Money request
  const handleConfirmAddMoney = () => {
    const fromCurrency = addMoneyRequest.currency;
    const toCurrency = selectedAccount.currency;
    const exchangeRate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    const convertedAmount = (Number(addMoneyRequest.amount) * exchangeRate).toFixed(2);
  
    // Update the amount with the converted amount
    const updatedAddMoneyRequest = {
      ...addMoneyRequest,
      amount: addMoneyRequest.amount,
      toAmount:convertedAmount,
      userId: customer.id,
      fromCurrency:fromCurrency,
      toCurrency:toCurrency,
    };
    sessionStorage.setItem("addMoneyRequest", JSON.stringify(updatedAddMoneyRequest));
    // fetch(`${process.env.REACT_APP_BASE_URL}/api/transaction/addMoney`, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + customer_jwtToken,
    //   },
    //   body: JSON.stringify(updatedAddMoneyRequest),
    // })
    //   .then((result) => result.json())
    //   .then((res) => {
    //     setShowModal(false);
    //     if (res.success) {
    //       toast.success(res.responseMessage, {
    //         position: "top-center",
    //         autoClose: 1000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //       });
    //       setTimeout(() => {
    //         navigate("/home");
    //       }, 1000);
    //     } else {
    //       toast.error("It seems server is down", {
    //         position: "top-center",
    //         autoClose: 1000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     toast.error("It seems server is down", {
    //       position: "top-center",
    //       autoClose: 1000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   });
  };
  
    // Handle checkout for different payment modes
  const handleCheckout = async () => {
    try {
      let endpoint = "";
      if (addMoneyRequest.modeOP === "Bank Transfer") {
        endpoint = `${process.env.REACT_APP_BASE_URL}/api/create-checkout-session/bank`;
      } else if (addMoneyRequest.modeOP === "Credit Card") {
        endpoint = `${process.env.REACT_APP_BASE_URL}/api/create-checkout-session/card`;
      } else {
        return;
      }
      const response = await axios.post(endpoint, {
        currency: addMoneyRequest.currency,
        amount: Number(addMoneyRequest.amount) + calculatedFee,
        request: addMoneyRequest,
      });

      if (response.data) {
        window.location.href = response.data;
        handleConfirmAddMoney();
      }
    } catch (error) {
      console.error("Error creating checkout session", error);
      toast.error("Error creating checkout session", {
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

  const handlePaymentSuccess = () => {
    handleConfirmAddMoney();
  };

  const listenForPaymentSuccess = () => {
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "stripe-payment-success") {
        handlePaymentSuccess();
      }
    });
  };

  useEffect(() => {
    listenForPaymentSuccess();

    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  return (
    <div className="container">
      <div className="mt_2 d-flex align-items-center justify-content-center" style={{ display: showModal ? "none" : "block" }}>
        <div
          className="card form-card border-color custom-bg"
          style={{
            width: "25rem",
          }}
        >
          <div className="card-header text-center custom-bg-text">
            <h4 className="text-color">Add Money</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddMoneyClick}>
              <div className="mb-3">
                <label className="form-label">
                  <b>Enter Amount</b>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                  name="amount"
                  value={addMoneyRequest.amount || ""}
                  onChange={handleUserInput}
                  required
                />
                {errors.amount && (
                  <div className="invalid-feedback">{errors.amount}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <b>Currency</b>
                </label>
                <select
                  className={`form-select ${errors.currency ? "is-invalid" : ""}`}
                  name="currency"
                  onChange={handleUserInput}
                  value={addMoneyRequest.currency || ""}
                >
                  <option value="" disabled>
                    Select Currency
                  </option>
                  {Object.keys(exchangeRates).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <div className="invalid-feedback">{errors.currency}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <b>Account & Currencies</b>
                </label>
                <select
                  className={`form-select ${
                    errors.accountNumber ? "is-invalid" : ""
                  }`}
                  name="accountNumber"
                  onChange={(e) => {
                    handleUserInput(e);
                    const selected = accounts.find(
                      (account) => account.accountNumber === e.target.value
                    );
                    setSelectedAccount(selected);
                  }}
                  value={addMoneyRequest.accountNumber || ""}
                >
                  <option value="" disabled>
                    Select Account Number
                  </option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.accountNumber}>
                      {account.accountNumber} {account.currency}
                    </option>
                  ))}
                </select>
                {errors.accountNumber && (
                  <div className="invalid-feedback">{errors.accountNumber}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <b>Mode of Payment</b>
                </label>
                <select
                  className={`form-select ${errors.modeOP ? "is-invalid" : ""}`}
                  name="modeOP"
                  onChange={handleUserInput}
                  value={addMoneyRequest.modeOP || ""}
                >
                  <option value="" disabled>
                    Select Mode of Payment
                  </option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                {errors.modeOP && (
                  <div className="invalid-feedback">{errors.modeOP}</div>
                )}
              </div>
              <button type="submit" className="btn bg-color custom-bg-text">
                Add Money
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Summary</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <b>Amount:</b> {addMoneyRequest.amount}
                </p>
                <p>
                  <b>Fee:</b> {calculatedFee}
                </p>
                <p>
                  <b>Total Amount:</b>{" "}
                  {Number(addMoneyRequest.amount) + calculatedFee}
                </p>
                <p>
                  <b>Mode of Payment:</b> {addMoneyRequest.modeOP}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMoney;
