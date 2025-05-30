import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-solid-svg-icons";

const ViewCustomerTransactions = () => {
  // Create a reference for the component to be printed as a PDF
 // const componentPDF = useRef();

  // State variables for handling transactions and filters
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("user");
  const [filterValue, setFilterValue] = useState("");
  const [transactionRefId, setTransactionRefId] = useState("");

  const [dateRange, setDateRange] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [editTransaction, setEditTransaction] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Retrieve the admin JWT token from session storage
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));

  const retrieveAllTransactions = async () => {
    // search transactions by ref id
    if (transactionRefId !== "") {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transaction/search/customer/transactions/ref-id?customerId=` +
          customer.id +
          "&transactionRefId=" +
          transactionRefId,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );

      return response.data;
    } else {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transaction/fetch/customer/transactions/all?customerId=` +
          customer.id,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );

      return response.data;
    }
  };

  // useEffect to fetch all transactions when the component mounts
  useEffect(() => {
    const getAllTransactions = async () => {
      let transactions = await retrieveAllTransactions();
      if (transactions) {
        transactions = transactions.transactions.slice();
        transactions.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          return dateB - dateA; // For descending order (latest date first)
          // return dateB - dateA; // For descending order
        });
        setAllTransactions(transactions);
      }
    };

    getAllTransactions();
  }, []);

  // useEffect to filter transactions whenever relevant state variables change
  useEffect(() => {
    const filterTransactions = () => {
      let filtered = [...allTransactions];

      // Filter by text
      if (filterType === "user") {
        filtered = filtered.filter((transaction) =>
          transaction.user.name
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      } else if (filterType === "transactionId") {
        filtered = filtered.filter((transaction) =>
          transaction.transactionRefId
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      } else if (filterType === "billAmount") {
        filtered = filtered.filter(
          (transaction) =>
            transaction.amount.toString().toLowerCase() ===
            filterValue.toLowerCase()
        );
      }

      // Filter by date range
      if (dateRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getDay() === today.getDay();
        });
      } else if (dateRange === "last7days") {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= last7Days;
        });
      } else if (dateRange === "last30days") {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= last30Days;
        });
      } else if (dateRange === "custom") {
        if (customDate) {
          const customDateObj = new Date(customDate);
          filtered = filtered.filter((transaction) => {
            const transactionDate = new Date(transaction.date);
            return (
              transactionDate.toDateString() === customDateObj.toDateString()
            );
          });
        }
      }

      // Filter by status
      if (filterStatus !== "All Status") {
        filtered = filtered.filter(
          (transaction) => transaction.status === filterStatus
        );
      }

      // Update the filtered transactions state
      setFilteredTransactions(filtered);
    };

    filterTransactions();
  }, [
    allTransactions,
    filterType,
    filterValue,
    dateRange,
    customDate,
    filterStatus,
  ]);

  // Handlers for filter inputs
  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    if (value !== "custom") {
      setCustomDate(""); // Reset custom date when another option is selected
    }
  };

  const handleCustomDateChange = (e) => {
    setCustomDate(e.target.value);
  };

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Handler for editing a transaction
  const handleEditTransaction = (index) => {
    console.log(allTransactions[index]);
    setEditTransaction(allTransactions[index]);
    console.log(editTransaction);
    setShowModal(true);
  };

  // Handler for closing the edit form
  const handleCloseEditForm = () => {
    setEditTransaction("");
    setShowModal(false);
  };

  // Handler for editing transaction input fields
  const handleEditInputChange = (e, field) => {
    if (!e || !e.target || typeof e.target.value === "undefined") {
      return; // Add a check for event object and target value
    }
    const { value } = e.target;
    setEditTransaction((prevTransaction) => ({
      ...prevTransaction,
      [field]: value,
    }));
  };

 
  // Handler for generating a PDF of the transactions
  const downloadCSV = () => {
    const csvRows = [];
    const headers = ['TransId', 'Customer Name', 'Transaction Amount', 'Type', ' Bill Amount','Date&Time','Status','Action'];
    csvRows.push(headers.join(','));

      // Add data rows for each transaction
      allTransactions.forEach(transaction => {
        const row = [
          transaction.transactionRefId,             // Transaction ID
          transaction.user?.name || 'N/A',          // User (Handle null/undefined)
          `${transaction.billAmount} ${transaction.toCurrency}`,  // Bill Amount and Currency
          transaction.type,                          // Type
          `${transaction.amount} ${transaction.fromCurrency}`,  // Amount and Currency
          new Date(transaction.date).toLocaleDateString(),  // Date (formatted)
          transaction.status ? transaction.status : '-'  // Status (Handle null/undefined)
        ];
        csvRows.push(row.join(','));  // Join the row as a CSV line
      });
      // Create CSV content as a string
    const csvContent = csvRows.join('\n');
    
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);  // Create a download URL for the Blob
    link.download = 'transactions.csv';     // Set the name of the CSV file
    link.click();  // Trigger the download
  }

  return (
    <div className="container">
      <div className="mt_2" style={{ display: showModal ? "none" : "block" }}>
        <div
          className="card   "
          style={{
            height: "45rem",
          }}
        >
          <div className="card-header custom-bg-text text-center">
            <h4 className=" text-color ">Customer Transactions</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="row">
              <div className="col">
                <select
                  className="form-select mb-3"
                  value={filterType}
                  onChange={handleFilterTypeChange}
                >
                  <option value="user">User</option>
                  <option value="transactionId">Transaction ID</option>
                  <option value="billAmount">Bill Amount</option>
                </select>
              </div>
              <div className="col">
                <input
                  type="text"
                  className="form-control mb-3"
                  value={filterValue}
                  onChange={handleFilterChange}
                  placeholder="Filter..."
                />
              </div>
              <div className="col">
                <select
                  className="form-select mb-3"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                >
                  <option value="all">All</option>
                  <option value="today">Today</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {dateRange === "custom" && (
                <div className="col">
                  <input
                    type="date"
                    className="form-control mb-3"
                    value={customDate}
                    onChange={handleCustomDateChange}
                  />
                </div>
              )}
              <div className="col">
                <select
                  className="form-select mb-3"
                  value={filterStatus}
                  onChange={handleStatusChange}
                >
                  <option value="All Status">All Status</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Reject">Rejected</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="col">
                &nbsp;
                <button
                  className="btn bg-color custom-bg-text mb-3"
                  onClick={downloadCSV}
                >
                  Download Statement
                </button>
              </div>
            </div>
            <div className="table-responsive mt-3">
              <div style={{ width: "100%" }}>
                <table className="table table-hover text-color text-center">
                  <thead className="table-bordered border-color bg-color custom-bg-text">
                    <tr>
                      <th scope="col">TransId</th>
                      <th scope="col" className="text-start">
                        Customer Name
                      </th>
                      <th scope="col" className="text-start">
                        Transaction Amount
                      </th>
                      <th scope="col" className="text-start">
                        Type
                      </th>
                      <th scope="col" className="text-start">
                        Bill Amount
                      </th>
                      <th scope="col">Date&Time</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td>
                          <b>{transaction.transactionRefId}</b>
                        </td>
                        <td className="text-start">
                          <b>{transaction.user.name}</b>
                        </td>
                        <td className="text-start">
                          <b>{transaction.billAmount}</b>&nbsp;
                          <b>{transaction.toCurrency}</b>
                        </td>
                        <td className="text-start">
                          <b>{transaction.type}</b>
                        </td>
                        <td className="text-start">
                          <b>{transaction.amount}</b>&nbsp;
                          <b>{transaction.fromCurrency}</b>
                        </td>
                        <td>
                          <b>{transaction.date}</b>
                        </td>
                        <td>
                          <b>{transaction.status ? transaction.status : "-"}</b>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleEditTransaction(index)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt_3 " style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="card custom-bg border-color shadow-lg">
              <div className="card-header  text-center">
                <h4 className="text-color mb-0">Transaction Details</h4>
              </div>
              <div className="modal-header bg-light">
                <h3 className="modal-title">
                  User Name: {editTransaction?.user?.firstName || ""}
                </h3>
              </div>
              <div className="modal-body">
                <h5 className="section-title">Sender Details</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Sender Name:</b> {editTransaction?.senderName || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Sender Address:</b>{" "}
                    {editTransaction?.senderAddress || "None"}
                  </div>
                </div>

                <h5 className="section-title">Receiver Details</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Company Name:</b>{" "}
                    {editTransaction?.companyName || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Company Address:</b>{" "}
                    {editTransaction?.companyAddress || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Beneficiary Name:</b>{" "}
                    {editTransaction?.beneficiaryName || "None"}
                  </div>
                </div>

                <h5 className="section-title">Transaction Details</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Assign Currency:</b>{" "}
                    {editTransaction?.currency || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Assign Account No:</b>{" "}
                    {editTransaction?.accountNumber || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Amount:</b> {editTransaction?.amount || "None"}&nbsp;
                    {editTransaction?.fromCurrency || ""}
                  </div>
                  <div className="col-md-6">
                    <b>Fee:</b> {editTransaction?.fee || "one"}
                  </div>
                  <div className="col-md-6">
                    <b>Total Bill Amount:</b>{" "}
                    {parseFloat(editTransaction?.billAmount || "0")}&nbsp;
                    {editTransaction?.toCurrency || ""}
                  </div>
                  <div className="col-md-6">
                    <b>Transaction Type:</b> {editTransaction?.type || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Registration Number:</b>{" "}
                    {editTransaction?.transactionRefId || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Description:</b> {editTransaction?.description || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Date:</b> {editTransaction?.date || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Status:</b> {editTransaction?.status || "None"}
                  </div>
                </div>

                <h5 className="section-title">Bank Details</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <b>Bank Name:</b> {editTransaction?.bankName || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Bank Address:</b>{" "}
                    {editTransaction?.bankAddress || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Swift Code:</b> {editTransaction?.swiftCode || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Purpose:</b> {editTransaction?.purpose || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Country:</b> {editTransaction?.country || "None"}
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloseEditForm}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          .custom-bg {
            background-color: #f8f9fa;
          }
          .border-color {
            border-color: #dee2e6;
          }

          .text-color {
            color: #495057;
          }
          .section-title {
            font-size: 1.25rem;
            font-weight: bold;
            margin-top: 1rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #007bff;
            padding-bottom: 0.5rem;
            color: #007bff;
          }
          .shadow-lg {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
          .modal-header,
          .modal-footer {
            border: none;
          }
          .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ViewCustomerTransactions;
