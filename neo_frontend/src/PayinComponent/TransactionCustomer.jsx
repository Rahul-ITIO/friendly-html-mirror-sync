import React, { useState, useEffect, useRef } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaEye, FaCopy } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

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
    return sessionStorage.getItem("customer-jwtToken");
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
  onSort = () => {}
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isExporting, setIsExporting] = useState(false);
    const [goToPage, setGoToPage] = useState('');
    const [lastKeyPressed, setLastKeyPressed] = useState(null);
    const keyIndicatorTimeout = useRef(null);
    const [updatedCode, setUpdatedCode] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const user = JSON.parse(sessionStorage.getItem("active-customer"));

    const [addFormData, setAddFormData] = useState({
        // Update these fields to match your Transaction entity
        transID: "",
        reference: "",
        merchantID: "",
        transactionStatus: "",
        // Add other fields as needed
    });

    
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewTransaction, setViewTransaction] = useState(null);

    const handleViewTransaction = (transaction) => {
        setViewTransaction(transaction);
        setShowViewModal(true);
    };

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
      return sessionStorage.getItem("customer-jwtToken");
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

            const matchesSearch =
                String(transaction.transID || '').toLowerCase().includes(searchLower) ||
                String(transactionData.transID || '').toLowerCase().includes(searchLower) ||
                String(transactionData.reference || '').toLowerCase().includes(searchLower) ||
                String(transactionData.merchantID || '').toLowerCase().includes(searchLower) ||
                String(transactionData.amount || '').toLowerCase().includes(searchLower) ||
                String(transactionData.currency || '').toLowerCase().includes(searchLower) ||
                String(transactionData.paymentMethod || '').toLowerCase().includes(searchLower);

            // Merchant filter
            const matchesMerchant = !filterType || transactionData.merchantID === filterType;

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
        'Transaction ID':  String(additional.transID) || String(transaction.transID) || transaction.id || '',
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


  // Function to export all data
