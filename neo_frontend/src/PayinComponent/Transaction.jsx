import React, { useState, useEffect, useRef } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaEye, FaCopy } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { PrintDateNote } from '../components/PrintDateNote.jsx';
import '../new-dash.css';

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

const CopyButton = ({ text, onCopy }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopy?.();
      toast.success('Copied to clipboard!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true
      });
    } catch (err) {
      toast.error('Failed to copy', {
        position: "top-right",
        autoClose: 1000
      });
    }
  };

  return (
    <button
      className="btn btn-link btn-sm p-0 ms-2"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      <FaCopy className="text-muted" />
    </button>
  );
};

const AddTransaction = ({ onAddTransaction }) => {
  const [formData, setFormData] = useState({
    // Step 1: Renamed fields
    connectorNumber: "", // was code
    connectorName: "", // was name
    channelType: "", // was type
    connectorStatus: "", // was status
    connectorBaseUrl: "", // was connectorEndpoint
    connectorLoginCreds: "", // was connectorUsername
    connectorProcessingCurrency: "", // was connectorPassword
    connectionMethod: "", // was connectorMethod
    connectorProdUrl: "", // was connectorUrl
    connectorUatUrl: "", // was connectorDescription
    connectorStatusUrl: "", // was connectorDeveloper
    connectorDevApiUrl: "", // was connectorDeveloperUrl
    connectorWlDomain: "", // was connectorMethodBinding
    connectorProcessingCredsJson: "", // was connectorProcessingCredsJson
    processingCurrencyMarkup: "", // was connectorProcessingEncoding
    techCommentsText: "", // was responseProcessingCode
    connectorRefundPolicy: "", // was settlementPeriod
    connectorRefundUrl: "", // was serviceAccount
    defaultTransaction: "", // was bankCode

    // Step 3: Added missing fields
    mccCode: "",
    connectorProdMode: "",
    connectorDescriptor: "",
    transAutoExpired: "",
    transAutoRefund: "",
    connectorWlIp: "",
    mopWeb: "",
    mopMobile: "",
    hardCodePaymentUrl: "",
    hardCodeStatusUrl: "",
    hardCodeRefundUrl: "",
    skipCheckoutValidation: "",
    redirectPopupMsgWeb: "",
    redirectPopupMsgMobile: "",
    checkoutLabelNameWeb: "",
    checkoutLabelNameMobile: "",
    checkoutSubLabelNameWeb: "",
    checkoutSubLabelNameMobile: "",
    ecommerceCruisesJson: "",
    merSettingJson: "",
    connectorLabelJson: "",
    processingCountriesJson: "",
    blockCountriesJson: "",
    notificationEmail: "",
    notificationCount: "",
    autoStatusFetch: "",
    autoStatusStartTime: "",
    autoStatusIntervalTime: "",
    cronBankStatusResponse: ""
  });

  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };

  const handleSubmitAndClose = async (e) => {
    e.preventDefault();

    const currentToken = getAuthToken();
    if (!currentToken) {
      toast.error("Session expired. Please login again.", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'session-error'
      });
      return;
    }

    if (!formData.connectorNumber || !formData.connectorName || !formData.channelType || !formData.connectorStatus) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'validation-error'
      });
      return;
    }

    let dataToSubmit = { ...formData };

    // Handle processing code - keep it as string
    if (dataToSubmit.connectorProcessingCredsJson) {
      try {
        // Validate if it's valid JSON
        JSON.parse(dataToSubmit.connectorProcessingCredsJson);
        // Keep it as string, don't parse it
      } catch (error) {
        toast.error("Please enter valid JSON in Transaction Processing Credentials", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'processing-creds-error'
        });
        return;
      }
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/add`,
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        toast.success("Transaction added successfully", {
          position: "top-center",
          autoClose: 2000,
          toastId: 'add-success'
        });

        onAddTransaction(dataToSubmit);

        // Reset form
        setFormData({
          connectorNumber: "",
          connectorName: "",
          channelType: "",
          connectorStatus: "",
          connectorBaseUrl: "",
          connectorLoginCreds: "",
          connectorProcessingCurrency: "",
          connectionMethod: "",
          connectorProdUrl: "",
          connectorUatUrl: "",
          connectorStatusUrl: "",
          connectorDevApiUrl: "",
          connectorWlDomain: "",
          connectorProcessingCredsJson: "",
          processingCurrencyMarkup: "",
          techCommentsText: "",
          connectorRefundPolicy: "",
          connectorRefundUrl: "",
          defaultTransaction: "",
          mccCode: "",
          connectorProdMode: "",
          connectorDescriptor: "",
          transAutoExpired: "",
          transAutoRefund: "",
          connectorWlIp: "",
          mopWeb: "",
          mopMobile: "",
          hardCodePaymentUrl: "",
          hardCodeStatusUrl: "",
          hardCodeRefundUrl: "",
          skipCheckoutValidation: "",
          redirectPopupMsgWeb: "",
          redirectPopupMsgMobile: "",
          checkoutLabelNameWeb: "",
          checkoutLabelNameMobile: "",
          checkoutSubLabelNameWeb: "",
          checkoutSubLabelNameMobile: "",
          ecommerceCruisesJson: "",
          merSettingJson: "",
          connectorLabelJson: "",
          processingCountriesJson: "",
          blockCountriesJson: "",
          notificationEmail: "",
          notificationCount: "",
          autoStatusFetch: "",
          autoStatusStartTime: "",
          autoStatusIntervalTime: "",
          cronBankStatusResponse: ""
        });
        setShowForm(false);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Session expired. Please refresh the page and try again.", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'session-error'
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to add connector", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'add-error'
        });
      }
    }
  };

  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

};


const TransactionList = ({
  transactions = [], // Add default empty array
  setTransactions,
  onRefresh,
  externalSortConfig = { key: 'transactionDate', direction: 'desc' },
  onSort = () => { }
}) => {
  const adminid = JSON.parse(sessionStorage.getItem("active-admin"));
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editedTransaction, setEditedTransaction] = useState({
    transaction: {},
    additional: {}
  });
  const [originalCode, setOriginalCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [goToPage, setGoToPage] = useState('');
  const [lastKeyPressed, setLastKeyPressed] = useState(null);
  const keyIndicatorTimeout = useRef(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [updatedCode, setUpdatedCode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    // Update these fields to match your Transaction entity
    transID: "",
    reference: "",
    merchantID: "",
    transactionStatus: "",
    // Add other fields as needed
  });

  // Add new state for S2S status modal
  const [showS2SModal, setShowS2SModal] = useState(false);
  const [s2sStatusData, setS2SStatusData] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTransaction, setViewTransaction] = useState(null);

  const handleViewTransaction = (transaction) => {
    setViewTransaction(transaction);
    setShowViewModal(true);
  };


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown open state
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false); // Close dropdown
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (isDropdownOpen) {
      closeDropdown();
    }
  };

  // Attach event listener to close dropdown when clicking outside
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);


  // Add this helper function to your component
  const formatCardNumber = (cardNumber, binNumber) => {
    if (!cardNumber) return 'N/A';

    // Use the first 6 digits (BIN) and last 4 digits
    const bin = binNumber || (cardNumber.length >= 6 ? cardNumber.slice(0, 6) : '');
    const last4 = cardNumber.length >= 4 ? cardNumber.slice(-4) : cardNumber;

    if (bin && last4) {
      return `${bin}•••••${last4}`;
    }

    return cardNumber;
  };


  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewTransaction(null);
  };


  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };


  // Extract the status mapping to a reusable function
  const getStatusInfo = (statusCode) => {
    let statusText = "Unknown";
    let statusClass = "bg-secondary";

    // Handle numeric status codes
    if (typeof statusCode === 'number' || !isNaN(parseInt(statusCode))) {
      const numericCode = typeof statusCode === 'number' ? statusCode : parseInt(statusCode);

      switch (numericCode) {
        case 0: return { text: "Pending", class: "bg-warning" };
        case 1: return { text: "Approved", class: "bg-success" };
        case 2: return { text: "Declined", class: "bg-danger" };
        case 3: return { text: "Refunded", class: "bg-info" };
        case 5: return { text: "Chargeback", class: "bg-danger" };
        case 7: return { text: "Reversed", class: "bg-secondary" };
        case 8: return { text: "Refund Pending", class: "bg-warning" };
        case 9: return { text: "Test", class: "bg-secondary" };
        case 10: return { text: "Blocked", class: "bg-secondary" };
        case 11: return { text: "Predispute", class: "bg-warning" };
        case 12: return { text: "Partial Refund", class: "bg-info" };
        case 13: return { text: "Withdraw Requested", class: "bg-warning" };
        case 14: return { text: "Withdraw Rolling", class: "bg-warning" };
        case 20: return { text: "Frozen Balance", class: "bg-secondary" };
        case 21: return { text: "Frozen Rolling", class: "bg-secondary" };
        case 22: return { text: "Expired", class: "bg-secondary" };
        case 23: return { text: "Cancelled", class: "bg-danger" };
        case 24: return { text: "Failed", class: "bg-danger" };
        case 25: return { text: "Test Approved", class: "bg-success" };
        case 26: return { text: "Test Declined", class: "bg-danger" };
        case 27: return { text: "Test 3DS Authentication", class: "bg-secondary" };
      }
    }
    // Handle string status codes
    else if (typeof statusCode === 'string') {
      statusText = statusCode;
      // Set color based on common status terms
      if (statusText.toUpperCase().includes('SUCCESS') ||
        statusText.toUpperCase().includes('APPROVED')) {
        statusClass = "bg-success";
      } else if (statusText.toUpperCase().includes('FAIL') ||
        statusText.toUpperCase().includes('DECLINE')) {
        statusClass = "bg-danger";
      } else if (statusText.toUpperCase().includes('PENDING')) {
        statusClass = "bg-warning";
      }
    }

    return { text: statusText, class: statusClass };
  };

  const renderSortIndicator = (key) => {
    console.log(`Rendering sort indicator for ${key}, current sort: ${externalSortConfig.key}, direction: ${externalSortConfig.direction}`);
    if (externalSortConfig.key === key) {
      return externalSortConfig.direction === 'asc'
        ? <FaSortUp className="ms-1" />
        : <FaSortDown className="ms-1" />;
    }
    return <FaSort className="ms-1 text-muted" />;
  };



  // Update your filtering logic
  const filteredTransactions = (transactions || []).filter(transaction => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    const transactionData = transaction.transaction;

    // Check for additionalData is defined
    const additionalData = transaction?.additional || {};

    const matchesSearch =
      String(transaction.transID || '').toLowerCase().includes(searchLower) ||
      String(transactionData.transID || '').toLowerCase().includes(searchLower) ||
      String(transactionData.reference || '').toLowerCase().includes(searchLower) ||
      String(transactionData.merchantID || '').toLowerCase().includes(searchLower) ||
      String(transactionData.amount || '').toLowerCase().includes(searchLower) ||
      String(transactionData.currency || '').toLowerCase().includes(searchLower) ||
      String(transactionData.paymentMethod || '').toLowerCase().includes(searchLower) ||
      String(additionalData?.connectorRef || '').toLowerCase().includes(searchLower);

    // Merchant filter      
    const matchesMerchant = !filterType || String(transactionData.merchantID || '') === String(filterType);

    // Status filter - convert to string for comparison
    const matchesStatus = !filterStatus ||
      String(transactionData.transactionStatus) === String(filterStatus);

    return matchesSearch && matchesMerchant && matchesStatus;
  });

  // Sorting function
  // Sort data by key
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      // Access the nested transaction property
      const aValue = a.transaction[key];
      const bValue = b.transaction[key];

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Update your handleSort function to use the onSort prop
  const handleSort = (key) => {
    onSort(key);
  };



  // Add this helper function for date formatting
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (date instanceof Date && !isNaN(date)) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16);
      }
      return '';
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return '';
    }
  };


  // Get sorted and filtered data
  const getSortedData = () => {
    if (!externalSortConfig.key || !filteredTransactions) return filteredTransactions || [];

    console.log("Sorting data with config:", externalSortConfig);
    console.log("Sample transaction:", filteredTransactions[0]);

    return [...(filteredTransactions || [])].sort((a, b) => {
      // Get the correct property path based on your data structure
      let aValue, bValue;

      // Check if we're dealing with a nested property
      if (externalSortConfig.key.includes('.')) {
        aValue = externalSortConfig.key.split('.').reduce((obj, key) => obj && obj[key], a);
        bValue = externalSortConfig.key.split('.').reduce((obj, key) => obj && obj[key], b);
      } else {
        // Check if the property is directly on the transaction object or nested
        aValue = a[externalSortConfig.key] !== undefined ? a[externalSortConfig.key] :
          (a.transaction && a.transaction[externalSortConfig.key]);
        bValue = b[externalSortConfig.key] !== undefined ? b[externalSortConfig.key] :
          (b.transaction && b.transaction[externalSortConfig.key]);
      }

      console.log(`Comparing ${aValue} and ${bValue} for key ${externalSortConfig.key}`);

      // Special handling for dates
      if (externalSortConfig.key === 'transactionDate') {
        // Parse dates, ensuring we handle TIMESTAMP(6) format correctly
        const dateA = aValue ? new Date(aValue) : new Date(0);
        const dateB = bValue ? new Date(bValue) : new Date(0);

        console.log(`Comparing dates: ${dateA} and ${dateB}`);

        if (externalSortConfig.direction === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;  // Descending order (newest first)
        }
      }

      // Handle null/undefined values
      if (aValue === undefined || aValue === null) return externalSortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return externalSortConfig.direction === 'asc' ? 1 : -1;

      // Regular string/number comparison
      if (aValue < bValue) {
        return externalSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return externalSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };


  // Get sort indicator
  const getSortIndicator = (key) => {
    if (externalSortConfig.key === key) {
      return externalSortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };


  const handleViewS2SStatus = async (transID) => {
    try {
      setS2SStatusData(null); // Reset data before fetching
      setShowS2SModal(true); // Show modal immediately with loading state

      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.");
        setShowS2SModal(false);
        return;
      }

      const apiUrl = `${process.env.REACT_APP_BASE_URL}/api/status/s2s/admin/${transID}`;

      const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data && Object.keys(response.data).length > 0) {
        const processedData = {
          ...response.data,
          error: false,
          isEmpty: false
        };
        setS2SStatusData(processedData);
        console.log("S2S Status Data Set:", processedData); // Log to verify state update
      } else {
        setS2SStatusData({ isEmpty: true });
        console.log("S2S Status Data is empty");
      }
    } catch (error) {
      console.error("Error fetching S2S status:", error);

      if (error.response) {
        toast.error(`Failed to fetch S2S status: ${error.response.status} - ${error.response?.data?.message || error.message}`);
        setS2SStatusData({
          error: true,
          message: error.response?.data?.message || error.message,
          status: error.response.status
        });
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timed out. Server is taking too long to respond.");
        setS2SStatusData({
          error: true,
          message: "Request timed out. Server is taking too long to respond.",
          timeout: true
        });
      } else if (error.request) {
        toast.error("Failed to fetch S2S status: No response received from server. Please check your network connection.");
        setS2SStatusData({
          error: true,
          message: "No response received from server. Please check your network connection.",
          networkError: true
        });
      } else {
        toast.error(`Failed to fetch S2S status: ${error.message}`);
        setS2SStatusData({ error: true, message: error.message });
      }
    }
  };

  useEffect(() => {
    if (s2sStatusData) {
      console.log("S2S Status Data Updated:", s2sStatusData); // Log to verify rendering data
    }
  }, [s2sStatusData]);


  const handleEdit = (transaction, index) => {
    console.log("Opening edit modal for transaction:", transaction);

    if (!transaction || !transaction.transaction) {
      console.error("Invalid transaction structure:", transaction);
      toast.error("Invalid transaction data");
      return;
    }

    setShowModal(true);
    setOriginalCode(transaction.transaction.transID);

    // Make sure we have the correct structure
    setEditedTransaction({
      transaction: transaction.transaction || {},
      additional: transaction.additional || {}
    });

    setEditIndex(index);
  };

  const setEditedTransactionField = (field, subField, value) => {
    setEditedTransaction((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [subField]: value
      }
    }));
  };

  const handleUpdate = async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.");
        return;
      }


      const transID = editedTransaction.transID || editedTransaction.additional.transID || editedTransaction.transaction.transID || '';

      // Close modal first
      setShowModal(false);

      // Make the API call with the correct URL and structure
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/update/${transID}`,
        {
          transaction: editedTransaction.transaction,
          additional: editedTransaction.additional || {}
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (response.status === 200) {
        // Update local state
        setTransactions(prevTransactions => {
          const updatedTransactions = prevTransactions.map(t =>
            t.transaction && t.transaction.transID === transID ? editedTransaction : t
          );
          return updatedTransactions;
        });

        // Set the updated code to trigger highlight
        setUpdatedCode(transID);

        toast.success(`Successfully updated transaction with ID ${transID}`);

        // Reset state
        setEditedTransaction({ transaction: {}, additional: {} }); // Reset to initial structure
        setOriginalCode('');
        setEditIndex(-1);
      } else {
        toast.error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update transaction");

      // Reset state on error
      setEditedTransaction({ transaction: {}, additional: {} }); // Reset to initial structure
      setOriginalCode('');
      setEditIndex(-1);
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditedTransaction({
      transaction: {},
      additional: {}
    });
    setOriginalCode('');
    setEditIndex(-1);
  };


  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (transID) => {
    if (!transID) return;

    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/${transID}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted transaction from state
        setTransactions(prevTransactions =>
          prevTransactions.filter(t => t.transaction.transID !== transID)
        );

        toast.success("Transaction deleted successfully", {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Failed to delete transaction", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error.response?.data?.message || "Failed to delete transaction", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  const initiateDelete = (connector) => {
    setTransactionToDelete(connector);
    setShowDeleteModal(true);
  };

  // Utility functions for data formatting
  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    try {
      // If dateValue is an array (like [2025,3,17,14,28,36,847543000])
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour, minute, second] = dateValue;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      }

      // Handle other date formats
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return String(dateValue);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    } catch (error) {
      console.error("Error formatting date:", error);
      return String(dateValue);
    }
  };

  const maskSensitiveData = (data, type = 'default') => {
    if (!data) return '';

    // If it's a standard credit card number (mostly digits, length 13-19)
    if (type === 'card' && /^\d{13,19}$/.test(data.replace(/\s/g, ''))) {
      const firstVisible = 6;
      const lastVisible = 4;

      const firstPortion = data.slice(0, firstVisible);
      const lastPortion = data.slice(-lastVisible);
      const middleLength = data.length - firstVisible - lastVisible;
      const maskedMiddle = 'X'.repeat(Math.min(middleLength, 6));

      return `${firstPortion}${maskedMiddle}${lastPortion}`;
    }
    // For tokens, reference IDs, etc.
    else {
      if (data.length > 12) {
        return `${data.slice(0, 4)}...${data.slice(-4)}`;
      } else if (data.length > 6) {
        return `${data.slice(0, 2)}...${data.slice(-2)}`;
      } else {
        return data;
      }
    }
  };

  // Common function to prepare transaction data for export
  const prepareTransactionData = (data) => {
    return data.map(item => {
      const transaction = item.transaction || {};
      const additional = item.additional || {};

      // Get the status value
      const status = transaction.transactionStatus ||
        transaction.status ||
        transaction.trans_status ||
        '';

      // Get the transaction date
      const transactionDate = transaction.tdate ||
        transaction.transactionDate ||
        transaction.date ||
        transaction.createdAt ||
        '';

      // Get decrypted card number if available
      let maskedCardNumber = '';
      if (additional.ccnoDecrypted) {
        maskedCardNumber = maskSensitiveData(additional.ccnoDecrypted, 'card');
      } else if (additional.cardNumber) {
        maskedCardNumber = maskSensitiveData(additional.cardNumber);
      }

      // Return standardized object
      return {
        'Transaction ID': transaction.transID || transaction.id || '',
        'Reference': transaction.reference || transaction.ref || '',
        'Transaction Date': formatDate(transactionDate),
        'Status': status,
        'Transaction Type': transaction.transactionType || transaction.type || '',
        'Transaction Amount': transaction.transactionAmount || transaction.amount || '',
        'Transaction Currency': transaction.transactionCurrency || transaction.currency || '',
        'Bill Amount': transaction.billAmount || '',
        'Bill Currency': transaction.billCurrency || '',
        'Merchant ID': transaction.merchantID || transaction.merchantId || '',
        'Payment Method': additional.paymentMethod || '',
        'Card Number': maskedCardNumber,
        'Card Type': additional.cardType || '',
        'Bank Name': additional.bankName || '',
        'Account Number': additional.accountNumber ? maskSensitiveData(additional.accountNumber) : '',
        'Created At': formatDate(transaction.createdAt)
      };
    });
  };

  // Export to CSV function
  const exportToCSV = async (data, filename) => {
    try {
      setIsExporting(true);
      const processedData = prepareTransactionData(data);

      // Convert to CSV
      const headers = Object.keys(processedData[0] || {});
      const csvRows = [];

      // Add headers
      csvRows.push(headers.join(','));

      // Add data rows
      processedData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      });

      // Create CSV content
      const csvContent = csvRows.join('\n');

      // Download file
      downloadFile(csvContent, `${filename || 'transactions'}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to JSON function
  const exportToJSON = async (data, filename) => {
    try {
      setIsExporting(true);
      const processedData = prepareTransactionData(data);

      // Create JSON content
      const jsonContent = JSON.stringify(processedData, null, 2);

      // Download file
      downloadFile(jsonContent, `${filename || 'transactions'}.json`, 'application/json');
    } catch (error) {
      console.error("Error exporting JSON:", error);
      toast.error("Failed to export JSON. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Common download function
  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Ensure Filter by Merchant is mandatory before exporting all data
  const exportAllData = async (format) => {
    if (!filterType) {
      toast.error("Please select a Merchant from the 'Filter by Merchant' dropdown before exporting.");
      return;
    }

    try {
      setIsExporting(true);

      // Get all transactions from the backend
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }

      const apiUrl = `${process.env.REACT_APP_BASE_URL}/api/transactions/all/${filterType}`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200 && response.data) {
        const allTransactions = response.data;
        const filename = `all_transactions_${filterType}_${new Date().toISOString().split('T')[0]}`;

        // Export based on format
        if (format === 'csv') {
          exportToCSV(allTransactions, filename);
        } else if (format === 'json') {
          exportToJSON(allTransactions, filename);
        }

        toast.success(`Successfully exported all transactions as ${format.toUpperCase()}`);
      } else {
        throw new Error("Failed to fetch all transactions");
      }
    } catch (error) {
      console.error(`Error exporting all data as ${format}:`, error);
      if (error.response && error.response.status === 403) {
        toast.error("Failed to export all transactions. Access is forbidden. Please check your permissions.");
      } else {
        toast.error(`Failed to export all transactions. ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsExporting(false);
    }
  };


  //json beautifier 
  const JsonPrettyPrint = ({ json }) => {
    if (!json) return "N/A";

    let parsedJson;
    try {
      parsedJson =
        typeof json === "string" ? JSON.parse(json) : json;
    } catch (e) {
      return <pre style={{ color: "red" }}>Invalid JSON</pre>;
    }

    return (
      <pre
        style={{
          background: "#282c34",
          color: "#abb2bf",
          padding: "10px",
          borderRadius: "5px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(parsedJson, null, 2)
            .replace(/"(.*?)":/g, '<span style="color: #e06c75">"$1"</span>:')
            .replace(/: "(.*?)"/g, ': <span style="color: #98c379">"$1"</span>')
            .replace(/: (\d+)/g, ': <span style="color: #d19a66">$1</span>'),
        }}
      />
    );
  };




  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(getSortedData().length / itemsPerPage);


  const paginate = React.useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Enhanced keyboard navigation with proper dependencies
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      setLastKeyPressed(e.key);
      if (keyIndicatorTimeout.current) {
        clearTimeout(keyIndicatorTimeout.current);
      }
      keyIndicatorTimeout.current = setTimeout(() => {
        setLastKeyPressed(null);
      }, 1000);

      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 1) paginate(currentPage - 1);
          break;
        case 'ArrowRight':
          if (currentPage < totalPages) paginate(currentPage + 1);
          break;
        case 'Home':
          paginate(1);
          break;
        case 'End':
          paginate(totalPages);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (keyIndicatorTimeout.current) {
        clearTimeout(keyIndicatorTimeout.current);
      }
    };
  }, [currentPage, totalPages, paginate]);

  // Keyboard shortcut indicator component
  const KeyboardIndicator = () => {
    if (!lastKeyPressed) return null;

    const keyMap = {
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Home': 'Home',
      'End': 'End'
    };

    return (
      <div
        className="position-fixed bottom-0 end-0 m-3 p-2 bg-dark text-light rounded"
        style={{
          animation: 'fadeIn 0.2s',
          zIndex: 1050
        }}
      >
        Key pressed: <kbd>{keyMap[lastKeyPressed] || lastKeyPressed}</kbd>
      </div>
    );
  };

  useEffect(() => {
    console.log("TransactionList received sortConfig:", externalSortConfig);

    if (updatedCode) {
      const timer = setTimeout(() => {
        setUpdatedCode(null);
      }, 2000); // Match with toast duration
      return () => clearTimeout(timer);
    }
  }, [externalSortConfig, updatedCode]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundComment, setRefundComment] = useState('');
  const [isRefundProcessing, setIsRefundProcessing] = useState(false);

  const handleRefundAccept = (transaction) => {
    setSelectedTransaction(transaction);
    // Format initial refund amount to 2 decimal places
    setRefundAmount(Number(transaction.transaction.bankProcessingAmount || 0).toFixed(2));
    setRefundComment('');
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    setIsRefundProcessing(true);

    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        return;
      }

      const refundAmt = parseFloat(refundAmount);
      const originalAmt = parseFloat(selectedTransaction.transaction.bankProcessingAmount);

      // Validate refund amount
      if (isNaN(refundAmt) || refundAmt <= 0 || refundAmt > originalAmt) {
        toast.error("Invalid refund amount. Must be greater than 0 and less than or equal to original amount", {
          position: "top-center",
          autoClose: 3000
        });
        return;
      }

      // Format amount to exactly 2 decimal places
      const formattedRefundAmount = refundAmt.toFixed(2);
      const refundEndUrl = `${selectedTransaction.transaction.transactionStatus === 8 ? 'accept' : 'request'}`;

      const refundData = {
        transID: selectedTransaction.transID,
        refundAmount: formattedRefundAmount,
        refundReason: refundComment,
        originalAmount: originalAmt,
        currency: selectedTransaction.transaction.bankProcessingCurrency,
        loginUser: adminid.id + " - " + adminid.userName
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/refund-${refundEndUrl}`,
        refundData,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || selectedTransaction?.transID + "::" + "Refund request submitted successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setShowRefundModal(false);
        onRefresh(); // Refresh the transaction list
      } else {
        toast.error(response.data.message || "Failed to submit refund request", {
          position: "top-center",
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } catch (error) {
      console.error("Refund request error:", error);
      toast.error(error.response?.data?.message || "Failed to submit refund request", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setIsRefundProcessing(false);
    }
  };

  return (
    <div className="container-fluid card py-4">
      <h4 className="mb-4">Transaction Management</h4>
      {/* Search, filters, and export buttons */}
      <div className="row mb-0">
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control p-2"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="btn btn-outline-danger py-0"
                  type="button"
                  style={{ maxHeight: '42px' }}
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >X</button>
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select p-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Filter by Merchant</option>
                {/* Get unique merchant IDs */}
                {[...new Set(transactions?.map(t => t.transaction.merchantID) || [])].filter(Boolean).map(merchant => (
                  <option key={merchant} value={merchant}>{merchant}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select p-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Filter by Status</option>
                <option value="0">Pending</option>
                <option value="1">Approved</option>
                <option value="2">Declined</option>
                <option value="3">Refunded</option>
                <option value="5">Chargeback</option>
                <option value="7">Reversed</option>
                <option value="8">Refund Pending</option>
                <option value="9">Test</option>
                <option value="10">Blocked</option>
                <option value="11">Predispute</option>
                <option value="12">Partial Refund</option>
                <option value="13">Withdraw Requested</option>
                <option value="14">Withdraw Rolling</option>
                <option value="20">Frozen Balance</option>
                <option value="21">Frozen Rolling</option>
                <option value="22">Expired</option>
                <option value="23">Cancelled</option>
                <option value="24">Failed</option>
                <option value="25">Test Approved</option>
                <option value="26">Test Declined</option>
                <option value="27">Test 3DS Authentication</option>
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex float-end">
            <div className="btn-group float-end">
              <button
                type="button"
                className="btn btn-primary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Exporting...
                  </>
                ) : (
                  'Export Data'
                )}
              </button>
              <ul className="dropdown-menu">
                <li><h6 className="dropdown-header">Current Page</h6></li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => exportToCSV(currentItems, `transactions_page_${currentPage}_${new Date().toISOString().split('T')[0]}`)}
                    disabled={isExporting}
                  >
                    <i className="bi bi-file-earmark-excel me-1"></i> Export as CSV
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => exportToJSON(currentItems, `transactions_page_${currentPage}_${new Date().toISOString().split('T')[0]}`)}
                    disabled={isExporting}
                  >
                    <i className="bi bi-file-earmark-code me-1"></i> Export as JSON
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li><h6 className="dropdown-header">All Data</h6></li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => exportAllData('csv')}
                    disabled={isExporting}
                  >
                    <i className="bi bi-file-earmark-excel me-1"></i> Export as CSV
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => exportAllData('json')}
                    disabled={isExporting}
                  >
                    <i className="bi bi-file-earmark-code me-1"></i> Export as JSON
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


      {/* Results count and items per page selector */}
      <div className="row mb-2 align-items-center p-0 m-0">
        <div className="col-md-6">
          <small className="text-muted">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, getSortedData().length)} of {getSortedData().length} transactions
          </small>
        </div>
        <div className="col-md-6 text-end">
          <div className="d-inline-flex align-items-center">
            <label className="me-2">Items per page:</label>
            <select
              className="form-select form-select-sm text-end py-0"
              style={{ width: 'auto', position: 'relative', top: '6px' }}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes highlightRow {
            0% { background-color: #ffffff; }
            50% { background-color: #e3f2fd; }
            100% { background-color: #ffffff; }
          }
          .highlight-update {
            animation: highlightRow 2s ease;
          }
        `}
      </style>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-bordered border-color bg-color custom-bg-text">
            <tr className="table-header">

              <th className="text-nowrap">
                TransID
              </th>
              <th className="text-nowrap">
                Date
              </th>
              <th className="text-nowrap">
                Reference
              </th>
              <th className="text-nowrap">Actions</th>
              <th className="text-nowrap">
                MerID
              </th>
              <th className="text-nowrap">
                Status
              </th>
              <th className="text-nowrap">
                Amount
              </th>
              <th className="text-nowrap">
                Currency
              </th>
              <th className="text-nowrap">
                Connector Ref.
              </th>
              <th className="text-nowrap">
                MOP
              </th>
              <th className="text-nowrap">
                CardNo.
              </th>

            </tr>
          </thead>
          <tbody>
            {currentItems.map((transaction, index) => {
              // Get status info using the helper function
              const { text: statusText, class: statusClass } = getStatusInfo(transaction.transaction.transactionStatus);

              return (
                <tr key={transaction.transaction ? String(transaction.transID) : String(transaction.transaction.transID)}>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewTransaction(transaction);
                      }}
                      className="text-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      {transaction.transaction ? String(transaction.transID) : String(transaction.transaction.transID)}
                    </a>
                    <CopyButton
                      text={transaction.transaction ? String(transaction.transID) : String(transaction.transaction.transID)}
                    />
                  </td>
                  <td>
                    {transaction.transaction.tdate ?
                      formatDate(transaction.transaction.tdate) :
                      formatDate(transaction.transaction.transactionDate) || 'N/A'}
                  </td>
                  <td>{transaction.transaction.reference || 'N/A'}</td>
                  <td>
                    <div className="dropdown position-static border rounded">
                      {/* Dropdown button for toggle wise when click not hover */}
                      <button
                        className="btn btn-sm btn-outline-secondary dropdown-toggle fs-4 py-0 m-0"
                        type="button"
                        onClick={toggleDropdown}
                        aria-expanded={isDropdownOpen}
                      ></button>
                      {/* Ensure the dropdown menu is rendered only once per transaction */}
                      {isDropdownOpen && (
                        <ul className="dropdown-menu">
                          <li>
                            <button className="dropdown-item" onClick={() => handleViewTransaction(transaction)}>
                              <FaEye className="me-2" />View Details
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item" onClick={() => handleViewS2SStatus(transaction.transID)}>
                              <FaEye className="me-2" /> View S2S Status
                            </button>
                          </li>

                          {/* button for #handleRefundAccept */}
                          {(transaction.transaction.transactionStatus === 0 ||
                            transaction.transaction.transactionStatus === 1 ||
                            transaction.transaction.transactionStatus === 8) && (
                              <li>
                                <button className="dropdown-item" onClick={() => handleRefundAccept(transaction)}>
                                  <FaEye className="me-2" /> Refund {transaction.transaction.transactionStatus === 8 ? 'Accept' : 'Request'}
                                </button>
                              </li>
                            )}

                          <li>
                            <button className="dropdown-item" onClick={() => handleEdit(transaction, index)}>
                              <FaEdit className="me-2" /> Edit Transaction
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item text-danger" onClick={() => handleDelete(transaction)}>
                              <FaTrash className="me-2" />Delete Transaction
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  </td>
                  <td>{transaction.transaction.merchantID || 'N/A'}</td>
                  <td>
                    <span className={`badge ${statusClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td>{transaction.transaction.billAmount || '0.00'}</td>
                  <td>{transaction.transaction.billCurrency || 'N/A'}</td>
                  <td>{transaction.additional.connectorRef || 'N/A'}</td>
                  <td>
                    {transaction.transaction.methodOfPayment ||
                      (transaction.additional && transaction.additional.paymentMethod) || 'N/A'}
                  </td>
                  <td>
                    {formatCardNumber(
                      transaction.transaction.ccnoDecrypted ||
                      (transaction.additional && transaction.additional.ccnoDecrypted),
                      transaction.transaction.binNumber ||
                      (transaction.additional && transaction.additional.binNumber)
                    )}
                  </td>

                </tr>
              );
            })}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination with Go to Page */}
      {getSortedData().length > 0 && (
        <div className="d-flex justify-content-end align-items-center mt-4">          

          <nav className="d-flex align-items-center" aria-label="Transaction list pagination">
            <form
              className="d-flex align-items-center me-3"
              onSubmit={(e) => {
                e.preventDefault();
                const page = parseInt(goToPage);
                if (page >= 1 && page <= totalPages) {
                  paginate(page);
                  setGoToPage('');
                }
              }}
              aria-label="Go to page form"
            >
              <input
                type="number"
                className="form-control form-control-sm"
                style={{ width: '70px' }}
                min="1"
                max={totalPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                placeholder="Page"
                aria-label="Go to page number"
                title="Enter a page number between 1 and ${totalPages}"
              />
              <button
                type="submit"
                className="btn btn-sm btn-outline-primary ms-2"
                disabled={!goToPage || goToPage < 1 || goToPage > totalPages}
                aria-label="Go to page"
              >
                Go
              </button>
            </form>

            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  title="Go to first page"
                  aria-label="Go to first page"
                >
                  <span aria-hidden="true">««</span>
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Go to previous page"
                  aria-label="Go to previous page"
                >
                  <span aria-hidden="true">«</span>
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => {
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage)
                ) {
                  return (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(i + 1)}
                        aria-label={`Go to page ${i + 1}`}
                        aria-current={currentPage === i + 1 ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    </li>
                  );
                } else if (i === currentPage - 3 || i === currentPage + 1) {
                  return (
                    <li key={`ellipsis-${i}`} className="page-item disabled">
                      <span className="page-link" aria-hidden="true">...</span>
                    </li>
                  );
                }
                return null;
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Go to next page"
                  aria-label="Go to next page"
                >
                  <span aria-hidden="true">»</span>
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Go to last page"
                  aria-label="Go to last page"
                >
                  <span aria-hidden="true">»»</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Keyboard shortcut indicator */}
      <KeyboardIndicator />

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">
                  <span>Refund</span> <span className="fw-bolder">{selectedTransaction.transaction.transactionStatus === 8 ? 'Accept' : 'Request'}</span> TransID : 
                  <span className="fw-bolder">{selectedTransaction?.transID || ''}</span>
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRefundModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleRefundSubmit}>
                <div className="modal-body">
                  <div className="row d-flex">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Transaction Reference</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedTransaction?.transaction?.reference || ''}
                        disabled
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Original Amount</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={selectedTransaction?.transaction?.bankProcessingAmount || 0}
                          disabled
                        />
                        <span className="input-group-text" style={{maxHeight:"46px"}}>{selectedTransaction?.transaction?.bankProcessingCurrency || ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label required">Refund Amount</label>
                    <div className="input-group">
                      <input
                        type="text"
                        pattern="[0-9]*\.?[0-9]{0,2}"
                        className="form-control"
                        value={refundAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers with up to 2 decimal places
                          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                            setRefundAmount(value);
                          }
                        }}
                        onBlur={(e) => {
                          // Format to 2 decimal places on blur
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setRefundAmount(value.toFixed(2));
                          }
                        }}
                        required
                        placeholder="Enter refund amount"
                      />
                      <span className="input-group-text py-0" style={{maxHeight:"46px"}} >{selectedTransaction?.transaction?.bankProcessingCurrency || ''}</span>
                    </div>
                    {parseFloat(refundAmount) > parseFloat(selectedTransaction?.transaction?.bankProcessingAmount || 0) && (
                      <div className="text-danger small mt-1">
                        Refund amount cannot exceed original transaction amount
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label required">Refund Reason</label>
                    <textarea
                      className="form-control"
                      value={refundComment}
                      onChange={(e) => setRefundComment(e.target.value)}
                      rows="3"
                      required
                      placeholder="Please provide a reason for the refund..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRefundModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !refundAmount ||
                      !refundComment ||
                      parseFloat(refundAmount) <= 0 ||
                      parseFloat(refundAmount) > parseFloat(selectedTransaction?.transaction?.bankProcessingAmount || 0) ||
                      isRefundProcessing
                    }
                  >
                    {isRefundProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Submit Refund Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTransactionToDelete(null);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the transaction with reference "{transactionToDelete?.transaction?.reference}" (ID: {transactionToDelete?.transaction?.transID})?</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTransactionToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => confirmDelete(transactionToDelete?.transaction?.transID)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* S2S Status Modal */}
      {showS2SModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">S2S Status Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowS2SModal(false);
                    setS2SStatusData(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {!s2sStatusData && (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading S2S status data...</p>
                  </div>
                )}

                {s2sStatusData && s2sStatusData.error && (
                  <div className="alert alert-danger">
                    <h5 className="mb-2">Error: {s2sStatusData.status ? `${s2sStatusData.status} - ` : ''}{s2sStatusData.message || "Failed to fetch S2S status"}</h5>
                    {s2sStatusData.networkError && (
                      <p className="mb-0">
                        <strong>Network Error:</strong> Unable to connect to the server. Please check your internet connection and try again.
                      </p>
                    )}
                    <p className="mt-2 mb-0">
                      <small>Please try again later or contact support if the issue persists.</small>
                    </p>
                  </div>
                )}

                {s2sStatusData && s2sStatusData.isEmpty && (
                  <div className="alert alert-info">
                    <p className="mb-0">No S2S status data available for this transaction.</p>
                  </div>
                )}

                {s2sStatusData && !s2sStatusData.isEmpty && (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th width="30%">Transaction ID</th>
                          <td>{s2sStatusData.transID || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <span className={`badge ${s2sStatusData.order_status === '1' || s2sStatusData.status === 'Approved' || s2sStatusData.status === 'SUCCESS' ? 'bg-success' :
                                s2sStatusData.order_status === '2' || s2sStatusData.status === 'FAILED' || s2sStatusData.status === 'Failed' ? 'bg-danger' :
                                  s2sStatusData.order_status === '0' || s2sStatusData.status === 'PENDING' || s2sStatusData.status === 'Pending' ? 'bg-warning' :
                                    'bg-secondary'
                              }`}>
                              {s2sStatusData.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Response Message</th>
                          <td>{s2sStatusData.connector_response_msg || s2sStatusData.response || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Date/Time</th>
                          <td>{s2sStatusData.tdate || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Amount</th>
                          <td>{s2sStatusData.bill_amt ? `${s2sStatusData.bill_amt} ${s2sStatusData.bill_currency || ''}` : 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Payment Method</th>
                          <td>{s2sStatusData.mop || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Reference</th>
                          <td>{s2sStatusData.reference || 'N/A'}</td>
                        </tr>
                        {s2sStatusData.ccno && (
                          <tr>
                            <th>Card Number</th>
                            <td>{s2sStatusData.ccno || 'N/A'}</td>
                          </tr>
                        )}
                        {s2sStatusData.gateway_response && (
                          <tr>
                            <th>Gateway Response</th>
                            <td>
                              <pre className="bg-light p-2 rounded">
                                {JSON.stringify(s2sStatusData.gateway_response, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th>Full Response</th>
                          <td>
                            <pre className="bg-light p-2 rounded">
                              {JSON.stringify(s2sStatusData, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowS2SModal(false);
                    setS2SStatusData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Transaction Modal */}
      {showViewModal && viewTransaction && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transaction Details :: {String(viewTransaction.transID) || String(viewTransaction.additional.transID) || 'N/A'}
                  <CopyButton
                    text={String(viewTransaction.transID) || String(viewTransaction.additional.transID) || ''}
                  />
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseViewModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="accordion" id="transactionAccordion">
                  {/* Basic Transaction Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#basicInfo">
                        Basic Transaction Information
                      </button>
                    </h2>
                    <div id="basicInfo" className="accordion-collapse collapse show" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction ID:</label>
                            <div>{String(viewTransaction.transID) || String(viewTransaction.additional.transID) || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Reference:</label>
                            <div>{viewTransaction.transaction.reference || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bearer Token:</label>
                            <div>{viewTransaction.transaction.bearerToken || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction Date:</label>
                            <div>{new Date(viewTransaction.transaction.tdate || viewTransaction.transaction.transactionDate).toLocaleString()}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Status:</label>
                            <div>
                              <span className={`badge ${viewTransaction.transaction.transactionStatus === 1 ? 'bg-success' :
                                viewTransaction.transaction.transactionStatus === 2 ? 'bg-danger' :
                                viewTransaction.transaction.transactionStatus === 3 ? 'bg-info' :
                                  viewTransaction.transaction.transactionStatus === 0 || 
                                  viewTransaction.transaction.transactionStatus === 8 ? 'bg-warning' : 'bg-secondary'}`}>
                                {viewTransaction.transaction.transactionStatus === 1 ? 'Approved' :
                                 viewTransaction.transaction.transactionStatus === 2 ? 'Declined' :
                                 viewTransaction.transaction.transactionStatus === 3 ? 'Refunded' :
                                 viewTransaction.transaction.transactionStatus === 8 ? 'Refund Pending' :
                                 viewTransaction.transaction.transactionStatus === 0 ? 'Pending' : 
                                 viewTransaction.transaction.transactionStatus || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Merchant ID:</label>
                            <div>{viewTransaction.transaction.merchantID || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction Flag:</label>
                            <div>{viewTransaction.transaction.transactionFlag || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Related Transaction ID:</label>
                            <div>{viewTransaction.transaction.relatedTransactionID || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction Type:</label>
                            <div>{viewTransaction.transaction.transactionType || 'N/A'}</div>
                          </div>

                          {viewTransaction.additional?.systemNote !== undefined && viewTransaction.additional?.systemNote !== null && viewTransaction.additional?.systemNote !== '' && (
                          <div className="col-md-12 mb-3">
                            <label className="fw-bold">System Note:</label>
                            <PrintDateNote printDateNote={viewTransaction.additional?.systemNote} />
                          </div>
                          )}

                          {viewTransaction.additional?.merchantNote !== undefined && viewTransaction.additional?.merchantNote !== null && viewTransaction.additional?.merchantNote !== '' && (
                          <div className="col-md-12 mb-3">
                            <label className="fw-bold">Merchant Note:</label>
                            <PrintDateNote printDateNote={viewTransaction.additional?.merchantNote} />
                          </div>
                          )}

                          {viewTransaction.additional?.supportNote !== undefined && viewTransaction.additional?.supportNote !== null && viewTransaction.additional?.supportNote !== '' && (
                            <div className="col-md-12 mb-3">
                              <label className="fw-bold">Support Note:</label>
                              <PrintDateNote printDateNote={viewTransaction.additional?.supportNote} />
                            </div>
                          )
                          }

                        </div>
                        
                      </div>
                    </div>
                  </div>

                  {/* Amount Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#amountInfo">
                        Amount Information
                      </button>
                    </h2>
                    <div id="amountInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bill Amount:</label>
                            <div>{viewTransaction.transaction.billAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bill Currency:</label>
                            <div>{viewTransaction.transaction.billCurrency || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction Amount:</label>
                            <div>{viewTransaction.transaction.transactionAmount || viewTransaction.transaction.amount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Transaction Currency:</label>
                            <div>{viewTransaction.transaction.transactionCurrency || viewTransaction.transaction.currency || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bank Processing Amount:</label>
                            <div>{viewTransaction.transaction.bankProcessingAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bank Processing Currency:</label>
                            <div>{viewTransaction.transaction.bankProcessingCurrency || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Payable Transaction Amount:</label>
                            <div>{viewTransaction.transaction.payableTransactionAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Remaining Balance Amount:</label>
                            <div>{viewTransaction.transaction.remainingBalanceAmount || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#feeInfo">
                        Fee Information
                      </button>
                    </h2>
                    <div id="feeInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Buy MDR Amount:</label>
                            <div>{viewTransaction.transaction.buyMdrAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Sell MDR Amount:</label>
                            <div>{viewTransaction.transaction.sellMdrAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Buy Txn Fee Amount:</label>
                            <div>{viewTransaction.transaction.buyTxnFeeAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Sell Txn Fee Amount:</label>
                            <div>{viewTransaction.transaction.sellTxnFeeAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">GST Amount:</label>
                            <div>{viewTransaction.transaction.gstAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">MDR Cashback Amount:</label>
                            <div>{viewTransaction.transaction.mdrCashbackAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">MDR Cashback 1 Amount:</label>
                            <div>{viewTransaction.transaction.mdrCashback1Amount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">MDR Refund Fee Amount:</label>
                            <div>{viewTransaction.transaction.mdrRefundFeeAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Fee Update Timestamp:</label>
                            <div>{viewTransaction.transaction.feeUpdateTimestamp || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentInfo">
                        Payment Method Information
                      </button>
                    </h2>
                    <div id="paymentInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Connector:</label>
                            <div>{viewTransaction.transaction.connector || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Method of Payment:</label>
                            <div>{viewTransaction.transaction.methodOfPayment || viewTransaction.transaction.paymentMethod || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Channel Type:</label>
                            <div>{viewTransaction.transaction.channelType || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Integration Type:</label>
                            <div>{viewTransaction.transaction.integrationType || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Terminal Number:</label>
                            <div>{viewTransaction.transaction.terminalNumber || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bin Number:</label>
                            <div>{viewTransaction.additional?.binNumber || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Card Number:</label>
                            <div>{viewTransaction.additional?.cardNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#customerInfo">
                        Customer Information
                      </button>
                    </h2>
                    <div id="customerInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Full Name:</label>
                            <div>{viewTransaction.transaction.fullName || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bill Email:</label>
                            <div>{viewTransaction.transaction.billEmail || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Bill IP:</label>
                            <div>{viewTransaction.transaction.billIP || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing Phone:</label>
                            <div>{viewTransaction.additional?.billingPhone || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing Address1:</label>
                            <div>{viewTransaction.additional?.billingAddress || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing City:</label>
                            <div>{viewTransaction.additional?.billingCity || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing State:</label>
                            <div>{viewTransaction.additional?.billingState || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing Country:</label>
                            <div>{viewTransaction.additional?.billingCountry || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Billing Zip:</label>
                            <div>{viewTransaction.additional?.billingZip || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Product Name:</label>
                            <div>{viewTransaction.additional?.productName || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#settlementInfo">
                        Settlement Information
                      </button>
                    </h2>
                    <div id="settlementInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Settlement Date:</label>
                            <div>{viewTransaction.transaction.settlementDate || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Settlement Delay:</label>
                            <div>{viewTransaction.transaction.settlementDelay || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Rolling Amount:</label>
                            <div>{viewTransaction.transaction.rollingAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Rolling Date:</label>
                            <div>{viewTransaction.transaction.rollingDate || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Rolling Delay:</label>
                            <div>{viewTransaction.transaction.rollingDelay || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Available Rolling:</label>
                            <div>{viewTransaction.transaction.availableRolling || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Available Balance:</label>
                            <div>{viewTransaction.transaction.availableBalance || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Mature Rolling Fund Amount:</label>
                            <div>{viewTransaction.transaction.matureRollingFundAmount || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Immature Rolling Fund Amount:</label>
                            <div>{viewTransaction.transaction.immatureRollingFundAmount || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#technicalInfo">
                        Technical Information
                      </button>
                    </h2>
                    <div id="technicalInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Auth URL:</label>
                            <div>{viewTransaction.additional?.authUrl || 'N/A'}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Source URL:</label>
                            <div>{viewTransaction.additional?.sourceUrl || 'N/A'}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Webhook URL:</label>
                            <div>{viewTransaction.additional?.webhookUrl || 'N/A'}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Return URL:</label>
                            <div>{viewTransaction.additional?.returnUrl || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">UPA:</label>
                            <div>{viewTransaction.additional?.upa || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">RRN:</label>
                            <div>{viewTransaction.additional?.rrn || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Connector Ref:</label>
                            <div>{viewTransaction.additional?.connectorRef || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Descriptor:</label>
                            <div>{viewTransaction.additional?.descriptor || 'N/A'}</div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="fw-bold">Runtime:</label>
                            <div>{viewTransaction.transaction.runtime || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Responses */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#notesInfo">
                        Notes & Responses
                      </button>
                    </h2>
                    <div id="notesInfo" className="accordion-collapse collapse" data-bs-parent="#transactionAccordion">
                      <div className="accordion-body">
                        <div className="row">
                          
                          
                         
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Transaction Response:</label>
                            <div>{viewTransaction.additional?.transactionResponse || 'N/A'}</div>
                          </div>
                          
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Auth URL:</label>
                            <div>{viewTransaction.additional?.authUrl || 'N/A'}</div>
                          </div>      
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Connector Ref.:</label>
                            <div>{viewTransaction.additional?.connectorRef || 'N/A'}</div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Descriptor:</label>
                            <div>{viewTransaction.additional?.descriptor || 'N/A'}</div>
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Post Request:</label>
                            <JsonPrettyPrint json={viewTransaction.additional?.payloadStage1} />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Connector Key:</label>
                            <JsonPrettyPrint json={viewTransaction.additional?.connectorCredsProcessingFinal} />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">Connector Response:</label>
                            <JsonPrettyPrint json={viewTransaction.additional?.connectorResponse} />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label className="fw-bold">AuthData:</label>
                            <JsonPrettyPrint json={viewTransaction.additional?.authData} />
                          </div>
                          
                        </div>

                        <div className="row mt-3">
                          <div className="col-12">
                            <label className="fw-bold">JSON Value:</label>
                            <pre className="bg-light p-3 mt-2 rounded small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                              {viewTransaction.additional?.jsonValue ? JSON.stringify(JSON.parse(viewTransaction.additional.jsonValue), null, 2) : 'N/A'}
                            </pre>
                          </div>
                          <div className="col-12 mt-3">
                            <label className="fw-bold">Connector JSON:</label>
                            <pre className="bg-light p-3 mt-2 rounded small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                              {viewTransaction.additional?.connectorJson ? JSON.stringify(JSON.parse(viewTransaction.additional.connectorJson), null, 2) : 'N/A'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseViewModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Transaction Modal */}

      {/* Edit Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Transaction</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}>

                <div className="modal-body">
                  <div className="accordion" id="editTransactionAccordion">
                    {/* Basic Transaction Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#editBasicInfo">
                          Basic Transaction Information
                        </button>
                      </h2>
                      <div id="editBasicInfo" className="accordion-collapse collapse show" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction ID</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction?.additional?.transID || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transID', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Reference</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.reference || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'reference', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bearer Token</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.bearerToken || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'bearerToken', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction Date</label>
                              <input
                                type="datetime-local"
                                className="form-control"
                                value={formatDateForInput(editedTransaction.transaction.tdate || editedTransaction.transaction.transactionDate)}
                                onChange={(e) => setEditedTransactionField('transaction', 'tdate', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Status</label>
                              <select
                                className="form-select"
                                value={editedTransaction.transaction.transactionStatus || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transactionStatus', e.target.value)}
                              >
                                <option value="">Select Status</option>
                                <option value="0">Pending</option>
                                <option value="1">Approved</option>
                                <option value="2">Declined</option>
                                <option value="3">Refunded</option>
                                <option value="5">Chargeback</option>
                                <option value="7">Reversed</option>
                                <option value="8">Refund Pending</option>
                                <option value="9">Test</option>
                                <option value="10">Blocked</option>
                                <option value="11">Predispute</option>
                                <option value="12">Partial Refund</option>
                                <option value="13">Withdraw Requested</option>
                                <option value="14">Withdraw Rolling</option>
                                <option value="20">Frozen Balance</option>
                                <option value="21">Frozen Rolling</option>
                                <option value="22">Expired</option>
                                <option value="23">Cancelled</option>
                                <option value="24">Failed</option>
                                <option value="25">Test Approved</option>
                                <option value="26">Test Declined</option>
                                <option value="27">Test 3DS Authentication</option>
                              </select>
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Merchant ID</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.merchantID || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'merchantID', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction Flag</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.transactionFlag || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transactionFlag', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Related Transaction ID</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.relatedTransactionID || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'relatedTransactionID', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction Type</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.transactionType || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transactionType', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#editAmountInfo">
                          Amount Information
                        </button>
                      </h2>
                      <div id="editAmountInfo" className="accordion-collapse collapse" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bill Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.billAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'billAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bill Currency</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.billCurrency || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'billCurrency', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.transactionAmount || editedTransaction.transaction.amount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transactionAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Transaction Currency</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.transactionCurrency || editedTransaction.transaction.currency || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'transactionCurrency', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bank Processing Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.bankProcessingAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'bankProcessingAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bank Processing Currency</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.bankProcessingCurrency || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'bankProcessingCurrency', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Fee Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#editFeeInfo">
                          Fee Information
                        </button>
                      </h2>
                      <div id="editFeeInfo" className="accordion-collapse collapse" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Buy MDR Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.buyMdrAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'buyMdrAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Sell MDR Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.sellMdrAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'sellMdrAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Buy Txn Fee Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.buyTxnFeeAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'buyTxnFeeAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Sell Txn Fee Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.sellTxnFeeAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'sellTxnFeeAmount', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">GST Amount</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={editedTransaction.transaction.gstAmount || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'gstAmount', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#editPaymentInfo">
                          Payment Method Information
                        </button>
                      </h2>
                      <div id="editPaymentInfo" className="accordion-collapse collapse" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Connector</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.connector || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'connector', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Method of Payment</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.methodOfPayment || editedTransaction.transaction.paymentMethod || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'methodOfPayment', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Channel Type</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.channelType || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'channelType', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#editCustomerInfo">
                          Customer Information
                        </button>
                      </h2>
                      <div id="editCustomerInfo" className="accordion-collapse collapse" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Full Name</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.fullName || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'fullName', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bill Email</label>
                              <input
                                type="email"
                                className="form-control"
                                value={editedTransaction.transaction.billEmail || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'billEmail', e.target.value)}
                              />
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label">Bill IP</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.billIP || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'billIP', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#editAdditionalInfo">
                          Additional Information
                        </button>
                      </h2>
                      <div id="editAdditionalInfo" className="accordion-collapse collapse" data-bs-parent="#editTransactionAccordion">
                        <div className="accordion-body">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Merchant Note</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={editedTransaction.additional?.merchantNote || ''}
                                onChange={(e) => setEditedTransactionField('additional', 'merchantNote', e.target.value)}
                              ></textarea>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Support Note</label>
                              <textarea
                                rows="3"
                                value={editedTransaction.additional?.supportNote || ''}
                                onChange={(e) => setEditedTransactionField('additional', 'supportNote', e.target.value)}
                              ></textarea>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">System Note</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={editedTransaction.additional?.systemNote || ''}
                                onChange={(e) => setEditedTransactionField('additional', 'systemNote', e.target.value)}
                              ></textarea>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Remark Status</label>
                              <input
                                type="text"
                                className="form-control"
                                value={editedTransaction.transaction.remarkStatus || ''}
                                onChange={(e) => setEditedTransactionField('transaction', 'remarkStatus', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};



const TransactionApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [externalSortConfig, setExternalSortConfig] = useState({
    key: 'transactionDate',
    direction: 'desc'  // Make sure this is 'desc'
  });

  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching transactions with config:", externalSortConfig);

      // Build the sort parameter string
      const sortParam = `${externalSortConfig.key},${externalSortConfig.direction}`;
      const url = `${process.env.REACT_APP_BASE_URL}/api/transactions/all?sort=${sortParam}`;

      console.log("API URL:", url);
      console.log("Auth token present:", !!getAuthToken());

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      console.log("Transactions response status:", response.status);
      console.log("Transactions response data type:", typeof response.data);
      console.log("Transactions response data:", response.data);

      if (Array.isArray(response.data)) {
        console.log("Setting transactions from array, length:", response.data.length);
        setTransactions(response.data);
        setIsLoading(false); // Explicitly set loading to false here too
      } else if (response.data && typeof response.data === 'object') {
        // Check for Spring Data pagination format
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log("Found Spring Data pagination format, content length:", response.data.content.length);
          setTransactions(response.data.content);
        } else {
          // Try other common properties
          const transactionData = response.data.content || response.data.transactions || response.data.data || [];
          console.log("Extracted transaction data from object, length:", transactionData.length);
          setTransactions(transactionData);
        }
        setIsLoading(false); // Explicitly set loading to false here too
      } else {
        console.error("Unexpected response format:", response.data);
        setTransactions([]); // Set empty array as fallback
        setIsLoading(false); // Explicitly set loading to false here too
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      console.error("Error details:", error.response ? error.response.data : "No response data");
      toast.error("Failed to fetch transactions. Please try again later.", {
        toastId: 'fetch-error',
        position: "top-center",
        autoClose: 3000,
      });
      setTransactions([]); // Set empty array on error
      setIsLoading(false); // Explicitly set loading to false here too
    } finally {
      console.log("Finally block - setting isLoading to false");
      setIsLoading(false);
    }
  };

  // Fix the typo in useEffect
  useEffect(() => {
    console.log("Effect running with sort config:", externalSortConfig);
    if (!getAuthToken()) {
      toast.error("Authentication token not found. Please login again.", {
        toastId: 'auth-error',
        position: "top-center",
        autoClose: 3000,
      });
      // Optionally redirect to login
      return;
    }
    fetchTransactions();
  }, [externalSortConfig]); // Only run when sort config changes


  const handleAddTransaction = (newTransaction) => {
    setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
  };

  // Handle sort changes (to be passed to TransactionList)
  const handleSort = (key) => {
    let direction = 'desc'; // Default to desc

    // For transactionDate, always use desc if it's not already desc
    if (key === 'transactionDate') {
      if (externalSortConfig.key === key && externalSortConfig.direction === 'desc') {
        direction = 'asc';
      } else {
        direction = 'desc'; // Force desc for transactionDate
      }
    } else {
      // For other columns, toggle as usual
      if (externalSortConfig.key === key && externalSortConfig.direction === 'desc') {
        direction = 'asc';
      }
    }

    console.log(`Sorting by ${key} in ${direction} order`);
    setExternalSortConfig({ key, direction });
  };


  return (
    <div className="container mt-2">
      
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading transactions...</p>
        </div>
      ) : (
        <>
          <TransactionList
            transactions={transactions}
            setTransactions={setTransactions}
            onRefresh={fetchTransactions}
            externalSortConfig={externalSortConfig}
            onSort={handleSort}
          />
        </>
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </div>
  );
};

export default TransactionApp;
