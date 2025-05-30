//The code provides a user-friendly interface for administrators to manage bank account details. It facilitates CRUD (Create, Read, Update, Delete) operations for bank accounts, ensuring smooth data handling and providing feedback to the user through notifications.
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const CommonBankAccounts = ({ accounts, setAccounts, currencies }) => {
   // Retrieve JWT token from session storage for authorization
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  // State to manage the visibility of the modal (for adding/editing accounts)
  const [showModal, setShowModal] = useState(false);
  // State to track the index of the account being edited
  const [editIndex, setEditIndex] = useState("");
  // State to hold the details of the account being added or edited
  const [editedAccount, setEditedAccount] = useState({
    id: "",
    beneficiary: "",
    bankName: "",
    iban: "",
    swiftCode: "",
    bankAddress: "",
    status: "Active",
    currencyMap: [], // Array to store selected currencies
  });
// Function to handle form submission (for adding or updating an account)
  const handleSubmit = async (e) => {
    e.preventDefault();
    let errorMessage = "";  // Variable to track the error message

  // Check if currencies are selected
  if (!editedAccount.currencyMap || editedAccount.currencyMap.length === 0) {
    errorMessage = "Please select currencies.";
  }
   /* if (editedAccount.currencyMap === 0) {
      // Notify the user to select currencies
      toast.error("Please select currencies", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; // Exit the function
    }*/

    if (
      !editedAccount.beneficiary.trim()){
        errorMessage = "Beneficiary is mandatory.";
      }
     else if (!editedAccount.bankName.trim()) {
      errorMessage = "Bank name is mandatory.";
    } else if (!editedAccount.iban.trim()) {
      errorMessage = "IBAN is mandatory.";
    } else if (!editedAccount.swiftCode.trim()) {
      errorMessage = "SWIFT code is mandatory.";
    } else if (!editedAccount.bankAddress.trim()) {
      errorMessage = "Bank address is mandatory.";
    } else if (!editedAccount.status.trim()) {
      errorMessage = "Status is mandatory.";
    }
    if (errorMessage) {
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return; // Exit the function
    }
    try {
      // Make POST request to the API endpoint to add account
      console.log(editedAccount);
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/addAccount`,
        editedAccount,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      // Notify success
      toast.success("Account added successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Pass new account data to parent component
      fetchAccountData();
      handleCloseModal();
    } catch (error) {
      // Notify error
      toast.error("Failed to add account", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error adding account:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedAccount({
      id: "",
      beneficiary: "",
      bankName: "",
      iban: "",
      swiftCode: "",
      bankAddress: "",
      status: "Active",
      currencyMap: [],
    });
  };

  const handleEdit = (index) => {
    setShowModal(true);
    setEditedAccount(accounts[index]);
    setEditIndex(index);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/deleteAccount`,
        id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      // Display toast message after successful deletion
      toast.success("Account deleted successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Find the index of the deleted account
      fetchAccountData();
      setEditedAccount({
        id: "",
        beneficiary: "",
        bankName: "",
        iban: "",
        swiftCode: "",
        bankAddress: "",
        status: "Active",
        currencyMap: [],
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      // Handle error
    }
  };
  const fetchAccountData = async () => {
    try {
      // Fetch account data from the server
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchAccount`
      );
      // Update the account state with the fetched data
      setAccounts(response.data.commonBankAccountDetais);
    } catch (error) {
      // Handle error
      console.error("Error fetching account data:", error);
      // Notify error
      toast.error("Failed to fetch account data", {
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
    <div className="container_2">
      <div className="mt_2" style={{ display: showModal ? "none" : "block" }}>
        <h3 className="text-center text-primary">Added Common Bank Accounts</h3>
        &nbsp;<button
          className="btn btn-primary"
          style={{
            position: "absolute",
            top: "80px", // Adjust as needed
            right: "50px", // Adjust as needed
          }}
          onClick={() => setShowModal(true)}
        >
          {" "}
          ADD <FaPlus />
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>
                <b>Beneficiary </b>
              </th>
              <th>
                <b>Bank Name</b>
              </th>
              <th>
                <b>IBAN/ Bank Account Number</b>
              </th>
              <th>
                <b>Swift Code/ BIC </b>
              </th>
              <th>
                <b> Bank Address</b>
              </th>
              <th>
                <b>Currencies </b>
              </th>
              <th>
                <b>Status</b>
              </th>
              <th>
                <b>Action</b>
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr key={index}>
                <td>{account.beneficiary}</td>
                <td>{account.bankName}</td>
                <td>{account.iban}</td>
                <td>{account.swiftCode}</td>
                <td>{account.bankAddress}</td>
                <td>
                  {account.currencyMap
                    .map((currencyId) => {
                      const currency = currencies.find(
                        (c) => c.id === currencyId.id
                      );
                      return currency ? currency.name : "";
                    })
                    .join(", ")}
                </td>
                <td>{account.status}</td>
                <td>
                  &nbsp;<button
                    className="btn btn-primary me-2"
                    onClick={() => handleEdit(index)}
                  >
                    <FaEdit />
                  </button>
                  &nbsp;<button
                    className="btn btn-danger"
                    onClick={() => handleDelete(account)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-2" style={{ display: showModal ? "block" : "none" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editIndex !== "" ? "Edit" : "Add"} Common Bank Account
              </h5>
              &nbsp;<button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Beneficiary</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedAccount.beneficiary}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        beneficiary: e.target.value,
                      })
                    }
                    placeholder="Beneficiary"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedAccount.bankName}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        bankName: e.target.value,
                      })
                    }
                    placeholder="Bank Name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    IBAN/ Bank Account Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedAccount.iban}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        iban: e.target.value,
                      })
                    }
                    placeholder="IBAN/ Bank Account Number"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Swift Code/ BIC</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedAccount.swiftCode}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        swiftCode: e.target.value,
                      })
                    }
                    placeholder="Swift Code/ BIC"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label"> Bank Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedAccount.bankAddress}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        bankAddress: e.target.value,
                      })
                    }
                    placeholder="Bank Address"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Currencies</label>
                  <select
                    className="form-select"
                    value={editedAccount.currencyMap}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        currencyMap: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    multiple // Enable multiple selection
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editedAccount.status}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        status: e.target.value,
                      })
                    }
                    placeholder="Status"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              &nbsp;<button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
              &nbsp;
              &nbsp;<button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrencyApp = () => {
  const [currencies, setCurrencies] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const handleAddCurrency = (newCurrency) => {
    // Update the list of currencies with the new currency
    setCurrencies([...currencies, newCurrency]);
  };

  useEffect(() => {
    // Function to fetch currencies data from the API
    const fetchCurrencies = async () => {
      try {
        // Make GET request to the API endpoint to fetch currencies
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/currencies/fatch`
        );
        // Set the fetched currencies data to state
        setCurrencies(response.data.currencyDetails);
        const response1 = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchAccount`
        );
        setAccounts(response1.data.commonBankAccountDetais);
      } catch (error) {
        // Handle error if fetching data fails
        console.error("Error fetching currencies:", error);
        // Notify error
        toast.error("Failed to fetch currencies", {
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

    // Call the fetchCurrencies function when the component mounts
    fetchCurrencies();
  }, []); // Empty dependency array ensures that the effect runs only once, on component mount

  return (
    <div className="container">
      <div
        className="card  "
        style={{
          height: "45rem",
        }}
      >
        <div className="card-header custom-bg-text">
          <h6 className=" text-color " >Common Bank Accounts Detail</h6>
        </div>
        <div
          className="card-body d-flex flex-column"
          style={{
            overflowY: "auto",
          }}
        >
          <CommonBankAccounts
            accounts={accounts}
            setAccounts={setAccounts}
            currencies={currencies}
          />
        </div>
      </div>
    </div>
  );
};

export default CurrencyApp;
