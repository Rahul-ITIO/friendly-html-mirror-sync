import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import axiosInstance from '../utils/axiosConfig';
import { FaEdit, FaTrash, FaEye} from 'react-icons/fa';
import { CiSearch } from "react-icons/ci";

const PayinProcessingFee = () => {
  const [payinProcessingFee, setPayinProcessingFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [currentPayinProcessingFee, setCurrentPayinProcessingFee] = useState({
    merid: 0,
    connectorId: '',
    connectorProcessingMode: null,
    mdrRate: 0.00,
    txnFeeAprroved: 0.00,
    txnFeeFailed: 0.00,
    taxOnMdrRate: 0.00,
    reserveRate: '',
    reserveDelay: '',
    monthlyFee: 0.00,
    chargeBackFee1: 0.00,
    chargeBackFee2: 0.00,
    chargeBackFee3: 0.00,
    predisputFee: 0.00,
    refundFee: 0.00,
    specialMdrRate: 0.00,
    specialMdrRangeAmount: 0.00,
    specialMdrRangeAmountApply: 0.00,
    settelementDelay: '',
  });
  const [searchCriteria, setSearchCriteria] = useState({
    connectorProcessingMode: '',
    connectorId: '',
    merid: '',
    mdrRate: '',
    monthlyFee: ''
  });
  const [filteredPayinProcessingFees, setFilteredPayinProcessingFees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    fetchCustomers();
    fetchConnectors();
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

  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };

  useEffect(() => {
    fetchPayinProcessingFees();
  }, []);

  useEffect(() => {
    filterPayinProcessingFees();
  }, [payinProcessingFee, searchCriteria]);

  const handlePermissionError = () => {
    const token = sessionStorage.getItem("admin-jwtToken");
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/login';
      return;
    }
    toast.error('You do not have permission to perform this action. Please contact your administrator.');
  };

  const fetchPayinProcessingFees = async () => {
    try {
      setLoading(true);
      console.log('Fetching payin processing fees...');
      
      // Clear any existing error messages first
      dismissPermissionErrors();
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Log the token being used for debugging
      const token = sessionStorage.getItem("admin-jwtToken");
      if (!token) {
        console.error('No admin token found in session storage');
        toast.error('Authentication error: Please log in again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      console.log('Using token (first 10 chars):', token.substring(0, 10) + '...');
      
      // Make the API request with explicit headers
      const response = await axiosInstance.get(`/api/payin-processing-fee/search?timestamp=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response?.data) {
        console.log('Fetched data:', response.data);
        setPayinProcessingFees(response.data);
        setFilteredPayinProcessingFees(response.data);
        
        // If we have active filters, apply them to the new data
        if (searchCriteria.connectorProcessingMode || searchCriteria.connectorId || 
            searchCriteria.merid || searchCriteria.mdrRate || searchCriteria.monthlyFee) {
          filterPayinProcessingFees();
        }
      } else {
        console.error('No data returned from API');
        setPayinProcessingFees([]);
        setFilteredPayinProcessingFees([]);
      }
    } catch (error) {
      console.error('Error fetching payin processing fees:', error);
      
      // Check for specific error codes
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 403) {
          toast.error(`Authentication error: You don't have permission to access this resource. Please log in with an admin account.`);
          
          // Check if token is expired or invalid
          const token = sessionStorage.getItem("admin-jwtToken");
          if (!token) {
            console.error('No JWT token found in session storage');
            // Redirect to login after a short delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } else if (error.response.status === 401) {
          toast.error(`Authentication error: Your session has expired. Please log in again.`);
          // Clear the invalid token
          sessionStorage.removeItem("admin-jwtToken");
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast.error(`Error fetching data: ${error.message || 'Unknown error'}`);
        }
      } else {
        toast.error(`Error fetching data: ${error.message || 'Unknown error'}`);
      }
      
      setPayinProcessingFees([]);
      setFilteredPayinProcessingFees([]);
    } finally {
      setLoading(false);
    }
  };

  const dismissPermissionErrors = () => {
    // Find and dismiss any permission error toasts
    const toastElements = document.querySelectorAll('.Toastify__toast');
    toastElements.forEach(element => {
      if (element.textContent.includes('permission') || element.textContent.includes('administrator')) {
        // Find the toast ID and dismiss it
        const toastId = element.getAttribute('data-toastid');
        if (toastId) {
          toast.dismiss(toastId);
        }
      }
    });
  };

  const filterPayinProcessingFees = () => {
    let filtered = [...payinProcessingFee];
    
    if (searchCriteria.connectorProcessingMode) {
      filtered = filtered.filter(terminal => 
        String(terminal.connectorProcessingMode) === searchCriteria.connectorProcessingMode
      );
    }
    if (searchCriteria.connectorId) {
      filtered = filtered.filter(terminal => 
        String(terminal.connectorId || '').toLowerCase().includes(searchCriteria.connectorId.toLowerCase())
      );
    }
    if (searchCriteria.merid) {
      filtered = filtered.filter(terminal => 
        String(terminal.merid || '').toLowerCase().includes(searchCriteria.merid.toLowerCase())
      );
    }
    if (searchCriteria.mdrRate) {
      filtered = filtered.filter(terminal => 
        String(terminal.mdrRate || '').includes(searchCriteria.mdrRate)
      );
    }
    if (searchCriteria.monthlyFee) {
      filtered = filtered.filter(terminal => 
        String(terminal.monthlyFee || '').includes(searchCriteria.monthlyFee)
      );
    }
    
    setFilteredPayinProcessingFees(filtered);
  };

  const fetchCompleteRecordById = async (id) => {
    try {
      console.log(`Fetching complete record for ID: ${id}`);
      const response = await axiosInstance.get(`/api/payin-processing-fee/${id}`);
      
      if (response?.data) {
        console.log('Complete record fetched:', response.data);
        return response.data;
      } else {
        console.error('Failed to fetch complete record');
        return null;
      }
    } catch (error) {
      console.error('Error fetching complete record:', error);
      return null;
    }
  };

  const openModal = (terminal = null) => {
    if (terminal) {
      console.log('Opening modal for editing terminal:', terminal);
      
      // When editing an existing record, fetch the complete record first
      if (terminal.id) {
        // Show loading toast
        const loadingToastId = toast.info('Loading record details...', { autoClose: false });
        
        // Fetch the complete record by ID
        fetchCompleteRecordById(terminal.id)
          .then(completeRecord => {
            toast.dismiss(loadingToastId);
            
            if (completeRecord) {
              // Use the complete record data
              const editData = {
                ...completeRecord,
                // Convert numeric values for form fields
                mdrRate: parseFloat(completeRecord.mdrRate || 0).toFixed(2),
                txnFeeAprroved: parseFloat(completeRecord.txnFeeAprroved || 0).toFixed(2),
                txnFeeFailed: parseFloat(completeRecord.txnFeeFailed || 0).toFixed(2),
                taxOnMdrRate: parseFloat(completeRecord.taxOnMdrRate || 0).toFixed(2),
                monthlyFee: parseFloat(completeRecord.monthlyFee || 0).toFixed(2),
                chargeBackFee1: parseFloat(completeRecord.chargeBackFee1 || 0).toFixed(2),
                chargeBackFee2: parseFloat(completeRecord.chargeBackFee2 || 0).toFixed(2),
                chargeBackFee3: parseFloat(completeRecord.chargeBackFee3 || 0).toFixed(2),
                predisputFee: parseFloat(completeRecord.predisputFee || 0).toFixed(2),
                refundFee: parseFloat(completeRecord.refundFee || 0).toFixed(2),
                specialMdrRate: parseFloat(completeRecord.specialMdrRate || 0).toFixed(2),
                specialMdrRangeAmount: parseFloat(completeRecord.specialMdrRangeAmount || 0).toFixed(2),
                specialMdrRangeAmountApply: parseFloat(completeRecord.specialMdrRangeAmountApply || 0).toFixed(2),
              };
              
              setCurrentPayinProcessingFee(editData);
              setModalIsOpen(true);
            } else {
              toast.error('Failed to load record details. Please try again.');
            }
          })
          .catch(error => {
            toast.dismiss(loadingToastId);
            toast.error('Error loading record: ' + (error.message || 'Unknown error'));
          });
      } else {
        // Handle case where terminal doesn't have an ID (shouldn't happen)
        toast.error('Cannot edit record: Missing ID');
      }
    } else {
      // For new records, just open the modal with default values
      setCurrentPayinProcessingFee({
        id: null,
        merid: 0,
        connectorId: '',
        connectorProcessingMode: null,
        mdrRate: 0.00,
        txnFeeAprroved: 0.00,
        txnFeeFailed: 0.00,
        taxOnMdrRate: 0.00,
        reserveRate: '',
        reserveDelay: '',
        monthlyFee: 0.00,
        chargeBackFee1: 0.00,
        chargeBackFee2: 0.00,
        chargeBackFee3: 0.00,
        predisputFee: 0.00,
        refundFee: 0.00,
        specialMdrRate: 0.00,
        specialMdrRangeAmount: 0.00,
        specialMdrRangeAmountApply: 0.00,
        settelementDelay: '',
      });
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    // Reset form state completely, ensuring ID is null for next operation
    setCurrentPayinProcessingFee({
      id: null,  // Explicitly set ID to null when closing modal
      merid: 0,
      connectorId: '',
      connectorProcessingMode: null,
      mdrRate: 0.00,
      txnFeeAprroved: 0.00,
      txnFeeFailed: 0.00,
      taxOnMdrRate: 0.00,
      reserveRate: '',
      reserveDelay: '',
      monthlyFee: 0.00,
      chargeBackFee1: 0.00,
      chargeBackFee2: 0.00,
      chargeBackFee3: 0.00,
      predisputFee: 0.00,
      refundFee: 0.00,
      specialMdrRate: 0.00,
      specialMdrRangeAmount: 0.00,
      specialMdrRangeAmountApply: 0.00,
      settelementDelay: '',
    });
  };

  const openViewModal = (terminal) => {
    if (terminal && terminal.id) {
      const loadingToastId = toast.info('Loading record details...', { autoClose: false });
      
      fetchCompleteRecordById(terminal.id)
        .then(completeRecord => {
          toast.dismiss(loadingToastId);
          
          if (completeRecord) {
            // Format and clean the data
            const displayData = {
              id: String(completeRecord.id || ''),
              merid: String(completeRecord.merid || ''),
              connectorId: String(completeRecord.connectorId || ''),
              connectorProcessingMode: getStatusDisplay(completeRecord.connectorProcessingMode || '').text,
              mdrRate: Number(completeRecord.mdrRate || 0).toFixed(2),
              txnFeeAprroved: Number(completeRecord.txnFeeAprroved || 0).toFixed(2),
              txnFeeFailed: Number(completeRecord.txnFeeFailed || 0).toFixed(2),
              taxOnMdrRate: Number(completeRecord.taxOnMdrRate || 0).toFixed(2),
              reserveRate: String(completeRecord.reserveRate || ''),
              reserveDelay: String(completeRecord.reserveDelay || ''),
              monthlyFee: Number(completeRecord.monthlyFee || 0).toFixed(2),
              chargeBackFee1: Number(completeRecord.chargeBackFee1 || 0).toFixed(2),
              chargeBackFee2: Number(completeRecord.chargeBackFee2 || 0).toFixed(2),
              chargeBackFee3: Number(completeRecord.chargeBackFee3 || 0).toFixed(2),
              predisputFee: Number(completeRecord.predisputFee || 0).toFixed(2),
              refundFee: Number(completeRecord.refundFee || 0).toFixed(2),
              specialMdrRate: Number(completeRecord.specialMdrRate || 0).toFixed(2),
              specialMdrRangeAmount: Number(completeRecord.specialMdrRangeAmount || 0).toFixed(2),
              specialMdrRangeAmountApply: Number(completeRecord.specialMdrRangeAmountApply || 0).toFixed(2),
              settelementDelay: String(completeRecord.settelementDelay || '')
            };
            
            setCurrentPayinProcessingFee(displayData);
            setViewModalIsOpen(true);
          } else {
            toast.error('Failed to load record details. Please try again.');
          }
        })
        .catch(error => {
          toast.dismiss(loadingToastId);
          toast.error('Error loading record: ' + (error.message || 'Unknown error'));
          console.error('Error loading record:', error);
        });
    } else {
      toast.error('Cannot view record: Missing ID');
    }
  };

  const closeViewModal = () => {
    setViewModalIsOpen(false);
    setCurrentPayinProcessingFee({
      merid: 0,
      connectorId: '',
      connectorProcessingMode: null,
      mdrRate: 0.00,
      txnFeeAprroved: 0.00,
      txnFeeFailed: 0.00,
      taxOnMdrRate: 0.00,
      reserveRate: '',
      reserveDelay: '',
      monthlyFee: 0.00,
      chargeBackFee1: 0.00,
      chargeBackFee2: 0.00,
      chargeBackFee3: 0.00,
      predisputFee: 0.00,
      refundFee: 0.00,
      specialMdrRate: 0.00,
      specialMdrRangeAmount: 0.00,
      specialMdrRangeAmountApply: 0.00,
      settelementDelay: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPayinProcessingFee(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Handle numeric fields
    if (name === 'mdrRate' || name === 'monthlyFee') {
      processedValue = value === '' ? '' : parseFloat(value);
    }
    
    setSearchCriteria(prev => ({ ...prev, [name]: processedValue }));
    
    // Trigger search on criteria change
    filterPayinProcessingFees();
  };

  const clearSearch = () => {
    setSearchCriteria({
      connectorProcessingMode: '',
      connectorId: '',
      merid: '',
      mdrRate: '',
      monthlyFee: ''
    });
    // Trigger search to reset results
    fetchPayinProcessingFees();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPayinProcessingFees();
  };

  const validateForm = (payload) => {
    if (!payload.connectorProcessingMode || !payload.merid || !payload.connectorId) {
      toast.error("Processing Mode, Merid and Connector Id are required");
      return false;
    }
  
    // Basic validation passed
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First, determine if we're editing by checking for an ID
      const recordId = currentPayinProcessingFee.id;
      const isEditing = recordId !== null && recordId !== undefined;
      
      console.group('FORM SUBMISSION');
      console.log('Record ID:', recordId);
      console.log('Is Editing:', isEditing);
      console.log('Current form state:', JSON.stringify(currentPayinProcessingFee, null, 2));
      
      // Validate form first
      if (!validateForm(currentPayinProcessingFee)) {
        console.groupEnd();
        return;
      }

      // CRITICAL: For updates, we need to handle them differently than creates
      if (isEditing) {
        // ===== UPDATE EXISTING RECORD =====
        console.log('UPDATING EXISTING RECORD with ID:', recordId);
        
        // Create a clean update payload with explicit type conversions
        const updatePayload = {
          id: recordId, // Force the ID to be included and put it first
          merid: Number(currentPayinProcessingFee.merid),
          connectorId: String(currentPayinProcessingFee.connectorId),
          connectorProcessingMode: String(currentPayinProcessingFee.connectorProcessingMode),
          mdrRate: Number(currentPayinProcessingFee.mdrRate || 0),
          txnFeeAprroved: Number(currentPayinProcessingFee.txnFeeAprroved || 0),
          txnFeeFailed: Number(currentPayinProcessingFee.txnFeeFailed || 0),
          taxOnMdrRate: Number(currentPayinProcessingFee.taxOnMdrRate || 0),
          reserveRate: String(currentPayinProcessingFee.reserveRate || ''),
          reserveDelay: String(currentPayinProcessingFee.reserveDelay || ''),
          monthlyFee: Number(currentPayinProcessingFee.monthlyFee || 0),
          chargeBackFee1: Number(currentPayinProcessingFee.chargeBackFee1 || 0),
          chargeBackFee2: Number(currentPayinProcessingFee.chargeBackFee2 || 0),
          chargeBackFee3: Number(currentPayinProcessingFee.chargeBackFee3 || 0),
          predisputFee: Number(currentPayinProcessingFee.predisputFee || 0),
          refundFee: Number(currentPayinProcessingFee.refundFee || 0),
          specialMdrRate: Number(currentPayinProcessingFee.specialMdrRate || 0),
          specialMdrRangeAmount: Number(currentPayinProcessingFee.specialMdrRangeAmount || 0),
          specialMdrRangeAmountApply: Number(currentPayinProcessingFee.specialMdrRangeAmountApply || 0),
          settelementDelay: String(currentPayinProcessingFee.settelementDelay || ''),
        };
        
        console.log('UPDATE PAYLOAD:', updatePayload);
        
        try {
          // First close the modal to prevent any UI issues during the update
          setModalIsOpen(false);
          
          // Reset form state to prevent any lingering data
          setCurrentPayinProcessingFee({
            id: null,
            merid: 0,
            connectorId: '',
            connectorProcessingMode: null,
            mdrRate: 0.00,
            txnFeeAprroved: 0.00,
            txnFeeFailed: 0.00,
            taxOnMdrRate: 0.00,
            reserveRate: '',
            reserveDelay: '',
            monthlyFee: 0.00,
            chargeBackFee1: 0.00,
            chargeBackFee2: 0.00,
            chargeBackFee3: 0.00,
            predisputFee: 0.00,
            refundFee: 0.00,
            specialMdrRate: 0.00,
            specialMdrRangeAmount: 0.00,
            specialMdrRangeAmountApply: 0.00,
            settelementDelay: '',
          });
          
          // Show a loading toast
          const loadingToastId = toast.info('Updating record...', { autoClose: false });
          
          // Use the specific update endpoint directly instead of the create endpoint
          const updateUrl = `/api/payin-processing-fee/update/${recordId}`;
          console.log('Making direct PUT request to:', updateUrl);
          
          // Make the update request with the ID in both the URL and payload
          const updateResponse = await axiosInstance.put(updateUrl, updatePayload);
          
          // Close the loading toast
          toast.dismiss(loadingToastId);
          
          // Dismiss any permission error toasts that might be showing
          dismissPermissionErrors();
          
          if (updateResponse?.data) {
            toast.success(`Successfully updated fee #${recordId}`);
            
            // Wait a moment before fetching data to ensure the backend has processed the update
            setTimeout(async () => {
              console.log('Fetching updated data after update...');
              await fetchPayinProcessingFees();
              
              // Dismiss any permission errors that might have appeared during refresh
              setTimeout(() => dismissPermissionErrors(), 500);
            }, 2000);
          } else {
            toast.error('Update failed: No response from server');
            // Refresh data anyway
            await fetchPayinProcessingFees();
          }
        } catch (error) {
          console.error('Update operation failed:', error);
          
          // Show a more detailed error message
          if (error.message && error.message.includes('Network Error')) {
            toast.error('Network error: Please check your connection and try again');
          } else if (error.response?.status === 404) {
            toast.error('Update failed: API endpoint not found. Please contact support.');
          } else {
            toast.error(`Update failed: ${error.message}`);
          }
          
          // Fetch data anyway to ensure UI is in sync with backend
          await fetchPayinProcessingFees();
        }
      } else {
        // ===== CREATE NEW RECORD =====
        console.log('CREATING NEW RECORD');
        
        // For new records, explicitly remove any ID field
        const { id, ...createPayload } = currentPayinProcessingFee;
        
        // Ensure ID is null for new records
        createPayload.id = null;
        
        console.log('CREATE PAYLOAD:', createPayload);
        
        // Check for duplicates only when creating new records
        const payloadMerid = Number(createPayload.merid);
        const payloadConnectorId = String(createPayload.connectorId);
        
        const isDuplicate = payinProcessingFee.some(fee => 
          Number(fee.merid) === payloadMerid && 
          String(fee.connectorId) === payloadConnectorId
        );
        
        if (isDuplicate) {
          toast.error(`Cannot create: A record already exists for Merchant ID ${payloadMerid} and Connector ID ${payloadConnectorId}`);
          console.groupEnd();
          return;
        }
        
        try {
          // Make the create request
          const createUrl = '/api/payin-processing-fee/create';
          console.log('Making POST request to:', createUrl);
          
          const createResponse = await axiosInstance.post(createUrl, createPayload);
          console.log('CREATE RESPONSE:', createResponse);
          
          if (createResponse?.data) {
            toast.success('Successfully created new fee');
            
            // Close modal and reset form state BEFORE fetching data
            setModalIsOpen(false);
            setCurrentPayinProcessingFee({
              id: null,
              merid: 0,
              connectorId: '',
              connectorProcessingMode: null,
              mdrRate: 0.00,
              txnFeeAprroved: 0.00,
              txnFeeFailed: 0.00,
              taxOnMdrRate: 0.00,
              reserveRate: '',
              reserveDelay: '',
              monthlyFee: 0.00,
              chargeBackFee1: 0.00,
              chargeBackFee2: 0.00,
              chargeBackFee3: 0.00,
              predisputFee: 0.00,
              refundFee: 0.00,
              specialMdrRate: 0.00,
              specialMdrRangeAmount: 0.00,
              specialMdrRangeAmountApply: 0.00,
              settelementDelay: '',
            });
            
            // Fetch data after modal is closed
            await fetchPayinProcessingFees();
          } else {
            toast.error('Create failed: No response from server');
          }
        } catch (createError) {
          console.error('Create operation failed:', createError);
          toast.error(`Create failed: ${createError.message}`);
        }
      }
    } catch (error) {
      console.error('Operation failed:', error);
      
      if (error.response?.status === 403) {
        handlePermissionError();
      } else if (error.response?.status === 409) {
        toast.error('Cannot proceed: A record with the same Merchant ID and Connector ID combination already exists');
      } else {
        const errorMsg = error.response?.data?.message || error.message;
        toast.error(`Operation failed: ${errorMsg}`);
      }
    } finally {
      console.groupEnd();
    }
  };
  

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${text}\n${label} key copied to clipboard!`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${label} key`);
      });
  };

  const getStatusDisplay = (status) => {
    const statusConfig = {
      '1': { text: 'Approved', color: '#28a745' },     // Green
      '3': { text: 'Rejected', color: '#dc3545' },     // Red
      '4': { text: 'Under review', color: '#ffc107' }, // Yellow
      '5': { text: 'Awaiting PayinProcessingFee', color: '#17a2b8' }, // Cyan
      '6': { text: 'Terminated', color: '#6c757d' }    // Gray
    };
    return statusConfig[status] || { text: 'Unknown', color: '#6c757d' };
  };

  const renderActionButtons = (terminal) => {
    // Ensure terminal has a valid ID before rendering edit/delete buttons
    const hasValidId = terminal && terminal.id !== null && terminal.id !== undefined;
    
    console.log('Rendering action buttons for terminal:', terminal.id);
    
    return (
      <>
        <button
          className="btn btn-sm btn-success me-2"
          onClick={() => openViewModal(terminal)}
          title="View"
        >
          <FaEye />
        </button>
        <button
          className="btn btn-sm btn-info me-2"
          onClick={() => {
            // Ensure we're passing the complete terminal object with ID
            console.log('Edit button clicked for terminal ID:', terminal.id);
            openModal({...terminal, id: terminal.id});
          }}
          title="Edit"
          disabled={!hasValidId}
        >
          <FaEdit />
        </button>
        <button
          className="btn btn-sm btn-danger"
          title="Delete"
          disabled={!hasValidId}
        >
          <FaTrash />
        </button>
      </>
    );
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getSortedData = () => {
    // Make a deep copy of the filtered data to avoid modifying the original
    return filteredPayinProcessingFees.map(item => ({...item}))
      .sort((a, b) => b.id - a.id);
  };

  const totalPages = Math.ceil(getSortedData().length / itemsPerPage);
  
  // Get current posts
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedData().slice(indexOfFirstItem, indexOfLastItem);

  const handleExport = async (format, data, filename) => {
    setIsExporting(true);
    try {
      const payload = {
        connectorId: currentPayinProcessingFee.connectorId,
        mdrRate: currentPayinProcessingFee.mdrRate,
        txnFeeAprroved: currentPayinProcessingFee.txnFeeAprroved,
        txnFeeFailed: currentPayinProcessingFee.txnFeeFailed,
        taxOnMdrRate: currentPayinProcessingFee.taxOnMdrRate,
        reserveRate: currentPayinProcessingFee.reserveRate,
        reserveDelay: currentPayinProcessingFee.reserveDelay,
        monthlyFee: currentPayinProcessingFee.monthlyFee,
        chargeBackFee1: currentPayinProcessingFee.chargeBackFee1,
        chargeBackFee2: currentPayinProcessingFee.chargeBackFee2,
        chargeBackFee3: currentPayinProcessingFee.chargeBackFee3,
        predisputFee: currentPayinProcessingFee.predisputFee,
        refundFee: currentPayinProcessingFee.refundFee,
        specialMdrRate: currentPayinProcessingFee.specialMdrRate,
        specialMdrRangeAmount: currentPayinProcessingFee.specialMdrRangeAmount,
        specialMdrRangeAmountApply: currentPayinProcessingFee.specialMdrRangeAmountApply,
        settelementDelay: currentPayinProcessingFee.settelementDelay
      };

      let content, type, extension;
      
      if (format === 'csv') {
        // Convert data to CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(','));
        content = [headers, ...rows].join('\n');
        type = 'text/csv';
        extension = 'csv';
      } else {
        // Convert data to JSON
        content = JSON.stringify(data, null, 2);
        type = 'application/json';
        extension = 'json';
      }

      // Create and trigger download
      const blob = new Blob([content], { type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Export to ${format.toUpperCase()} completed successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const ViewModalContent = ({ data }) => {
    // Helper function to format label
    const formatLabel = (key) => {
      return key.replace(/([A-Z])/g, ' $1').trim();
    };
  
    // Helper function to format value
    const formatValue = (key, value) => {
      if (value === null || value === undefined) return 'N/A';
      
      if (key === 'connectorProcessingMode') {
        return getStatusDisplay(value).text;
      }
      
      // Format numeric values
      if (typeof value === 'number') {
        return Number(value).toFixed(2);
      }
      
      return String(value);
    };
  
    return (
      <div className="row fs-6 gx-2">
        {Object.entries(data)
          .filter(([key]) => key !== 'id' && data[key] != null)
          .map(([key, value]) => (
            <div key={key} className="col-md-6 mb-3">
              <label className="fw-bold text-capitalize">
                {formatLabel(key)}:
              </label>
              <div className="rounded p-2 bg-light">
                {formatValue(key, value)}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="container mt-2">
      {isOffline && (
        <div className="alert alert-warning" role="alert">
          You are currently offline. Some features may be unavailable.
        </div>
      )}
      <div className="container-fluid card pt-4">
        {/* Search, filters, add, edit, and export buttons */}
        <div className="row ">
          <h4>Payin Processing Fee Terminal Wise</h4>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mb-0">
            <div className="row g-3">
              <div className="col-md-2">
                <select
                  name="connectorProcessingMode"
                  className="form-select"
                  value={searchCriteria.connectorProcessingMode}
                  onChange={handleSearch}
                >
                  <option value="">Connector Processing Mode</option>
                  <option value="1">Approved</option>
                  <option value="3">Rejected</option>
                  <option value="4">Under review</option>
                  <option value="5">Awaiting</option>
                  <option value="6">Terminated</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  name="merid"
                  value={searchCriteria.merid}
                  onChange={handleSearch}
                >
                  <option value="">All Customers</option>
                  {Array.isArray(customers) && customers.length > 0 ? (
                    customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        [{customer.id}] {customer.userName}{customer.name ? ` | ${customer.name}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading customers...</option>
                  )}
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  name="connectorId"
                  value={searchCriteria.connectorId}
                  onChange={handleSearch}
                >
                  <option value="">Select Connector</option>
                  {Array.isArray(connectors) && connectors.map(connector => (
                    <option key={connector.connectorNumber} value={connector.connectorNumber}>
                      [{connector.connectorNumber}] {connector.connectorName || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="MDR Rate"
                  name="mdrRate"
                  value={searchCriteria.mdrRate}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Monthly Fee"
                  name="monthlyFee"
                  value={searchCriteria.monthlyFee}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary py-2 mb-2"><CiSearch /></button>
                <button
                  type="button"
                  className="btn btn-outline-secondary ms-2 py-2 mb-2"
                  onClick={clearSearch}
                >X</button>
              </div>
              <div className="col col-md-2 float-end">
                    <div className="d-flex float-end">
                        <button className="btn btn-primary me-2" onClick={() => openModal()}>Add Fee</button>

                            {/* Export CSV and Json as per current and all list */}
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
                                    'Export'
                                    )}
                                </button>
                                <ul className="dropdown-menu">
                                    <li><h6 className="dropdown-header">Current Page</h6></li>
                                    <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => handleExport('csv', currentItems, `terminal_page_${currentPage}`)}
                                        disabled={isExporting}
                                    >
                                        Export as CSV
                                    </button>
                                    </li>
                                    <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => handleExport('json', currentItems, `payinprocessingfeeterminawWise_page_${currentPage}`)}
                                        disabled={isExporting}
                                    >
                                        Export as JSON
                                    </button>
                                    </li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><h6 className="dropdown-header">All Data</h6></li>
                                    <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => handleExport('csv', getSortedData(), 'all_payinprocessingfeeterminawWise')}
                                        disabled={isExporting}
                                    >
                                        Export as CSV
                                    </button>
                                    </li>
                                    <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => handleExport('json', getSortedData(), 'all_payinprocessingfeeterminawWise')}
                                        disabled={isExporting}
                                    >
                                        Export as JSON
                                    </button>
                                    </li>
                                </ul>
                                </div>
                    </div>
              </div>
            </div>
          </form>

          
          {loading ? (
            <div>Loading payinProcessingFee...</div>
          ) : filteredPayinProcessingFees.length === 0 ? (
            <div>No payinProcessingFee found</div>
          ) : (
            <>
              <div className="row mb-3 align-items-center pe-0 me-0 pb-0 mb-0">
                <div className="col-md-6">
                  <small className="text-muted">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayinProcessingFees.length)} of {filteredPayinProcessingFees.length} entries
                  </small>
                </div>
                <div className="col-md-6 text-end pe-0 me-0">
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
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-bordered border-color bg-color custom-bg-text">
                    <tr>
                      <th>FeeID</th>
                      <th>Merid</th>
                      <th>Connector Id</th>
                     
                      <th>Status</th>
                      
                      <th>MDR Rate</th>
                      <th>Monthly Fee</th>
                      <th>Refund Fee</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((terminal) => (
                      <tr key={terminal.id}>
                        <td>{terminal.id}</td>
                        <td>{terminal.merid}</td>
                        <td>{terminal.connectorId}</td>
                        <td>
                          <span style={{ 
                            color: getStatusDisplay(terminal.connectorProcessingMode).color,
                            fontWeight: 'bold'
                          }}>
                            {getStatusDisplay(terminal.connectorProcessingMode).text}
                          </span>
                        </td>
                        <td>{terminal.mdrRate}</td>
                        <td>{terminal.monthlyFee}</td>
                        <td>{terminal.refundFee}</td>
                        <td>
                          {renderActionButtons(terminal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Enhanced Pagination with Go to Page */}
          {getSortedData().length > 0 && (
            <div className="row d-flex  align-items-center mt-2 mb-4 text-end">
              
              <nav className="d-flex justify-content-end align-items-center " aria-label="Connector list pagination">
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
                          className={`page-item ${currentPage === i + 1 ? 'connectorProcessingMode' : ''}`}
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

          {/* Add & Edit Modal */}
          <Modal 
            isOpen={modalIsOpen} 
            onRequestClose={closeModal}
            className="modal-dialog modal-xl"
            overlayClassName="modal-backdrop"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // zIndex: 1050
              },
              content: {
                position: 'relative',
                // top: '50%',
                // left: '50%',
                // transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                width: '90%',
                border: 'none',
                background: '#fff',
                borderRadius: '6px',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            <div className="modal-content border rounded">
              <div className="modal-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                      <h5 className="modal-title p-3">
                          {currentPayinProcessingFee?.id
                              ? (
                                  <>
                                      Edit Payin Processing Fee Terminal Wise :: terNO: <span style={{ color: '#dd00b0' }}><strong>{currentPayinProcessingFee.id}</strong></span> |
                                      merid: <span style={{ color: 'green' }}><strong>{currentPayinProcessingFee.merid}</strong></span>
                                      
                                  </>
                              )
                              : "Add Payin Processing Fee Terminal Wise"}
                      </h5>
                <button type="button" className="btn-close me-2" onClick={closeModal}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto', padding: '20px' }}>
                <form id="terminal-form" onSubmit={handleSubmit} className="row fs-6 gx-2">
                <div className="col-md-6">
                      <label className="form-label">Connector Processing Mode</label>
                      <select
                          className="form-select py-2"
                          id="connectorProcessingMode"
                          name="connectorProcessingMode"
                          value={currentPayinProcessingFee.connectorProcessingMode} 
                          onChange={handleInputChange}
                      >
                          <option value="">Connector Processing Mode</option>
                          <option value="1">Approved</option>
                          <option value="3">Rejected</option>
                          <option value="4">Under review</option>
                          <option value="5">Awaiting </option>
                          <option value="6">Terminated</option>
                      </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Connector Id</label>
                    <select 
                      className="form-select"
                      name="connectorId" 
                      value={currentPayinProcessingFee.connectorId} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select Connector</option>
                      {Array.isArray(connectors) && connectors.map(connector => (
                        <option key={connector.connectorNumber} value={connector.connectorNumber}>
                          [{connector.connectorNumber}] {connector.connectorName || 'N/A'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Merid:</label>
                    <select 
                      className="form-select"
                      name="merid" 
                      value={currentPayinProcessingFee.merid} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select MerID</option>
                      {Array.isArray(customers) && customers.length > 0 ? (
                        customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            [{customer.id}] {customer.userName}{customer.name ? ` | ${customer.name}` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading customers...</option>
                      )}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mdr Rate:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="mdrRate" 
                      value={currentPayinProcessingFee.mdrRate} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Monthly Fee:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="monthlyFee" 
                      value={currentPayinProcessingFee.monthlyFee} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Transaction Fee Approved:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="txnFeeAprroved" 
                      value={currentPayinProcessingFee.txnFeeAprroved} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Transaction Fee Failed:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="txnFeeFailed" 
                      value={currentPayinProcessingFee.txnFeeFailed} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tax on MDR Rate:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="taxOnMdrRate" 
                      value={currentPayinProcessingFee.taxOnMdrRate} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Reserve Rate:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="reserveRate" 
                      value={currentPayinProcessingFee.reserveRate} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Reserve Delay:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="reserveDelay" 
                      value={currentPayinProcessingFee.reserveDelay} 
                      onChange={handleInputChange} 
                    />
                  </div>

                 

                  <div className="col-md-6">
                    <label className="form-label">Chargeback Fee 1:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="chargeBackFee1" 
                      value={currentPayinProcessingFee.chargeBackFee1} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Chargeback Fee 2:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="chargeBackFee2" 
                      value={currentPayinProcessingFee.chargeBackFee2} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Chargeback Fee 3:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="chargeBackFee3" 
                      value={currentPayinProcessingFee.chargeBackFee3} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Pre-Dispute Fee:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="predisputFee" 
                      value={currentPayinProcessingFee.predisputFee} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Refund Fee:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="refundFee" 
                      value={currentPayinProcessingFee.refundFee} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Special MDR Rate:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="specialMdrRate" 
                      value={currentPayinProcessingFee.specialMdrRate} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Special MDR Range Amount:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="specialMdrRangeAmount" 
                      value={currentPayinProcessingFee.specialMdrRangeAmount} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Special MDR Range Amount Apply:</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-control"
                      name="specialMdrRangeAmountApply" 
                      value={currentPayinProcessingFee.specialMdrRangeAmountApply} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="col-md-6 pt-3">
                    <label className="form-label">Settlement Delay:</label>
                    <input 
                      type="text" 
                      className="form-control"
                      name="settelementDelay" 
                      value={currentPayinProcessingFee.settelementDelay} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="modal-footer p-2" style={{ backgroundColor: 'white', zIndex: 1 }}>
                    <button type="submit" className="btn btn-primary me-2" form="terminal-form">
                      {currentPayinProcessingFee?.id ? "Update" : "Add"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Modal>

          {/* View Modal */}
          <Modal 
            isOpen={viewModalIsOpen} 
            onRequestClose={closeViewModal}
            className="modal-dialog modal-xl"
            overlayClassName="modal-backdrop"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050
              },
              content: {
                position: 'relative',
                // top: '50%',
                // left: '50%',
                // transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                width: '90%',
                border: 'none',
                background: '#fff',
                borderRadius: '6px',
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }
            }}
          >
            <div className="modal-content border rounded">
              <div className="modal-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid #ccc', zIndex: 1 }}>
                <h5 className="modal-title p-3">
                          {currentPayinProcessingFee?.id
                              ? (
                                  <>
                                      View Payin Processing Fee: FeeID: <span style={{ color: '#dd00b0' }}><strong>{currentPayinProcessingFee.id}</strong></span> |
                                      Merchant ID: <span style={{ color: 'green' }}><strong>{currentPayinProcessingFee.merid}</strong></span>
                                  </>
                              )
                              : "View Payin Processing Fee Terminal Wise Details"}
                      </h5>
                <button type="button" className="btn-close me-2" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto', padding: '20px' }}>
                <ViewModalContent data={currentPayinProcessingFee} />
              </div>
              <div className="modal-footer p-2" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1 }}>
                <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                  Close
                </button>
              </div>
            </div>
          </Modal>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default PayinProcessingFee;