const exportAllData = async (format) => {
    try {
      setIsExporting(true);
      
      // Get all transactions from the backend
      const token = getAuthToken();
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/all/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.status === 200 && response.data) {
        const allTransactions = response.data;
        const filename = `all_transactions_${new Date().toISOString().split('T')[0]}`;
        
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
      toast.error(`Failed to export all transactions. ${error.message || 'Please try again.'}`);
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


  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container-fluid card py-4">

        {/* Search, filters, and export buttons */}
        <div className="row mb-3">
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
                                className="btn btn-outline-secondary py-0"
                                type="button"
                                style={{maxHeight:'42px'}}
                                onClick={() => setSearchTerm('')}
                                title="Clear search"
                            >X</button>
                        </div>
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
                            className="btn btn-outline-secondary w-100"
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
                            className="btn btn-outline-primary dropdown-toggle"
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
      <div className="row mb-3 align-items-center">
        <div className="col-md-6">
          <small className="text-muted">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, getSortedData().length)} of {getSortedData().length} transactions
          </small>
        </div>
        <div className="col-md-6 text-end">
          <div className="d-inline-flex align-items-center">
            <label className="me-2">Items per page:</label>
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
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
            <thead>
                <tr className="table-header">
            
                    <th onClick={() => handleSort('transID')} className="text-nowrap">
                        TransID {renderSortIndicator('transID')}
                    </th>
                    <th onClick={() => handleSort('tdate')} className="text-nowrap">
                        Date {renderSortIndicator('tdate')}
                    </th>
                    <th onClick={() => handleSort('reference')} className="text-nowrap">
                        Reference {renderSortIndicator('reference')}
                    </th>
                    <th className="text-nowrap">Actions</th>
                    <th onClick={() => handleSort('merchantID')} className="text-nowrap">
                        MerID {renderSortIndicator('merchantID')}
                    </th>
                    <th onClick={() => handleSort('transactionStatus')} className="text-nowrap">
                        Status {renderSortIndicator('transactionStatus')}
                    </th>
                    <th onClick={() => handleSort('amount')} className="text-nowrap">
                        Amount {renderSortIndicator('amount')}
                    </th>
                    <th onClick={() => handleSort('currency')} className="text-nowrap">
                        Currency {renderSortIndicator('currency')}
                    </th>
                    <th onClick={() => handleSort('paymentMethod')} className="text-nowrap">
                        MOP {renderSortIndicator('paymentMethod')}
                    </th>
                    <th onClick={() => handleSort('createdAt')} className="text-nowrap">
                        CardNo. {renderSortIndicator('createdAt')}
                    </th>
                    
                </tr>
            </thead>
            <tbody>
                {currentItems.map((transaction, index) => {
                    // Get status info using the helper function
                    const { text: statusText, class: statusClass } = getStatusInfo(transaction.transaction.transactionStatus);

                    return (
                      <tr key={transaction.transaction ?  String(transaction.transID) : String(transaction.transaction.transID)}>
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
                                  {transaction.transaction ?  String(transaction.transID) : String(transaction.transaction.transID)}
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
                                    <button
                                        className="btn btn-sm btn-outline-secondary dropdown-toggle fs-4 py-0 m-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    ></button>
                                    <ul className="dropdown-menu border rounded">
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => handleViewTransaction(transaction)}
                                            >
                                                <FaEye className="me-2" /> View Details
                                            </button>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                    </ul>
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
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center">
            <div className="keyboard-shortcuts bg-light p-2 rounded border">
              <h6 className="mb-2">Keyboard Shortcuts</h6>
              <div className="d-flex gap-3">
                <span>
                  <kbd>←</kbd> Previous Page
                </span>
                <span>
                  <kbd>→</kbd> Next Page
                </span>
                <span>
                  <kbd>Home</kbd> First Page
                </span>
                <span>
                  <kbd>End</kbd> Last Page
                </span>
              </div>
            </div>
          </div>
          
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
                    <li key={i} className="page-item disabled">
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

        {/* View Transaction Modal */}
        {showViewModal && viewTransaction && (
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title d-flex align-items-center">
                                Transaction Details :: { String(viewTransaction.transID) || String(viewTransaction.additional.transID) || 'N/A'}
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
                                                    <div>{ String(viewTransaction.transID) || String(viewTransaction.additional.transID) || 'N/A'}</div>
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
                                                        <span className={`badge ${viewTransaction.transaction.transactionStatus === 'SUCCESS' ? 'bg-success' :
                                                            viewTransaction.transaction.transactionStatus === 'FAILED' ? 'bg-danger' :
                                                            viewTransaction.transaction.transactionStatus === 'PENDING' ? 'bg-warning' : 'bg-secondary'}`}>
                                                            {viewTransaction.transaction.transactionStatus || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="fw-bold">Bill Amount:</label>
                                                    <div>{viewTransaction.transaction.billAmount || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="fw-bold">Bill Currency:</label>
                                                    <div>{viewTransaction.transaction.billCurrency || 'N/A'}</div>
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
                                                <div className="col-md-4 mb-3">
                                                    <label className="fw-bold">Auth URL:</label>
                                                    <div>{viewTransaction.additional?.authUrl || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="fw-bold">Source URL:</label>
                                                    <div>{viewTransaction.additional?.sourceUrl || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label className="fw-bold">Webhook URL:</label>
                                                    <div>{viewTransaction.additional?.webhookUrl || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-4 mb-3">
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
                                                    <label className="fw-bold">Merchant Note:</label>
                                                    <div>{viewTransaction.additional?.merchantNote || 'N/A'}</div>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="fw-bold">Support Note:</label>
                                                    <div>{viewTransaction.additional?.supportNote || 'N/A'}</div>
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

  // Add user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("active-customer"));

  const getAuthToken = () => {
    return sessionStorage.getItem("customer-jwtToken");
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching transactions with config:", externalSortConfig);
      
      // Make sure user exists before making the request
      if (!user || !user.id) {
        throw new Error("User not found in session");
      }
      
      // Build the sort parameter string
      const sortParam = `${externalSortConfig.key},${externalSortConfig.direction}`;
      const url = `${process.env.REACT_APP_BASE_URL}/api/transactions/all/${user.id}?sort=${sortParam}`;
      
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
      <h2>Transactions</h2>
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
