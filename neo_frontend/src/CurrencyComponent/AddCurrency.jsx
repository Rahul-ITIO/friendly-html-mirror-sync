//The React code provides a user interface for adding, viewing, editing, deleting, and setting a default currency in a currency management system.
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import '../new-dash.css';

// Component for adding a new currency
const AddCurrency = ({ onAddCurrency }) => {
  const [currencyCode, setCurrencyCode] = useState("");
   // State variables to hold form input values
  const [currencyName, setCurrencyName] = useState("");
  const [currencyTerritory, setCurrencyTerritory] = useState("");
  const [currencyIcon, setCurrencyIcon] = useState("");
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");// Retrieve the JWT token from session storage

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form validation
    if (!currencyCode || !currencyName || !currencyTerritory || !currencyIcon) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      const Currency = {
        code: currencyCode,
        name: currencyName,
        territory: currencyTerritory,
        icon: currencyIcon,
        status: "Active",
      };
      // Make POST request to the API endpoint to add currency
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/add`,
        Currency,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      // Notify success
      toast.success("Currency added successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Pass new currency data to parent component
      onAddCurrency(Currency);
      
      // Reset form fields
    } catch (error) {
      // Notify error
      toast.error("Failed to add currency", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error adding currency:", error);
    }
  };

  return (
    <div className="add-currency-page px-4 bg-white">
<form
      className="mt-3"
      onSubmit={handleSubmit}
    >
      <div className="row g-2">
      <div className="col-xxl-10 col-lg-9 col-sm-8">
      <div className="row g-2">
      <div className="form-group col-sm-3">
        <input
          type="text"
          className="form-control mb-0"
          placeholder="Currency Code"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
        />
      </div>
      <div className="form-group col-sm-3">
        <input
          type="text"
          className="form-control mb-0"
          placeholder="Currency Name"
          value={currencyName}
          onChange={(e) => setCurrencyName(e.target.value)}
        />
      </div>
      <div className="form-group col-sm-3">
        <input
          type="text"
          className="form-control mb-0"
          placeholder="Currency Territory"
          value={currencyTerritory}
          onChange={(e) => setCurrencyTerritory(e.target.value)}
        />
      </div>
      <div className="form-group col-sm-3">
        <input
          type="text"
          className="form-control mb-0"
          placeholder="Currency Icon"
          value={currencyIcon}
          onChange={(e) => setCurrencyIcon(e.target.value)}
        />
      </div>
      </div>
      </div>
      <div className="col">
        <button type="submit" className="btn btn-primary w-100 h-100">
        Add Currency
      </button>
      </div>
      </div>
    </form>
    </div>
    
  );
};

const CurrencyList = ({ currencies, setCurrencies }) => {
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  const [showModal, setShowModal] = useState(false);
  const [editIndex, seteditIndex] = useState("");
  const [editedCurrency, setEditedCurrency] = useState({
    code: "",
    name: "",
    territory: "",
    icon: "",
    status: "Active",
    isDefault: false, // Add this line
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make POST request to the API endpoint to add currency
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/add`,
        editedCurrency,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      // Notify success
      toast.success("Currency added successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Pass new currency data to parent component      // Reset form fields
      // setCurrencies(editedCurrency, editedCurrency.id)
      setShowModal(false);
      
      setCurrencies(prevCurrencies => {
        const updatedCurrencies = [...prevCurrencies];
        updatedCurrencies[editIndex] = editedCurrency;
        return updatedCurrencies;
      });    } catch (error) {
      // Notify error
      toast.error("Failed to add currency", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error adding currency:", error);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleEdit = (index) => {
    setShowModal(true);
    setEditedCurrency(currencies[index]);
    seteditIndex(index)


  };
  const handleDelete = async (id) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/delete`,
        id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + admin_jwtToken,
          },
        }
      );
      // Display toast message after successful deletion
      toast.success("Currency deleted successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Find the index of the deleted currency
      const index = currencies.findIndex((currency) => currency.id === id);
      if (index !== -1) {
        // Create a new array without the deleted currency object
        const updatedCurrencies = [...currencies];
        updatedCurrencies.splice(index, 1);
        // Update the currency list state
        setCurrencies(updatedCurrencies);
      }
    } catch (error) {
      console.error("Error deleting currency:", error);
      // Handle error
    }
  };
  const handleDefaultChange  = async (id,index,e) => {
    setEditedCurrency({
      ...currencies[index],
      "isDefault":true,
    })
    setCurrencies(prevCurrencies =>
      prevCurrencies.map(currency =>
        currency.id === id ? { ...currency, isDefault: true } : { ...currency, isDefault: false }
      )
      
    ); 
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/api/currencies/add`,
      {
      ...currencies[index],
      "isDefault":true,
    },
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken,
        },
      }
    );

    toast.success("Currency added successfully", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  return (
    <div className="bg-white p-4">
      <h3 className="text-primary">Added Currencies</h3>
      <table className="table">
        <thead>
          <tr>
          <th>
              <b>Default</b>
            </th>
            <th>
              <b>Currency Code</b>
            </th>
            <th>
              <b>Currency Name</b>
            </th>
            <th>
              <b>Currency Territory</b>
            </th>
            <th>
              <b>Currency Icon</b>
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
          {currencies.map((currency, index) => (
            <tr key={index}>
             <td>
                <input
                  type="radio"
                  name="defaultCurrency"
                  checked={currency.isDefault}
                  onChange={() => handleDefaultChange(currency.id,index)}
                />
              </td>
              <td>{currency.code}</td>
              <td>{currency.name}</td>
              <td>{currency.territory}</td>
              <td>{currency.icon}</td>
              <td>{currency.status}</td>
              <td>
                &nbsp;<button
                  className="btn btn-primary me-2"
                  onClick={() => handleEdit(index)}
                >
                  <FaEdit />
                </button>
                &nbsp;<button
                  className="btn btn-danger"
                  onClick={() => handleDelete(currency.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && <div className="modal-backdrop-blur"></div>}
      <div className="modal" style={{ display: showModal ? "block" : "none", zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Currency </h5>
              &nbsp;<button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Currency Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedCurrency.code}
                    onChange={(e) =>
                      setEditedCurrency({
                        ...editedCurrency,
                        code: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Currency Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedCurrency.name}
                    onChange={(e) =>
                      setEditedCurrency({
                        ...editedCurrency,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Currency Territory</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedCurrency.territory}
                    onChange={(e) =>
                      setEditedCurrency({
                        ...editedCurrency,
                        territory: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Currency Icon</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editedCurrency.icon}
                    onChange={(e) =>
                      setEditedCurrency({
                        ...editedCurrency,
                        icon: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editedCurrency.status}
                    onChange={(e) =>
                      setEditedCurrency({
                        ...editedCurrency,
                        status: e.target.value,
                      })
                    }
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
      <div >
        <div className="card-header custom-bg-text text-center">
          <h2 className=" text-primary " >Currency Detail</h2>
        </div>
        <div
          className="card-body d-flex flex-column"
          style={{
            overflowY: "auto",
          }}
        >
          <h3>Add Currency</h3>
          <AddCurrency onAddCurrency={handleAddCurrency} />
          <CurrencyList currencies={currencies} setCurrencies={setCurrencies} />
        </div>
      </div>
    </div>
  );
};

export default CurrencyApp;
