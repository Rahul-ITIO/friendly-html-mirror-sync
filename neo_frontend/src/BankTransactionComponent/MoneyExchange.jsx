import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate ,useParams,useLocation} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";

const MoneyExchange = () => {
   // State variables to manage various parts of the form and application data
   const [transferRequest, setTransferRequest] = useState({});
   const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
   const [accounts, setAccounts] = useState([]); // Accounts the user has
   const [toAccounts, setToAccounts] = useState([]); // Accounts to which the user can transfer money
   const [exchangeRates, setExchangeRates] = useState({}); // Currency exchange rates
   const [errors, setErrors] = useState({}); // Form validation errors
   const [matchedAccount, setMatchedAccount] = useState(null); // Account details matching the 'from' account
   const [userName, setUserName] = useState(null); // Name of the account holder
   const [feeDetail, setFeeDetail] = useState([]); // Details about the fees for the transaction
   const [amount, setAmount] = useState(0); // Amount to be transferred
   const [calculatedFee, setCalculatedFee] = useState(0); // Fee for the transaction
   const customer = JSON.parse(sessionStorage.getItem("active-customer")); // Current logged-in user
   let navigate = useNavigate(); // Navigation function to move between pages
   const location = useLocation(); // Get the current URL's location
 
   // useEffect hook to perform side-effects when the component is mounted 
  
  useEffect(() => {
        // Fetch fee details from the API
    const getAllFeeDetails = async () => {
      const feeResponse = await retrieveFeeDetails();
      if (feeResponse) {
        const feeType = "Money Exchange";
        const feeObject = feeResponse.feeDetails.find(
          (item) => item.type === feeType
        );
        setFeeDetail(feeObject);
      }
    };
    // Fetch the user's accounts from the API
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${customer.id}`
        );
        const activeAccounts = response.data.accounts.filter(
          (account) => account.status.toLowerCase() === "active"
        );
        setAccounts(activeAccounts);
                // Get the account number from the URL's query parameters
        const params = new URLSearchParams(location.search);
        const accountNumber = params.get("accountNumber");
        // If there are active accounts and an account number is provided, set it as the default 'from' account
        if (activeAccounts.length > 0 && accountNumber) {
          setTransferRequest((prevState) => ({
            ...prevState,
            fromAccount: accountNumber,
          }));
          const matched = accounts.find(
            (account) => account.accountNumber === accountNumber
          );
          setMatchedAccount(matched || null);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to fetch accounts", {
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
    // Fetch the list of accounts available for transfers
    const fetchToAccounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=0`
        );
        const activeAccounts = response.data.accounts.filter(
          (account) => account.status.toLowerCase() === "active"
        );
        setToAccounts(activeAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to fetch accounts", {
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
// Fetch currency exchange rates from the API
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/521c4cac49833694704ab4b3/latest/USD`
        );
        setExchangeRates(response.data.conversion_rates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
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
    // Call the functions to fetch data
    getAllFeeDetails();
    fetchAccounts();
    fetchToAccounts();
    fetchExchangeRates();
  }, []);
// Empty dependency array means this runs only once when the component mounts

  // Function to retrieve fee details from the API
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
    // Function to calculate the transaction fee based on amount
  const calculateFee = (amount) => {
    if (feeDetail) {
      const feePercentage = feeDetail.fee; // Fee percentage from fee details
      const fee = (amount * feePercentage) / 100; // Calculate fee based on percentage
      const minimumFee = feeDetail.feeAmount; // Minimum fee amount from fee details
      const finalFee = Math.max(fee, minimumFee); // Ensure fee is at least minimum fee

      setCalculatedFee(finalFee); // Set the calculated fee in state
    }
  };
    // Function to handle changes in input fields
  const handleUserInput = async (e) => {
    const { name, value } = e.target;
    setTransferRequest({ ...transferRequest, [name]: value });
        // Handle amount input changes
    if (name === "amount") {
      calculateFee(value);
      setAmount(value);
    }
    if (name === "fromAccount") {
      const matched = accounts.find(
        (account) => account.accountNumber === value
      );
      setMatchedAccount(matched || null);
      if (matched) {
        console.log(matched);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/user/fetch/id?id=${matched.userId}`
          );
          console.log(response);

          setUserName(response.data.users[0].name);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to fetch user data", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } else {
        setUserName(null);
      }
    }

    if (name === "amount" && transferRequest.toAccount) {
      convertAmount(value);
    }
    if (name === "amount" && transferRequest.toCurrency) {
      convertAmount(value);
    }
    if (name === "fromAccount") {
      const fromAccount = accounts.find(
        (account) => account.accountNumber === value
      );
      const toAccount = toAccounts.find(
        (account) => account.accountNumber === transferRequest.toAccount
      );

      if (fromAccount && toAccount) {
        const fromCurrency = fromAccount.currency;
        const toCurrency = toAccount.currency;
        const exchangeRate =
          exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        const convertedAmount = (Number(amount) * exchangeRate).toFixed(2);
        setTransferRequest((prevState) => ({
          ...prevState,
          fromCurrency: fromCurrency,
          convertedAmount: convertedAmount,
        }));
      }
      if (fromAccount && transferRequest.toCurrency) {
        const fromCurrency = fromAccount.currency;
        const toCurrency = transferRequest.toCurrency;
        const exchangeRate =
          exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        const convertedAmount = (Number(amount) * exchangeRate).toFixed(2);
        setTransferRequest((prevState) => ({
          ...prevState,
          fromCurrency: fromCurrency,
          toAmount: convertedAmount,
        }));
      }
    }
  };
    // Function to convert amount based on selected currency
  const convertAmount = (amount) => {
    const fromAccount = accounts.find(
      (account) => account.accountNumber === transferRequest.fromAccount
    );
    const toAccount = toAccounts.find(
      (account) => account.accountNumber === transferRequest.toAccount
    );

    if (fromAccount && toAccount) {
      const fromCurrency = fromAccount.currency;
      const toCurrency = toAccount.currency;
      const exchangeRate =
        exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      const convertedAmount = (Number(amount) * exchangeRate).toFixed(2);
      setTransferRequest((prevState) => ({
        ...prevState,
        fromCurrency: fromCurrency,
        convertedAmount: convertedAmount,
        toCurrency:toCurrency,
      }));
    }
    if (fromAccount && transferRequest.toCurrency) {
      const fromCurrency = fromAccount.currency;
      const toCurrency = transferRequest.toCurrency;
      const exchangeRate =
        exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      const convertedAmount = (Number(amount) * exchangeRate).toFixed(2);
      setTransferRequest((prevState) => ({
        ...prevState,
        fromCurrency: fromCurrency,
        toAmount: convertedAmount,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!transferRequest.amount || transferRequest.amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!transferRequest.fromAccount) {
      newErrors.fromAccount = "Please select a from account";
    }

    if (!transferRequest.toAccount) {
      newErrors.toAccount = "Please select a to account";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Function to handle form submission
  const handleTransferClick = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/transaction/accountTransfer/internal`,
          {
            fromAccount: transferRequest.fromAccount,
            toAccount: transferRequest.toAccount,
            amount: Number(transferRequest.amount) + Number(calculatedFee),
            toAmount: transferRequest.convertedAmount,
            userId: customer.id,
            fee: Number(calculatedFee),
            toCurrency:transferRequest.toCurrency,
            fromCurrency:transferRequest.fromCurrency,

          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + customer_jwtToken,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Transfer initiated successfully", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setTimeout(() => {
            navigate("/home");
          }, 1000);
        } else {
          toast.error("Failed to initiate transfer", {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        console.error("Error during transfer:", error);
        toast.error(error.response.data.responseMessage, {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
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

  return (
            <div className="mt_3 d-flex align-items-center justify-content-center">
              <div
                className="card form-card border-color custom-bg"
                style={{
                  width: "25rem",
                }}
              >
                <div className="card-header text-center custom-bg-text">
                  <h4 className="text-color">Money exchange</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleTransferClick}>
                    <div className="mb-3">
                      <label className="form-label">
                        <b>From Account</b>
                      </label>
                      <select
                        className={`form-select ${
                          errors.fromAccount ? "is-invalid" : ""
                        }`}
                        name="fromAccount"
                        onChange={handleUserInput}
                        value={transferRequest.fromAccount || ""}
                      >
                        <option value="" disabled>
                          Select  Account
                        </option>
                        {accounts.map((account) => (
                          <option
                            key={account.id}
                            value={account.accountNumber}
                          >
                            {account.accountNumber} - {account.currency}
                          </option>
                        ))}
                      </select>
                      {errors.fromAccount && (
                        <div className="invalid-feedback">
                          {errors.fromAccount}
                        </div>
                      )}
                    </div>
                    {matchedAccount && (
                      <div className="mb-3">
                        <label className="form-label">
                          <b>Account Details</b>
                        </label>
                        <div>
                          Account Number: {matchedAccount.accountNumber} &nbsp;
                          ||&nbsp; Currency: {matchedAccount.currency}
                          <br />
                           <div>Account Balance: {matchedAccount.accountBalance}</div>
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">
                        <b>To Account</b>
                      </label>
                      <select
                        className={`form-select ${
                          errors.fromAccount ? "is-invalid" : ""
                        }`}
                        name="toAccount"
                        onChange={handleUserInput}
                        value={transferRequest.toAccount || ""}
                      >
                        <option value="" disabled>
                          Select  Account
                        </option>
                        {accounts.map((account) => (
                          <option
                            key={account.id}
                            value={account.accountNumber}
                          >
                            {account.accountNumber} - {account.currency}
                          </option>
                        ))}
                      </select>
                      {errors.fromAccount && (
                        <div className="invalid-feedback">
                          {errors.fromAccount}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        <b>Amount</b>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${
                          errors.amount ? "is-invalid" : ""
                        }`}
                        name="amount"
                        value={transferRequest.amount || ""}
                        onChange={handleUserInput}
                        required
                      />
                      {errors.amount && (
                        <div className="invalid-feedback">{errors.amount}</div>
                      )}
                    </div>
                    <div className="">
                      <p>
                        {" "}
                        Amount: {amount || "N/A"} &nbsp;||&nbsp; Fee:{" "}
                        {calculatedFee || "N/A"} &nbsp; ||&nbsp; Total Amount :{" "}
                        {Number(calculatedFee) + Number(amount) || "N/A"}{" "}
                        {transferRequest.fromCurrency || ""}
                      </p>
                      <p>
                        Converted Amount:
                        {transferRequest.convertedAmount || "N/A"}{" "}
                        {transferRequest?.toCurrency || ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn bg-color custom-bg-text"
                      onClick={() => navigate("/customer/UserAccounts")}
                      >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />{" "}
                      Back
                    </button>
                    &nbsp;
                    <button
                      type="submit"
                      className="btn bg-color custom-bg-text ms-auto"
                    >
                      Transfer
                    </button>
                  </form>
                </div>
              </div>
    </div>
  );
};

export default MoneyExchange;
