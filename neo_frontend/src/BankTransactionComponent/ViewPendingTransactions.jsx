import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ViewPendingTransactions = () => {
  let navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState([]);
  const [editTransaction, setEditTransaction] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterType, setFilterType] = useState("user");
  const [filterValue, setFilterValue] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateUserStatusRequest, setUpdateUserStatusRequest] = useState({
    userId: "",
    status: "",
  });

  const retrieveAllTransactions = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/transaction/fetch/transactions/pending`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
        },
      }
    );
    console.log(response.data);
    return response.data;
  };
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

  const handleStatusChange = (e) => {
    setEditTransaction({
      ...editTransaction,
      status: e.target.value,
    });
  };

  const handleEditTransaction = (index) => {
    console.log(allTransactions[index]);
    setEditTransaction(allTransactions[index]);
    console.log(editTransaction);
    setShowModal(true);
  };

  const handleCloseEditForm = () => {
    setEditTransaction("");
    setShowModal(false);
  };

  const handleSubmitEdit = () => {
    if(editTransaction.status==="Pending"){
      console.log("Didn't get success response");
      toast.error("Status is same , change then save", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    }
else{
  setIsSubmitting(true); // Start loading
    fetch(`${process.env.REACT_APP_BASE_URL}/api/transaction/update/status`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + admin_jwtToken,
      },
      body: JSON.stringify({
        userId: editTransaction?.id,
        status: editTransaction?.status,
      }),
    })
      .then((result) => {
        console.log("result", result);
        result.json().then((res) => {
          console.log(res);
          setShowModal(false);
          setIsSubmitting(false); // End loading
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


          } else {
            console.log("Didn't get success response");
            toast.error("It seems server is down", {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setTimeout(() => {
              window.location.reload(true);
            }, 1000); // Redirect after 3 seconds
          }
        });
      })
      .catch((error) => {
        console.error(error);
        setIsSubmitting(false); // End loading on error
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.reload(true);
        }, 1000); // Redirect after 3 seconds
      });}
  };

  return (
    <div>
      <div className="container " style={{ display: showModal ? "none" : "block" }}>
        <div
        >
          <div className="card-header custom-bg-text text-center">
            <h4 className=" text-color m-2">Customer Pending Transactions</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
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
                    {allTransactions.map((transaction, index) => (
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
      <div className="m-2" style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="card custom-bg border-color shadow-lg p-4">
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
                    <b>Amount:</b> {editTransaction?.amount || "None"}&nbsp;{editTransaction?.fromCurrency || ""}

                  </div>
                  <div className="col-md-6">
                    <b>Fee:</b> {editTransaction?.fee || "None"}
                  </div>
                  <div className="col-md-6">
                    <b>Total Bill Amount:</b>{" "}
                    {parseFloat(editTransaction?.billAmount || "0")}&nbsp;{editTransaction?.toCurrency || ""}
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
                    <select
                      className="form-select"
                      value={editTransaction?.status || "None"}
                      onChange={handleStatusChange}
                    >
                      <option value="Success">Success</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Failed">Failed</option>
                    </select>
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
                &nbsp;
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
                {/* {isSubmitting && (
  <div className="spinner-border text-primary" role="status">
    <span className="sr-only">Loading...</span>
  </div>
)} */}
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
            border-bottom: 1px solid rgb(138, 96, 201);
            padding-bottom: 0.5rem;
            color: rgb(188, 148, 250);;
          }
          .shadow-lg {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ViewPendingTransactions;
