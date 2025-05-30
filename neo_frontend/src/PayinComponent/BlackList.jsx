import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import axiosInstance from '../utils/axiosConfig';
import { FaEdit, FaPlus, FaSearch } from 'react-icons/fa';

const BlackList = () => {
    const [blackLists, setBlackLists] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [connectors, setConnectors] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        clientId: '',
        blacklistType: '',
        condition: '',
        blacklistValue: '',
        remarks: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = blackLists.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(blackLists.length / itemsPerPage);

    // Add search state
    const [searchCriteria, setSearchCriteria] = useState({
        clientId: '',
        blacklistType: '',
        condition: '',
        blacklistValue: '',
        status: '',
        id: '' // Adding id to search criteria
    });

    useEffect(() => {
        fetchBlackLists();
        fetchCustomers();
        fetchConnectors();
        /*
        const interval = setInterval(() => {
            fetchBlackLists();
        }, 30000); // Fetch every 30 seconds
        return () => clearInterval(interval); // Cleanup on unmount
        */
    }, []);

    const fetchCustomers = async () => {
        try {
        const response = await axiosInstance.get('/api/user/fetch/customer/active/request');
        console.log('Customer API response:', response.data);
        if (response.data && response.data.users) {
            // Access the users array from the response
            setCustomers(response.data.users);
        } else {
            console.error('No users data in response:', response.data);
            setCustomers([]);
        }
        } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error('Failed to load customers');
        setCustomers([]);
        }
    };

    const fetchConnectors = async () => {
        try {
        const response = await axiosInstance.get('/api/connectors/fetch/dropdown/list');
        console.log('Connector API response:', response.data);
        if (response.data && response.data.connectors) {
            setConnectors(response.data.connectors);
        } else {
            console.error('Invalid connectors data format:', response.data);
            setConnectors([]);
        }
        } catch (error) {
        console.error("Error fetching connectors:", error);
        toast.error('Failed to load connectors');
        setConnectors([]);
        }
    };



    const conditionLabels = {
        IN: "Block [Is In]",
        NOT_IN: "Allow [Is Not In]",
        EQUALS: "Equals To [=]",
        EQUAL_TO: "Equals To",
        NOT_EQUAL_TO: "Not Equal To",
        LESS_THAN: "Less Than [<]",
        GREATER_THAN: "Greater Than [>]",
        LESS_THAN_OR_EQUAL_TO: "Less Than or Equal To [≤]",
        GREATER_THAN_OR_EQUAL_TO: "Greater Than or Equal To [≥]",
        CONTAINS: "Contains",
        NOT_CONTAINS: "Does Not Contain",
        STARTS_WITH: "Starts With",
        NOT_STARTS_WITH: "Does Not Start With",
        ENDS_WITH: "Ends With",
        NOT_ENDS_WITH: "Does Not End With",
        BETWEEN: "Between",
        NOT_BETWEEN: "Not Between",
        EXISTS: "Exists",
        NOT_EXISTS: "Does Not Exist",
        IS_NULL: "Is Null",
        IS_NOT_NULL: "Is Not Null",
        IS_EMPTY: "Is Empty",
        IS_NOT_EMPTY: "Is Not Empty",
        EXISTS_IN: "Exists In List",
        EXISTS_IN_LIST: "Exists In List",
        EXISTS_IN_ARRAY: "Exists In List",
        NOT_EXISTS_IN: "Does Not Exist In List",
        NOT_EXISTS_IN_LIST: "Does Not Exist In List",
        NOT_EXISTS_IN_ARRAY: "Does Not Exist In List"
    };

    const numericConditions = [
        "LESS_THAN_OR_EQUAL_TO",
        "GREATER_THAN_OR_EQUAL_TO",
        "LESS_THAN",
        "GREATER_THAN"
    ];

    const defaultConditions = [
        "IN",
        //"NOT_IN",
        "EQUAL_TO",
        "NOT_EQUAL_TO",
        "CONTAINS",
        //"NOT_CONTAINS",
        "STARTS_WITH",
        //"NOT_STARTS_WITH",
        "ENDS_WITH",
        //"NOT_ENDS_WITH",
        "BETWEEN",
        //"NOT_BETWEEN",
        "EXISTS",
        //"NOT_EXISTS",
        "IS_NULL",
        //"IS_NOT_NULL",
        "IS_EMPTY",
        //"IS_NOT_EMPTY",
        "EXISTS_IN"
    ];


    // Move isNumericType to component level and make it a function
    const isNumericType = (type) => ['bill_amt', 'trans_amt'].includes(type);

    // Add condition validation function
    const validateCondition = (type, condition) => {
        if (type === 'bill_amt') {
            return numericConditions.includes(condition);
        }
        return defaultConditions.includes(condition);
    };

    // Modify fetchBlackLists to include search
    const fetchBlackLists = async () => {
        try {
            const token = sessionStorage.getItem("admin-jwtToken");
            if (!token) {
                toast.error("Session expired. Please login again.");
                return;
            }
            
            let response;
            if (searchCriteria.clientId) {
                // Use the new endpoint for comma-separated client IDs
                response = await axiosInstance.get(`/api/blacklist/client/${searchCriteria.clientId}`);
            } else {
                response = await axiosInstance.get('/api/blacklist');
            }
            
            let filteredData = response.data;

            // Add ID filter
            if (searchCriteria.id) {
                filteredData = filteredData.filter(item =>
                    item.id.toString().includes(searchCriteria.id)
                );
            }

            // Apply remaining filters
            if (searchCriteria.condition) {
                filteredData = filteredData.filter(item =>
                    item.condition === searchCriteria.condition
                );
            }
            if (searchCriteria.blacklistType) {
                filteredData = filteredData.filter(item =>
                    item.blacklistType === searchCriteria.blacklistType
                );
            }
            if (searchCriteria.blacklistValue) {
                filteredData = filteredData.filter(item =>
                    item.blacklistValue.toLowerCase().includes(searchCriteria.blacklistValue.toLowerCase())
                );
            }
            if (searchCriteria.status) {
                filteredData = filteredData.filter(item =>
                    item.status.toString() === searchCriteria.status
                );
            }

            // Sort by ID in descending order after applying filters
            filteredData.sort((a, b) => b.id - a.id);

            setBlackLists(filteredData);
        } catch (error) {
            console.error('Error fetching black list:', error);
            toast.error('Error loading blacklist data');
        }
    };

    // Handle search input changes
    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchCriteria(prev => {
            const newCriteria = {
                ...prev,
                [name]: value
            };
            // Reset condition if blacklist type changes
            if (name === 'blacklistType') {
                newCriteria.condition = '';
            }
            // Handle direct input of comma-separated client IDs
            if (name === 'clientId' && value.includes(',')) {
                // Validate each ID in the comma-separated list
                const ids = value.split(',').map(id => id.trim());
                const validIds = ids.every(id => /^-?\d+$/.test(id));
                if (!validIds) {
                    toast.error('Please enter valid comma-separated numeric IDs');
                    return prev;
                }
            }
            return newCriteria;
        });
    };

    // Update useEffect to respond to search criteria changes
    useEffect(() => {
        fetchBlackLists();
    }, [searchCriteria]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'blacklistValue') {
            // Special validation for blacklistValue based on condition type
            if (formData.blacklistType === 'bill_amt') {
                if (formData.condition === 'BETWEEN' || formData.condition === 'NOT_BETWEEN') {
                    // Allow hyphen for between ranges
                    if (value && !/^\d*\.?\d*-?\d*\.?\d*$/.test(value)) {
                        toast.error('Please enter valid number range format (e.g., 100-200)');
                        return;
                    }
                    // Validate min-max if hyphen is present
                    if (value.includes('-')) {
                        const [min, max] = value.split('-');
                        if (parseFloat(min) >= parseFloat(max)) {
                            toast.error('Minimum value must be less than maximum value');
                            return;
                        }
                    }
                } else {
                    // For other numeric conditions
                    if (value.includes(',')) {
                        toast.error('Comma separated values are not allowed for Bill Amount');
                        return;
                    }
                    if (value && !/^\d*\.?\d*$/.test(value)) {
                        toast.error('Please enter a valid number');
                        return;
                    }
                }
            } else {
                // For list-based conditions, validate comma-separated values
                if (['EXISTS_IN', 'NOT_EXISTS_IN', 'EXISTS_IN_LIST', 'NOT_EXISTS_IN_LIST', 
                     'EXISTS_IN_ARRAY', 'NOT_EXISTS_IN_ARRAY'].includes(formData.condition)) {
                    // Allow comma-separated values
                    if (value && !/^[^,]+(,[^,]+)*$/.test(value)) {
                        toast.error('Please enter valid comma-separated values');
                        return;
                    }
                }
            }
        }
        
        // If changing blacklist type, reset condition and value
        if (name === 'blacklistType') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                condition: '', // Reset condition
                blacklistValue: '' // Reset value
            }));
        } else if (name === 'condition') {
            // Reset value when changing condition type
            setFormData(prev => ({
                ...prev,
                [name]: value,
                blacklistValue: '' // Reset value when condition changes
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Add clear search function
    const clearSearch = () => {
        setSearchCriteria({
            clientId: '',
            blacklistType: '',
            condition: '',
            blacklistValue: '',
            status: '',
            id: '' // Adding id to clear search
        });
        // Reset to first page when clearing search
        setCurrentPage(1);
    };

    const handleOpenModal = (blacklist = null) => {
        if (blacklist) {
            setFormData(blacklist);
            setIsEditing(true);
        } else {
            setFormData({
                id: '',
                clientId: '',
                blacklistType: '',
                condition: '',
                blacklistValue: '',
                remarks: ''
            });
            setIsEditing(false);
        }
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setModalIsOpen(false);
        setFormData({
            id: '',
            clientId: '',
            blacklistType: '',
            condition: '',
            blacklistValue: '',
            remarks: ''
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate condition based on type
            if (!validateCondition(formData.blacklistType, formData.condition)) {
                toast.error('Invalid condition selected for the blacklist type');
                return;
            }

            // Special validation for BETWEEN and NOT_BETWEEN conditions
            if (formData.condition === 'BETWEEN' || formData.condition === 'NOT_BETWEEN') {
                if (!formData.blacklistValue.includes('-')) {
                    toast.error('Please enter a valid range with format: min-max (e.g., 100-200)');
                    return;
                }
                const [min, max] = formData.blacklistValue.split('-').map(Number);
                if (isNaN(min) || isNaN(max) || min >= max) {
                    toast.error('Please enter a valid numeric range where minimum is less than maximum');
                    return;
                }
            }

            // Validate list-based conditions
            if (['EXISTS_IN', 'NOT_EXISTS_IN', 'EXISTS_IN_LIST', 'NOT_EXISTS_IN_LIST', 
                 'EXISTS_IN_ARRAY', 'NOT_EXISTS_IN_ARRAY'].includes(formData.condition)) {
                if (!formData.blacklistValue.includes(',')) {
                    toast.error('Please enter comma-separated values for list-based conditions');
                    return;
                }
                const values = formData.blacklistValue.split(',').map(v => v.trim());
                if (values.some(v => v === '')) {
                    toast.error('Invalid list format. Please ensure no empty values between commas');
                    return;
                }
            }

            // Additional validation for bill_amt type
            if (formData.blacklistType === 'bill_amt') {
                if (!['BETWEEN', 'NOT_BETWEEN'].includes(formData.condition)) {
                    // For non-range numeric conditions
                    if (!/^\d*\.?\d*$/.test(formData.blacklistValue)) {
                        toast.error('Please enter a valid number for Bill Amount');
                        return;
                    }
                }
                // Ensure a numeric condition is selected
                if (!numericConditions.includes(formData.condition)) {
                    toast.error('Please select a valid numeric condition for Bill Amount');
                    return;
                }
            }

            // Check for duplicates in existing records
            const hasDuplicate = blackLists.some(item => 
                !isEditing && // Only check for duplicates when adding new record
                item.clientId.toString() === formData.clientId.toString() &&
                item.blacklistType === formData.blacklistType &&
                item.condition === formData.condition &&
                item.status === 1
            );

            if (hasDuplicate) {
                toast.error('A blacklist entry with the same Client ID, Type and Condition already exists');
                return;
            }

            if (isEditing) {
                await axiosInstance.put(`/api/blacklist/${formData.id}`, formData);
                toast.success('Blacklist entry updated successfully');
            } else {
                const response = await axiosInstance.post('/api/blacklist', formData);
                if (response.status === 200) {
                    toast.success('Blacklist entry added successfully');
                    handleCloseModal();
                }
            }
            fetchBlackLists();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data || 'Error processing your request');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this blacklist entry?')) {
            try {
                const response = await axiosInstance.delete(`/api/blacklist/${id}`);
                toast.success(response.data || 'Record deleted successfully');
                setBlackLists(prevList => prevList.filter(item => item.id !== id));
            } catch (error) {
                toast.error(error.response?.data || 'Error deleting record. Please try again.');
            }
        }
    };

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // semi-transparent background
    backdropFilter: 'blur(5px)',           // apply blur to background
    WebkitBackdropFilter: 'blur(5px)',     // for Safari support
    zIndex: 1000,                          // ensure it sits on top
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '8px',
    padding: '0',
    border: 'none',
    maxHeight: '90vh',
    overflowY: 'auto',
  }
};

    return (
        <div className="container mt-2">
            <div className="container-fluid card py-4">
                <div className="row">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Black List Template Client/Connector Wise</h4>
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <FaPlus /> Add New Black List
                        </button>
                    </div>

                    {/* Search Form */}
                    <div className="col-12 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-0">
                                        <FaSearch className="me-2" />
                                        Search Filters
                                    </h5>
                                    <div className="mb-2">
                                            <div className="form-radio form-switch form-check-inline">
                                                <input
                                                    className="form-check-input me-2"
                                                    type="radio"
                                                    name="searchType"
                                                    id="searchClient"
                                                    value="client"
                                                    checked={!searchCriteria.clientId?.toString().startsWith('-')}
                                                    onChange={() => setSearchCriteria(prev => ({...prev, clientId: ''}))}
                                                />
                                                <label className="form-check-label" htmlFor="searchClient">Client</label>
                                            </div>
                                            <div className="form-radio form-switch form-check-inline">
                                                <input
                                                    className="form-check-input me-2"
                                                    type="radio"
                                                    name="searchType"
                                                    id="searchConnector"
                                                    value="connector"
                                                    checked={searchCriteria.clientId?.toString().startsWith('-')}
                                                    onChange={() => setSearchCriteria(prev => ({...prev, clientId: '-1'}))}
                                                />
                                                <label className="form-check-label" htmlFor="searchConnector">Connector</label>
                                            </div>
                                            <div className="col-md-2 d-inline-flex ">
                                                <input
                                                    type="text"
                                                    className="form-control m-0 py-0"
                                                    placeholder="ID"
                                                    name="id"
                                                    value={searchCriteria.id}
                                                    onChange={handleSearchInputChange}
                                                />
                                            </div>
                                        </div>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={clearSearch}
                                        title="Clear all filters"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                                <div className="row g-3">
                                    
                                    <div className="col-md-3">
                                        
                                        <select
                                            className="form-select"
                                            name="clientId"
                                            value={searchCriteria.clientId}
                                            onChange={handleSearchInputChange}
                                        >
                                            <option value="">Select {!searchCriteria.clientId?.toString().startsWith('-') ? 'Client' : 'Connector'}</option>
                                            {!searchCriteria.clientId?.toString().startsWith('-') ? (
                                                <>
                                                    {Array.isArray(customers) && customers.length > 0 ? (
                                                        customers.map(customer => (
                                                            <option key={customer.id} value={customer.id}>
                                                                [{customer.id}] {customer.userName}{customer.name ? ` | ${customer.name}` : ''}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>Loading customers...</option>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <option value="-10">[-10] Global | via Admin</option>
                                                    {Array.isArray(connectors) && connectors.map(connector => (
                                                        <option key={connector.connectorNumber} value={`-${connector.connectorNumber}`}>
                                                            -[{connector.connectorNumber}] {connector.connectorName || 'N/A'}
                                                        </option>
                                                    ))}
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <select
                                            className="form-select"
                                            name="blacklistType"
                                            value={searchCriteria.blacklistType}
                                            onChange={handleSearchInputChange}
                                        >
                                            <option value="">Blacklist Type</option>
                                            <option value="bill_ip">[bill_ip] IP</option>
                                            <option value="bill_country">[bill_country] Country</option>
                                            <option value="bill_city">[bill_city] City</option>
                                            <option value="bill_email">[bill_email] Email</option>
                                            <option value="ccno">[ccno] Card No.</option>
                                            <option value="upi_address">[upi_address] UPI Address</option>
                                            <option value="bill_phone">[bill_phone] Phone</option>
                                            <option value="bill_amt">[bill_amt] Bill Amt</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <select
                                            className="form-select"
                                            name="condition"
                                            value={searchCriteria.condition}
                                            onChange={handleSearchInputChange}
                                        >
                                            <option value="">Condition</option>
                                            {(isNumericType(searchCriteria.blacklistType) ? numericConditions : defaultConditions).map((value) => (
                                                <option key={value} value={value}>
                                                    {conditionLabels[value] || value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Blacklist Value"
                                            name="blacklistValue"
                                            value={searchCriteria.blacklistValue}
                                            onChange={handleSearchInputChange}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <select
                                            className="form-select"
                                            name="status"
                                            value={searchCriteria.status}
                                            onChange={handleSearchInputChange}
                                        >
                                            <option value="">All Status</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="col-md-1">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary ms-2 py-2 mb-2"
                                            onClick={clearSearch}
                                        >X</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-2 align-items-center">
                        <div className="col-md-6">
                            <small className="text-muted">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, blackLists.length)} of {blackLists.length} entries
                            </small>
                        </div>
                        <div className="col-md-6 text-end">
                            <div className="d-inline-flex align-items-center">
                                <label className="me-2">Items per page:</label>
                                <select
                                    className="form-select form-select-sm text-end py-0"
                                    style={{ width: 'auto', position: 'relative', top: '6px' }}
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-bordered border-color bg-color custom-bg-text">
                                <tr>
                                    <th>ID</th>
                                    <th>Client/Connector</th>
                                    <th>Black List Type</th>
                                    <th>Condition</th>
                                    <th>Black List Value</th>
                                    <th>Print Message</th>
                                    <th>Status</th>
                                    <th style={{minWidth:"131px"}} >Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((blacklist) => (
                                    <tr key={blacklist.id}>
                                        <td>{blacklist.id}</td>
                                        <td>{blacklist.clientId}</td>
                                        <td>{blacklist.blacklistType}</td>
                                        <td>{blacklist.condition}</td>
                                        <td>{blacklist.blacklistValue}</td>
                                        <td>{blacklist.remarks}</td>
                                        <td title={`Created dated - ${blacklist.formattedTimestamp}`}>
                                            <span className={`badge ${blacklist.status === 1 ? 'bg-success' : blacklist.status === 0 ? 'bg-danger' : 'bg-info'}`}>
                                                {blacklist.status === 1 ? 'Active' : blacklist.status === 0 ? 'Inactive' : 'Common'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => handleOpenModal(blacklist)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(blacklist.id)}
                                            >
                                                Inactive
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination controls */}
                        <div className="pagination justify-content-end">
                            <button 
                                onClick={() => setCurrentPage(1)} 
                                disabled={currentPage === 1} 
                                className="btn btn-secondary mx-1"
                            >
                                &laquo;&laquo;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                disabled={currentPage === 1} 
                                className="btn btn-secondary mx-1"
                            >
                                &laquo;
                            </button>
                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(num => 
                                    num === 1 || 
                                    num === totalPages || 
                                    (num >= currentPage - 1 && num <= currentPage + 1)
                                )
                                .map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`btn ${currentPage === num ? 'btn-primary' : 'btn-secondary'} mx-1`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                                disabled={currentPage === totalPages} 
                                className="btn btn-secondary mx-1"
                            >
                                &raquo;
                            </button>
                            <button 
                                onClick={() => setCurrentPage(totalPages)} 
                                disabled={currentPage === totalPages} 
                                className="btn btn-secondary mx-1"
                            >
                                &raquo;&raquo;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={handleCloseModal}
               style={modalStyles}
                contentLabel="Blacklist Form"
                
            >
                <div className="modal-header p-4">
                    <h5 className="modal-title text-primary"><u>{isEditing ? 'Edit Black List' : 'Add New Black List'}</u></h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={handleCloseModal}
                    ></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <div className="mb-2">
                                <div className="form-radio form-switch form-check-inline">
                                    <input 
                                        className="form-check-input me-2"
                                        type="radio"
                                        name="formType"
                                        id="formClient"
                                        checked={!formData.clientId?.toString().startsWith('-')}
                                        onChange={() => {
                                            setFormData(prev => ({...prev, clientId: ''}));
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="formClient">Client</label>
                                </div>
                                <div className="form-radio form-switch form-check-inline">
                                    <input
                                        className="form-check-input me-2"
                                        type="radio"
                                        name="formType"
                                        id="formConnector"
                                        checked={formData.clientId?.toString().startsWith('-')}
                                        onChange={() => {
                                            setFormData(prev => ({...prev, clientId: '-1'}))}
                                        }
                                    />
                                    <label className="form-check-label" htmlFor="formConnector">Connector</label>
                                </div>
                            </div>
                            <select
                                className="form-select"
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select {!formData.clientId?.toString().startsWith('-') ? 'Client' : 'Connector'}</option>
                                {!formData.clientId?.toString().startsWith('-') ? (
                                    <>
                                        {Array.isArray(customers) && customers.length > 0 ? (
                                            customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    [{customer.id}] {customer.userName}{customer.name ? ` | ${customer.name}` : ''}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Loading customers...</option>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <option value="-10">[-10] Global | via Admin</option>
                                        {Array.isArray(connectors) && connectors.map(connector => (
                                            <option key={connector.connectorNumber} value={`-${connector.connectorNumber}`}>
                                                -[{connector.connectorNumber}] {connector.connectorName || 'N/A'}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Black List Type</label>
                            
                            <select
                                className="form-select"
                                name="blacklistType"
                                value={formData.blacklistType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Blacklist Type</option>
                                <option value="bill_ip">[bill_ip] IP</option>
                                <option value="bill_country">[bill_country] Country</option>
                                <option value="bill_city">[bill_city] City</option>
                                <option value="bill_email">[bill_email] Email</option>
                                <option value="ccno">[ccno] Card No.</option>
                                <option value="upi_address">[upi_address] UPI Address</option>
                                <option value="bill_phone">[bill_phone] Phone</option>
                                <option value="bill_amt">[bill_amt] Bill Amt</option>
                            </select>
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">Condition for Black List*</label>
                            <select
                                className="form-select"
                                name="condition"
                                value={formData.condition}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Condition {formData.blacklistType === 'bill_amt' ? 'Block Only' : ''}</option>

                                {(isNumericType(formData.blacklistType) ? numericConditions : defaultConditions).map((value) => (
                                    <option key={value} value={value}>
                                        {conditionLabels[value] || value}
                                    </option>
                                ))}

                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label mb-0">Black List <span  className="fw-bolder text-success"> {formData.blacklistType !=='' ? '['+formData.blacklistType+'] ' : ''}</span>Value </label>
                            <div className="fs-6 text-secondary">
                                {formData.blacklistType === 'bill_amt' ? ' (numeric value only)' : 'if more values then comma separated'}
                                {formData.blacklistType === 'bill_country' ? ' Ex. AO,BY,SO' : ''}
                                {formData.condition === 'BETWEEN' || formData.condition === 'NOT_BETWEEN' ? 
                                    ' Format: min-max (e.g., 100-200)' : ''}
                                {['EXISTS_IN', 'NOT_EXISTS_IN', 'EXISTS_IN_LIST', 'NOT_EXISTS_IN_LIST', 
                                  'EXISTS_IN_ARRAY', 'NOT_EXISTS_IN_ARRAY'].includes(formData.condition) ? 
                                    ' Format: value1,value2,value3' : ''}
                                {formData.condition === 'IN' || formData.condition === 'NOT_IN' ? 
                                    ' Exact match required' : ''}
                            </div>
                            <input
                                type={formData.blacklistType === 'bill_amt' && 
                                     !['BETWEEN', 'NOT_BETWEEN'].includes(formData.condition) ? 'number' : 'text'}
                                step={formData.blacklistType === 'bill_amt' && 
                                     !['BETWEEN', 'NOT_BETWEEN'].includes(formData.condition) ? '0.01' : undefined}
                                name="blacklistValue"
                                className="form-control"
                                placeholder={formData.condition === 'BETWEEN' || formData.condition === 'NOT_BETWEEN' ? 
                                    'e.g., 100-200' : 
                                    ['EXISTS_IN', 'NOT_EXISTS_IN', 'EXISTS_IN_LIST', 'NOT_EXISTS_IN_LIST', 
                                     'EXISTS_IN_ARRAY', 'NOT_EXISTS_IN_ARRAY'].includes(formData.condition) ?
                                    'e.g., value1,value2,value3' : ''}
                                value={formData.blacklistValue}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Print Message</label>
                            <textarea
                                name="remarks"
                                className="form-control"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary me-2" 
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                {isEditing ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default BlackList;