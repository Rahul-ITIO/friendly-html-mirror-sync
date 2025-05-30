//The AccountTransfer component manages and displays account transfer details, including handling internal and external transfers, fetching fee details, and managing states related to account transfers.
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
  faPaperPlane,
  faArrowLeft,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";

const AccountTransfer = () => {
  const [transferRequest, setTransferRequest] = useState({});
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const [accounts, setAccounts] = useState([]);
  const [toAccounts, setToAccounts] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({});
  const [errors, setErrors] = useState({});
  const [matchedAccount, setMatchedAccount] = useState(null);
  const [userName, setUserName] = useState(null);
  const [feeDetail, setFeeDetail] = useState([]);
  const [amount, setAmount] = useState(0);
  const [calculatedFee, setCalculatedFee] = useState(0);
  const [showInternalTransfer, setShowInternalTransfer] = useState(false);
  const [showExternalTransfer, setShowExternalTransfer] = useState(false); // New state for external transfer

  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  let navigate = useNavigate();
  useEffect(() => {
    const getAllFeeDetails = async () => {
      const feeResponse = await retrieveFeeDetails();
      if (feeResponse) {
        const feeType = "Debit Transaction";
        const feeObject = feeResponse.feeDetails.find(
          (item) => item.type === feeType
        );
        setFeeDetail(feeObject);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${customer.id}`
        );
        const activeAccounts = response.data.accounts.filter(
          (account) => account.status.toLowerCase() === "active"
        );
        setAccounts(activeAccounts);
        if (activeAccounts.length > 0) {
          setTransferRequest((prevState) => ({
            ...prevState,
            fromAccount: activeAccounts[0].accountNumber,
          }));
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

    getAllFeeDetails();
    fetchAccounts();
    fetchToAccounts();
    fetchExchangeRates();
  }, []);

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
  const calculateFee = (amount) => {
    if (feeDetail) {
      const feePercentage = feeDetail.fee;
      const fee = (amount * feePercentage) / 100;
      const minimumFee = feeDetail.feeAmount;
      const finalFee = Math.max(fee, minimumFee);

      setCalculatedFee(finalFee);
    }
  };
  const handleUserInput = async (e) => {
    const { name, value } = e.target;
    setTransferRequest({ ...transferRequest, [name]: value });
    if (name === "amount") {
      calculateFee(value);
      setAmount(value);
    }
    if (name === "toAccount") {
      const matched = toAccounts.find(
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
        console.log("Exchange rate:", exchangeRate);
    console.log("Converted amount:", convertedAmount);
        setTransferRequest((prevState) => ({
          ...prevState,
         fromCurrency: fromCurrency,
        toCurrency: toCurrency,
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
          toCurrency: toCurrency,
          toAmount: convertedAmount,
        }));
      }
    }
    if(name==="toCurrency"){
      const fromAccount = accounts.find(
        (account) => account.accountNumber === transferRequest.fromAccount
      );
      const fromCurrency = fromAccount.currency;
      const toCurrency = value;
      const exchangeRate =
        exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      const convertedAmount = (Number(transferRequest.amount) * exchangeRate).toFixed(2);
       console.log("From currency:", fromCurrency);
    console.log("To currency:", toCurrency);
    console.log("Exchange rate:", exchangeRate);
    console.log("Converted amount:", convertedAmount);
      setTransferRequest((prevState) => ({
        ...prevState,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        toAmount: convertedAmount,
      }));
    }
  };

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
      console.log("Convert Amount - From currency:", fromCurrency);
    console.log("Convert Amount - To currency:", toCurrency);
    console.log("Exchange rate:", exchangeRate);
    console.log("Converted amount:", convertedAmount);
      setTransferRequest((prevState) => ({
        ...prevState,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
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
        toCurrency: toCurrency,
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

  const handleTransferClick = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        console.log("Transfer request data:", transferRequest);
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/transaction/accountTransfer/internal`,
          {
            fromAccount: transferRequest.fromAccount,
            toAccount: transferRequest.toAccount,
            amount: Number(transferRequest.amount) + Number(calculatedFee),
            toAmount: transferRequest.convertedAmount,
            userId: customer.id,
            fee: Number(calculatedFee),
            beneficiaryName:userName,
            fromCurrency: transferRequest.fromCurrency,
            toCurrency: transferRequest.toCurrency,
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
          toast.error(response.data.responseMessage, {
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

  const handleExternalTransfer = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/transaction/accountTransfer`,
        {
          ...transferRequest,
          accountNumber: transferRequest.fromAccount,
          toAccount: transferRequest.toAccount,
          amount: Number(transferRequest.amount) + Number(calculatedFee),
          // toAmount: transferRequest.convertedAmount,
          userId: customer.id,
          fee: Number(calculatedFee),
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
        toast.error(response.data.responseMessage, {
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
      console.error(
        "Error during transfer:",
        error.response.data.responseMessage
      );
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
  };

  const handleTransferTypeClick = (type) => {
    if (type === "internal") {
      setShowInternalTransfer(true);
      setShowExternalTransfer(false);
    } else if (type === "external") {
      setShowExternalTransfer(true);
      setShowInternalTransfer(false);
    }
  };

  return (
    <div>
      {!showInternalTransfer && !showExternalTransfer ? (
        <div className="mt-5 mt-2">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="text-center mb-4">
                    <FontAwesomeIcon icon={faDollar} className="me-2" />
                    Transfer Money
                  </h2>
                  <div className="d-flex justify-content-center mb-4">
                    <button
                      className="btn custom-btn-primary btn-lg me-3"
                      onClick={() => handleTransferTypeClick("internal")}
                    >
                      <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                      Internal Transfer
                    </button>
                    <button
                      className="btn custom-btn-secondary btn-lg"
                      onClick={() => handleTransferTypeClick("external")}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      External Transfer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {showInternalTransfer && (
            <div className="mt_3 d-flex align-items-center justify-content-center">
              <div
                className="card form-card border-color custom-bg"
                style={{
                  width: "25rem",
                }}
              >
                <div className="card-header text-center custom-bg-text">
                  <h4 className="text-color">Internal Transfer</h4>
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
                          Select From Account
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
                        <b>To Account</b>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.toAccount ? "is-invalid" : ""
                        }`}
                        name="toAccount"
                        value={transferRequest.toAccount || ""}
                        onChange={handleUserInput}
                        required
                      />
                      {errors.toAccount && (
                        <div className="invalid-feedback">
                          {errors.toAccount}
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
                          {userName && <div>User Name: {userName}</div>}
                        </div>
                      </div>
                    )}
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
                        {matchedAccount?.currency || ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn bg-color custom-bg-text"
                      onClick={() => setShowInternalTransfer(false)}
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
          )}

          {showExternalTransfer && (
            <div className="mt_3 d-flex align-items-center justify-content-center">
              <div
                className="card form-card border-color custom-bg"
                style={{ width: "60rem" }}
              >
                <div className="card-header ">
                  <h4 className="text-color">External Transfer</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleExternalTransfer}>
                    <div className="row">
                      {/* Left Section */}
                      <div className="col-md-4 card">
                        <div className="card-header text-center custom-bg-text">
                          <h5 className="text-color">Payment Info</h5>
                        </div>
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
                              Select From Account
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
                            <div className="invalid-feedback">
                              {errors.amount}
                            </div>
                          )}
                        </div>
                       <div className="mb-3">
                          <label className="form-label">
                            <b>To Currency</b>
                          </label>
                          <select
                            className={`form-select ${
                              errors.toCurrency ? "is-invalid" : ""
                            }`}
                            name="toCurrency"
                            onChange={handleUserInput}
                            value={transferRequest.toCurrency || ""}
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
                          {errors.toCurrency && (
                            <div className="invalid-feedback">
                              {errors.toCurrency}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 bg-light p-3 rounded">
                          <p>
                            <b>Amount:</b> {transferRequest.amount || "N/A"}{" "}
                            {transferRequest.fromCurrency || ""}
                            &nbsp;&nbsp;
                            <b>Fee:</b> {calculatedFee || "N/A"}{" "}
                            {transferRequest.fromCurrency || ""}
                          </p>
                          <p>
                            <b>Total Amount:</b>{" "}
                            {Number(calculatedFee) +
                              Number(transferRequest.amount) || "N/A"}{" "}
                            {transferRequest.fromCurrency || ""}
                          </p>
                          <p>
                            <b>Converted Amount:</b>{" "}
                            {transferRequest.toAmount || "N/A"}{" "}
                            {transferRequest.toCurrency || ""}
                          </p>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="col-md-8 card">
                        <div className="card-header text-center custom-bg-text">
                          <h5 className="text-color">Bank Info</h5>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>Recipient's Bank Account</b>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.toBankAccount ? "is-invalid" : ""
                              }`}
                              name="toBankAccount"
                              value={transferRequest.toBankAccount || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.toBankAccount && (
                              <div className="invalid-feedback">
                                {errors.toBankAccount}
                              </div>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>IFSC Code / Swift Code</b>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.toBankIfsc ? "is-invalid" : ""
                              }`}
                              name="toBankIfsc"
                              value={transferRequest.toBankIfsc || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.toBankIfsc && (
                              <div className="invalid-feedback">
                                {errors.toBankIfsc}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>Recipient's Name</b>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.beneficiaryName ? "is-invalid" : ""
                              }`}
                              name="beneficiaryName"
                              value={transferRequest.beneficiaryName || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.beneficiaryName && (
                              <div className="invalid-feedback">
                                {errors.beneficiaryName}
                              </div>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>Bank Name</b>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.bankName ? "is-invalid" : ""
                              }`}
                              name="bankName"
                              value={transferRequest.bankName || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.bankName && (
                              <div className="invalid-feedback">
                                {errors.bankName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>Recipient's Phone Number</b>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${
                                errors.recipientPhone ? "is-invalid" : ""
                              }`}
                              name="recipientPhone"
                              value={transferRequest.recipientPhone || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.recipientPhone && (
                              <div className="invalid-feedback">
                                {errors.recipientPhone}
                              </div>
                            )}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              <b>Recipient's Email</b>
                            </label>
                            <input
                              type="email"
                              className={`form-control ${
                                errors.recipientEmail ? "is-invalid" : ""
                              }`}
                              name="recipientEmail"
                              value={transferRequest.recipientEmail || ""}
                              onChange={handleUserInput}
                              required
                            />
                            {errors.recipientEmail && (
                              <div className="invalid-feedback">
                                {errors.recipientEmail}
                              </div>
                            )}
                          </div>
                        </div>{" "}
                        <div className="row">

                        <div className="col-md-6 mb-3">
                        <label className="form-label">
                            <b>Bank Address</b>
                          </label>
                          <input
                            type="address"
                            className={`form-control ${
                              errors.bankAddress ? "is-invalid" : ""
                            }`}
                            name="bankAddress"
                            value={transferRequest.bankAddress || ""}
                            onChange={handleUserInput}
                            required
                          />
                          {errors.bankAddress && (
                            <div className="invalid-feedback">
                              {errors.bankAddress}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 mb-3">
                        <label className="form-label">
                            <b>Country</b>
                          </label>
                          <select
                            name="country"
                            onChange={handleUserInput}
                            className="form-control"
                          >
                            <option value="">Select Country</option>
                            <option value="Afghanistan">Afghanistan</option>
                            <option value="Albania">Albania</option>
                            <option value="Algeria">Algeria</option>
                            <option value="Andorra">Andorra</option>
                            <option value="Angola">Angola</option>
                            <option value="Antigua and Barbuda">
                              Antigua and Barbuda
                            </option>
                            <option value="Argentina">Argentina</option>
                            <option value="Armenia">Armenia</option>
                            <option value="Australia">Australia</option>
                            <option value="Austria">Austria</option>
                            <option value="Azerbaijan">Azerbaijan</option>
                            <option value="Bahamas">Bahamas</option>
                            <option value="Bahrain">Bahrain</option>
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="Barbados">Barbados</option>
                            <option value="Belarus">Belarus</option>
                            <option value="Belgium">Belgium</option>
                            <option value="Belize">Belize</option>
                            <option value="Benin">Benin</option>
                            <option value="Bhutan">Bhutan</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Bosnia and Herzegovina">
                              Bosnia and Herzegovina
                            </option>
                            <option value="Botswana">Botswana</option>
                            <option value="Brazil">Brazil</option>
                            <option value="Brunei">Brunei</option>
                            <option value="Bulgaria">Bulgaria</option>
                            <option value="Burkina Faso">Burkina Faso</option>
                            <option value="Burundi">Burundi</option>
                            <option value="Cabo Verde">Cabo Verde</option>
                            <option value="Cambodia">Cambodia</option>
                            <option value="Cameroon">Cameroon</option>
                            <option value="Canada">Canada</option>
                            <option value="Central African Republic">
                              Central African Republic
                            </option>
                            <option value="Chad">Chad</option>
                            <option value="Chile">Chile</option>
                            <option value="China">China</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Comoros">Comoros</option>
                            <option value="Congo">Congo</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Croatia">Croatia</option>
                            <option value="Cuba">Cuba</option>
                            <option value="Cyprus">Cyprus</option>
                            <option value="Czech Republic">
                              Czech Republic
                            </option>
                            <option value="Denmark">Denmark</option>
                            <option value="Djibouti">Djibouti</option>
                            <option value="Dominica">Dominica</option>
                            <option value="Dominican Republic">
                              Dominican Republic
                            </option>
                            <option value="East Timor">East Timor</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Egypt">Egypt</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Equatorial Guinea">
                              Equatorial Guinea
                            </option>
                            <option value="Eritrea">Eritrea</option>
                            <option value="Estonia">Estonia</option>
                            <option value="Eswatini">Eswatini</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Fiji">Fiji</option>
                            <option value="Finland">Finland</option>
                            <option value="France">France</option>
                            <option value="Gabon">Gabon</option>
                            <option value="Gambia">Gambia</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Germany">Germany</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Greece">Greece</option>
                            <option value="Grenada">Grenada</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Guinea">Guinea</option>
                            <option value="Guinea-Bissau">Guinea-Bissau</option>
                            <option value="Guyana">Guyana</option>
                            <option value="Haiti">Haiti</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Hungary">Hungary</option>
                            <option value="Iceland">Iceland</option>
                            <option value="India">India</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Iran">Iran</option>
                            <option value="Iraq">Iraq</option>
                            <option value="Ireland">Ireland</option>
                            <option value="Israel">Israel</option>
                            <option value="Italy">Italy</option>
                            <option value="Jamaica">Jamaica</option>
                            <option value="Japan">Japan</option>
                            <option value="Jordan">Jordan</option>
                            <option value="Kazakhstan">Kazakhstan</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Kiribati">Kiribati</option>
                            <option value="Korea, North">Korea, North</option>
                            <option value="Korea, South">Korea, South</option>
                            <option value="Kosovo">Kosovo</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                            <option value="Laos">Laos</option>
                            <option value="Latvia">Latvia</option>
                            <option value="Lebanon">Lebanon</option>
                            <option value="Lesotho">Lesotho</option>
                            <option value="Liberia">Liberia</option>
                            <option value="Libya">Libya</option>
                            <option value="Liechtenstein">Liechtenstein</option>
                            <option value="Lithuania">Lithuania</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Madagascar">Madagascar</option>
                            <option value="Malawi">Malawi</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Maldives">Maldives</option>
                            <option value="Mali">Mali</option>
                            <option value="Malta">Malta</option>
                            <option value="Marshall Islands">
                              Marshall Islands
                            </option>
                            <option value="Mauritania">Mauritania</option>
                            <option value="Mauritius">Mauritius</option>
                            <option value="Mexico">Mexico</option>
                            <option value="Micronesia">Micronesia</option>
                            <option value="Moldova">Moldova</option>
                            <option value="Monaco">Monaco</option>
                            <option value="Mongolia">Mongolia</option>
                            <option value="Montenegro">Montenegro</option>
                            <option value="Morocco">Morocco</option>
                            <option value="Mozambique">Mozambique</option>
                            <option value="Myanmar">Myanmar</option>
                            <option value="Namibia">Namibia</option>
                            <option value="Nauru">Nauru</option>
                            <option value="Nepal">Nepal</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Niger">Niger</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="North Macedonia">
                              North Macedonia
                            </option>
                            <option value="Norway">Norway</option>
                            <option value="Oman">Oman</option>
                            <option value="Pakistan">Pakistan</option>
                            <option value="Palau">Palau</option>
                            <option value="Palestine">Palestine</option>
                            <option value="Panama">Panama</option>
                            <option value="Papua New Guinea">
                              Papua New Guinea
                            </option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Peru">Peru</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Poland">Poland</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Qatar">Qatar</option>
                            <option value="Romania">Romania</option>
                            <option value="Russia">Russia</option>
                            <option value="Rwanda">Rwanda</option>
                            <option value="Saint Kitts and Nevis">
                              Saint Kitts and Nevis
                            </option>
                            <option value="Saint Lucia">Saint Lucia</option>
                            <option value="Saint Vincent and the Grenadines">
                              Saint Vincent and the Grenadines
                            </option>
                            <option value="Samoa">Samoa</option>
                            <option value="San Marino">San Marino</option>
                            <option value="Sao Tome and Principe">
                              Sao Tome and Principe
                            </option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="Senegal">Senegal</option>
                            <option value="Serbia">Serbia</option>
                            <option value="Seychelles">Seychelles</option>
                            <option value="Sierra Leone">Sierra Leone</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Slovakia">Slovakia</option>
                            <option value="Slovenia">Slovenia</option>
                            <option value="Solomon Islands">
                              Solomon Islands
                            </option>
                            <option value="Somalia">Somalia</option>
                            <option value="South Africa">South Africa</option>
                            <option value="South Sudan">South Sudan</option>
                            <option value="Spain">Spain</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                            <option value="Sudan">Sudan</option>
                            <option value="Suriname">Suriname</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Syria">Syria</option>
                            <option value="Taiwan">Taiwan</option>
                            <option value="Tajikistan">Tajikistan</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Togo">Togo</option>
                            <option value="Tonga">Tonga</option>
                            <option value="Trinidad and Tobago">
                              Trinidad and Tobago
                            </option>
                            <option value="Tunisia">Tunisia</option>
                            <option value="Turkey">Turkey</option>
                            <option value="Turkmenistan">Turkmenistan</option>
                            <option value="Tuvalu">Tuvalu</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Ukraine">Ukraine</option>
                            <option value="United Arab Emirates">
                              United Arab Emirates
                            </option>
                            <option value="United Kingdom">
                              United Kingdom
                            </option>
                            <option value="United States">United States</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Uzbekistan">Uzbekistan</option>
                            <option value="Vanuatu">Vanuatu</option>
                            <option value="Vatican City">Vatican City</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Yemen">Yemen</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                          </select>
                        </div></div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowExternalTransfer(false)}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} className="me-2" />{" "}
                        Back
                      </button>
                      <button type="submit" className="btn btn-primary ms-auto">
                        Transfer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default AccountTransfer;
