import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import axiosInstance from '../utils/axiosConfig';
import { FaEdit, FaEye, FaSync, FaCopy } from 'react-icons/fa';

const Terminal = () => {
  const [showMerid, setShowMerid] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("active-customer"));
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [currentTerminal, setCurrentTerminal] = useState({
    publicKey: '',
    merid: user.id,
    connectorids: '',
    bussinessUrl: '',
    terminalType: '',
    active: '',
    businessDescription: '',
    businessNature: '',
    tarnsAlertEmail: '',
    merTransAlertEmail: '',
    dbaBrandName: '',
    customerServiceNo: '',
    customerServiceEmail: '',
    merchantTermConditionUrl: '',
    merchantRefundPolicyUrl: '',
    merchantPrivacyPolicyUrl: '',
    merchantContactUsUrl: '',
    merchantLogoUrl: '',
    curlingAccessKey: '',
    ternoJsonValue: '',
    selectTemplates: '',
    selectTemplatesLog: '',
    deletedBussinessUrl: '',
    checkoutTheme: '',
    selectMcc: '',
    webhookUrl: '',
    returnUrl: '',
    terName: '',  // Add terName
    privateKey: '',    // Add privateKey
  });
  const [searchCriteria, setSearchCriteria] = useState({
    active: '',
    public_key: '',
    merid: '',
    bussiness_url: '',
    ter_name: '',
    dba_brand_name: '',
    connectorids: ''
  });
  const [filteredTerminals, setFilteredTerminals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [processingFeeOptions, setProcessingFeeOptions] = useState([]);
  const [selectedProcessingFees, setSelectedProcessingFees] = useState([]);
  const [optionJsonValues, setOptionJsonValues] = useState({});
  const [confirmationOption, setConfirmationOption] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [visibleJsonItems, setVisibleJsonItems] = useState([]);
  const [selectedTarnsAlertEmails, setSelectedTarnsAlertEmails] = useState([]);
  


  // Add function to fetch processing fee options when merid changes
  const fetchProcessingFeeOptions = async (merid) => {
    if (!merid) {
      setProcessingFeeOptions([]);
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/api/payin-processing-fee/dropdown/list/${merid}`);
      console.log('Processing Fee Options response:', response.data);
      if (response.data) {
        // Process the options to ensure they have the correct format
        const processedOptions = response.data.map(option => {
          // If the option already has a properly formatted label, use it
          // Otherwise, format it according to requirements
          if (!option.terJsonDataValue) {
            let jsonData = {};
            
            // First try to use ecommerceCruisesJson if available
            if (option.ecommerceCruisesJson) {
              try {
                if (typeof option.ecommerceCruisesJson === 'string') {
                  jsonData = JSON.parse(option.ecommerceCruisesJson);
                } else {
                  jsonData = option.ecommerceCruisesJson;
                }
              } catch (e) {
                console.error("Error parsing ecommerceCruisesJson:", e);
              }
            } 
            // Fallback to extracting from label if ecommerceCruisesJson is not available
            else if (option.label) {
              try {
                const labelMatch = option.label.match(/\{.*\}/);
                if (labelMatch) {
                  jsonData = JSON.parse(labelMatch[0]);
                }
              } catch (e) {
                console.error("Error parsing JSON from label:", e);
              }
            }
            
            // Create a formatted label with ID, connector ID, and JSON data
            option.terJsonDataValue = `${JSON.stringify(jsonData)}`;
            
            // Store the parsed JSON data for later use
            option.parsedJsonData = jsonData;
          }
          return option;
        });
        
        setProcessingFeeOptions(processedOptions);
        
        // If editing a terminal with existing values, set the selected options and their JSON values
        if (currentTerminal.ternoJsonValue) {
          try {
            const parsedValue = JSON.parse(currentTerminal.ternoJsonValue);
            // Extract the fee IDs from the complex JSON structure
            const selectedIds = [];
            const jsonValues = {};
            
            Object.keys(parsedValue).forEach(key => {
              if (parsedValue[key] && parsedValue[key].feeId) {
                const feeId = parsedValue[key].feeId;
                selectedIds.push(feeId);
                
                // Store the JSON value for this option
                if (parsedValue[key].connectorkey) {
                  jsonValues[feeId] = JSON.stringify(parsedValue[key].connectorkey);
                }
              }
            });
            
            setSelectedProcessingFees(selectedIds);
            setOptionJsonValues(jsonValues);
          } catch (e) {
            console.error("Error parsing ternoJsonValue:", e);
            setSelectedProcessingFees([]);
            setOptionJsonValues({});
          }
        }
      } else {
        setProcessingFeeOptions([]);
      }
    } catch (error) {
      console.error("Error fetching processing fee options:", error);
      toast.error('Failed to load processing fee options');
      setProcessingFeeOptions([]);
    }
  };

  // Add handler for transaction alert email checkboxes
  const handleTarnsAlertEmailChange = (value) => {
    setSelectedTarnsAlertEmails(prev => {
      const newSelected = prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value];
      setCurrentTerminal(prevTerminal => ({
        ...prevTerminal,
        tarnsAlertEmail: newSelected.join(',')
      }));
      return newSelected;
    });
  };


  // Update merid change handler to fetch processing fee options
  useEffect(() => {
    if (user.id) {
      fetchProcessingFeeOptions(user.id);
    }
  }, [user.id]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const qc = queryParams.get('qc');
    setShowMerid(qc === '1');
    fetchTerminals();
  }, []);

  useEffect(() => {
    filterTerminals();
  }, [terminals, searchCriteria]);

    useEffect(() => {
      if (modalIsOpen && currentTerminal.tarnsAlertEmail) {
        setSelectedTarnsAlertEmails(currentTerminal.tarnsAlertEmail.split(','));
      } else {
        setSelectedTarnsAlertEmails([]);
      }
    }, [modalIsOpen, currentTerminal.tarnsAlertEmail]);
  

  const fetchTerminals = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("customer-jwtToken");
      
      if (!token) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.replace("/login");  // Use replace instead of href
        }, 2000);
        return;
      }

      // Build search parameters
      const searchParams = {
        active: searchCriteria.active || '',
        publicKey: searchCriteria.public_key || '',
        businessUrl: searchCriteria.bussiness_url || '',
        terName: searchCriteria.ter_name || '',
        dbaBrandName: searchCriteria.dba_brand_name || '',
        connectorids: searchCriteria.connectorids || ''
      };

      // Convert to URLSearchParams
      const params = new URLSearchParams(
        Object.entries(searchParams).filter(([_, value]) => value !== '')
      ).toString();

      const response = await axiosInstance.get(`/api/terminals/search/merid/${user.id}${params ? '?' + params : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setTerminals(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.replace("/login"); // Use replace instead of href
        }, 2000);
      } else {
        toast.error('Failed to load terminals');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterTerminals = () => {
    let filtered = [...terminals];
    
    if (searchCriteria.active) {
      filtered = filtered.filter(terminal => 
        String(terminal.active) === searchCriteria.active
      );
    }
    if (searchCriteria.public_key) {
      filtered = filtered.filter(terminal => 
        String(terminal.publicKey || '').toLowerCase().includes(searchCriteria.public_key.toLowerCase())
      );
    }
    if (searchCriteria.merid) {
      filtered = filtered.filter(terminal => 
        String(terminal.merid || '').toLowerCase().includes(searchCriteria.merid.toLowerCase())
      );
    }
    if (searchCriteria.bussiness_url) {
      filtered = filtered.filter(terminal => 
        String(terminal.bussinessUrl || '').toLowerCase().includes(searchCriteria.bussiness_url.toLowerCase())
      );
    }
    if (searchCriteria.ter_name) {
      filtered = filtered.filter(terminal => 
        String(terminal.terName || '').toLowerCase().includes(searchCriteria.ter_name.toLowerCase())
      );
    }
    if (searchCriteria.dba_brand_name) {
      filtered = filtered.filter(terminal => 
        String(terminal.dbaBrandName || '').toLowerCase().includes(searchCriteria.dba_brand_name.toLowerCase())
      );
    }
    if (searchCriteria.connectorids) {
      filtered = filtered.filter(terminal => 
        String(terminal.connectorids || '').toLowerCase().includes(searchCriteria.connectorids.toLowerCase())
      );
    }
    
    setFilteredTerminals(filtered);
  };

  const openModal = (terminal = null) => {
    if (terminal) {
      // Ensure all required fields are included when editing
      setCurrentTerminal({
        id: terminal.id,
        publicKey: terminal.publicKey || '',
        merid: user.id || '',
        connectorids: terminal.connectorids || '',
        bussinessUrl: terminal.bussinessUrl || '',
        terminalType: terminal.terminalType || '',
        active: terminal.active || '',
        businessDescription: terminal.businessDescription || '',
        businessNature: terminal.businessNature || '',
        tarnsAlertEmail: terminal.tarnsAlertEmail || '',
        merTransAlertEmail: terminal.merTransAlertEmail || '',
        dbaBrandName: terminal.dbaBrandName || '',
        customerServiceNo: terminal.customerServiceNo || '',
        customerServiceEmail: terminal.customerServiceEmail || '',
        merchantTermConditionUrl: terminal.merchantTermConditionUrl || '',
        merchantRefundPolicyUrl: terminal.merchantRefundPolicyUrl || '',
        merchantPrivacyPolicyUrl: terminal.merchantPrivacyPolicyUrl || '',
        merchantContactUsUrl: terminal.merchantContactUsUrl || '',
        merchantLogoUrl: terminal.merchantLogoUrl || '',
        curlingAccessKey: terminal.curlingAccessKey || '',
        ternoJsonValue: terminal.ternoJsonValue || '',
        selectTemplates: terminal.selectTemplates || '',
        selectTemplatesLog: terminal.selectTemplatesLog || '',
        deletedBussinessUrl: terminal.deletedBussinessUrl || '',
        checkoutTheme: terminal.checkoutTheme || '',
        selectMcc: terminal.selectMcc || '',
        webhookUrl: terminal.webhookUrl || '',
        returnUrl: terminal.returnUrl || '',
        terName: terminal.terName || '',
        privateKey: terminal.privateKey || '',
      });
      
      // Parse and set selected processing fees if ternoJsonValue exists
      if (terminal.ternoJsonValue) {
        try {
          const parsedValue = JSON.parse(terminal.ternoJsonValue);
          // Extract the fee IDs from the complex JSON structure
          const selectedIds = [];
          const jsonValues = {};
          
          Object.keys(parsedValue).forEach(key => {
            if (parsedValue[key] && parsedValue[key].feeId) {
              const feeId = parsedValue[key].feeId;
              selectedIds.push(feeId);
              
              // Store the JSON value for this option
              if (parsedValue[key].connectorkey) {
                jsonValues[feeId] = JSON.stringify(parsedValue[key].connectorkey);
              }
            }
          });
          
          setSelectedProcessingFees(selectedIds);
          setOptionJsonValues(jsonValues);
        } catch (e) {
          console.error("Error parsing ternoJsonValue:", e);
          setSelectedProcessingFees([]);
          setOptionJsonValues({});
        }
      } else {
        setSelectedProcessingFees([]);
        setOptionJsonValues({});
      }
      
      // Fetch processing fee options if merid exists
      if (terminal.merid) {
        fetchProcessingFeeOptions(terminal.merid);
      }
    } else {
      setCurrentTerminal({
        publicKey: '',
        merid: user.id,
        connectorids: '',
        bussinessUrl: '',
        terminalType: '',
        active: '',
        businessDescription: '',
        businessNature: '',
        tarnsAlertEmail: '',
        merTransAlertEmail: '',
        dbaBrandName: '',
        customerServiceNo: '',
        customerServiceEmail: '',
        merchantTermConditionUrl: '',
        merchantRefundPolicyUrl: '',
        merchantPrivacyPolicyUrl: '',
        merchantContactUsUrl: '',
        merchantLogoUrl: '',
        curlingAccessKey: '',
        ternoJsonValue: '',
        selectTemplates: '',
        selectTemplatesLog: '',
        deletedBussinessUrl: '',
        checkoutTheme: '',
        selectMcc: '',
        webhookUrl: '',
        returnUrl: '',
        terName: '',
        privateKey: '',
      });
      setSelectedProcessingFees([]);
      setProcessingFeeOptions([]);
      setOptionJsonValues({});
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentTerminal({
      publicKey: '',
      merid: '',
      connectorids: '',
      bussinessUrl: '',
      terminalType: '',
      active: '',
      businessDescription: '',
      businessNature: '',
      tarnsAlertEmail: '',
      merTransAlertEmail: '',
      dbaBrandName: '',
      customerServiceNo: '',
      customerServiceEmail: '',
      merchantTermConditionUrl: '',
      merchantRefundPolicyUrl: '',
      merchantPrivacyPolicyUrl: '',
      merchantContactUsUrl: '',
      merchantLogoUrl: '',
      curlingAccessKey: '',
      ternoJsonValue: '',
      selectTemplates: '',
      selectTemplatesLog: '',
      deletedBussinessUrl: '',
      checkoutTheme: '',
      selectMcc: '',
      webhookUrl: '',
      returnUrl: '',
      terName: '',
      privateKey: '',
    });
    setSelectedProcessingFees([]);
    setProcessingFeeOptions([]);
    setOptionJsonValues({});
  };

  const openViewModal = (terminal) => {
    setCurrentTerminal({
      ...terminal,
      active: terminal.active === 1
    });
    setViewModalIsOpen(true);
  };

  const closeViewModal = () => {
    setViewModalIsOpen(false);
    setCurrentTerminal({
      publicKey: '',
      merid: '',
      connectorids: '',
      bussinessUrl: '',
      terminalType: '',
      active: '',
      businessDescription: '',
      businessNature: '',
      tarnsAlertEmail: '',
      merTransAlertEmail: '',
      dbaBrandName: '',
      customerServiceNo: '',
      customerServiceEmail: '',
      merchantTermConditionUrl: '',
      merchantRefundPolicyUrl: '',
      merchantPrivacyPolicyUrl: '',
      merchantContactUsUrl: '',
      merchantLogoUrl: '',
      curlingAccessKey: '',
      ternoJsonValue: '',
      selectTemplates: '',
      selectTemplatesLog: '',
      deletedBussinessUrl: '',
      checkoutTheme: '',
      selectMcc: '',
      webhookUrl: '',
      returnUrl: '',
      terName: '',
      privateKey: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentTerminal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add handler for processing fee checkbox changes with confirmation
  const handleProcessingFeeCheckboxChange = (option) => {
    // Store the option for confirmation and show the confirmation dialog
    setConfirmationOption(option);
    setShowConfirmation(true);
  };

  // Actual processing fee change handler (after confirmation)
  const handleProcessingFeeChange = (option) => {
    setSelectedProcessingFees(prev => {
      const optionId = option.id.toString();
      const newSelected = prev.includes(optionId)
        ? prev.filter(item => item !== optionId)
        : [...prev, optionId];
      
      // Update ternoJsonValue in currentTerminal with the complex structure
      let jsonValue = {};
      
      // If there's existing JSON, try to parse it
      if (currentTerminal.ternoJsonValue) {
        try {
          jsonValue = JSON.parse(currentTerminal.ternoJsonValue);
        } catch (e) {
          console.error("Error parsing existing ternoJsonValue:", e);
          jsonValue = {};
        }
      }
      
      // For each selected option, add or remove the corresponding entry
      if (prev.includes(optionId)) {
        // Remove this option from the JSON
        Object.keys(jsonValue).forEach(key => {
          if (jsonValue[key] && jsonValue[key].feeId === optionId) {
            delete jsonValue[key];
          }
        });
        
        // Also remove from optionJsonValues
        setOptionJsonValues(prev => {
          const newValues = { ...prev };
          delete newValues[optionId];
          return newValues;
        });
      } else {
        // Add this option to the JSON with its connector key
        // Use the connector ID as the key in the JSON
        const connectorId = option.connectorId ? option.connectorId.toString() : option.id.toString();
        
        // Get the connector key data - prioritize ecommerceCruisesJson if available
        let connectorKeyData = {};
        
        if (option.parsedJsonData) {
          // Use the already parsed JSON data from the option
          connectorKeyData = option.parsedJsonData;
        } else if (option.ecommerceCruisesJson) {
          try {
            if (typeof option.ecommerceCruisesJson === 'string') {
              connectorKeyData = JSON.parse(option.ecommerceCruisesJson);
            } else {
              connectorKeyData = option.ecommerceCruisesJson;
            }
          } catch (e) {
            console.error("Error parsing ecommerceCruisesJson:", e);
          }
        } else {
          // Fallback to extracting from label
          try {
            if (option.label) {
              const labelMatch = option.label.match(/\{.*\}/);
              if (labelMatch) {
                connectorKeyData = JSON.parse(labelMatch[0]);
              }
            }
          } catch (e) {
            console.error("Error parsing connector key data from label:", e);
          }
        }
        
        jsonValue[connectorId] = {
          connectorkey: connectorKeyData,
          feeId: optionId
        };
        
        // Also store in optionJsonValues
        setOptionJsonValues(prev => ({
          ...prev,
          [optionId]: JSON.stringify(connectorKeyData)
        }));
      }
      
      // Update the terminal JSON value
      setCurrentTerminal(prev => ({
        ...prev,
        ternoJsonValue: JSON.stringify(jsonValue)
      }));
      
      return newSelected;
    });
  };

  // Add handler for connector radio selection
  const handleConnectorRadioChange = (connectorId) => {
    setCurrentTerminal(prev => ({
      ...prev,
      connectorids: connectorId
    }));
  };

  // Handle confirmation dialog response
  const handleConfirmationResponse = (confirmed) => {
    if (confirmed && confirmationOption) {
      // If confirmed, proceed with the change
      handleProcessingFeeChange(confirmationOption);
    }
    
    // Reset confirmation state
    setShowConfirmation(false);
    setConfirmationOption(null);
  };

  // Add handler for JSON textarea changes
  const handleJsonDataChange = (optionId, value) => {
    // Update the optionJsonValues state
    setOptionJsonValues(prev => ({
      ...prev,
      [optionId]: value
    }));
    
    // Update the main ternoJsonValue
    let jsonValue = {};
    
    // If there's existing JSON, try to parse it
    if (currentTerminal.ternoJsonValue) {
      try {
        jsonValue = JSON.parse(currentTerminal.ternoJsonValue);
      } catch (e) {
        console.error("Error parsing existing ternoJsonValue:", e);
        jsonValue = {};
      }
    }
    
    // Find the option in the processingFeeOptions
    const option = processingFeeOptions.find(opt => opt.id.toString() === optionId);
    if (option) {
      const connectorId = option.connectorId ? option.connectorId.toString() : option.id.toString();
      
      // Parse the new JSON value
      let connectorKeyData = {};
      try {
        connectorKeyData = JSON.parse(value);
      } catch (e) {
        console.error("Error parsing JSON data:", e);
        // Use the value as is if it's not valid JSON
        connectorKeyData = value;
      }
      
      // Update the JSON value
      if (jsonValue[connectorId]) {
        jsonValue[connectorId].connectorkey = connectorKeyData;
      } else {
        jsonValue[connectorId] = {
          connectorkey: connectorKeyData,
          feeId: optionId
        };
      }
      
      // Update the terminal JSON value
      setCurrentTerminal(prev => ({
        ...prev,
        ternoJsonValue: JSON.stringify(jsonValue)
      }));
    }
  };
  
  // Handle key press in JSON textarea
  const handleKeyPress = (e) => {
    // Allow the enter key to work in textareas
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTerminals();
  };

  const validateForm = (payload) => {
    if (!payload.terName || !payload.bussinessUrl) {
      toast.error("Terminal Name and Business URL are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("customer-jwtToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.replace("/login");
        }, 2000);
        return;
      }

      if (!validateForm(currentTerminal)) return;

      const payload = {
        id: currentTerminal.id,  // Keep ID for update
        publicKey: currentTerminal.publicKey,
        merid: user.id,
        connectorids: currentTerminal.connectorids,
        bussinessUrl: currentTerminal.bussinessUrl,
        terminalType: currentTerminal.terminalType,
        active: currentTerminal.active,
        businessDescription: currentTerminal.businessDescription,
        businessNature: currentTerminal.businessNature,
        tarnsAlertEmail: currentTerminal.tarnsAlertEmail,
        merTransAlertEmail: currentTerminal.merTransAlertEmail,
        dbaBrandName: currentTerminal.dbaBrandName,
        customerServiceNo: currentTerminal.customerServiceNo,
        customerServiceEmail: currentTerminal.customerServiceEmail,
        merchantTermConditionUrl: currentTerminal.merchantTermConditionUrl,
        merchantRefundPolicyUrl: currentTerminal.merchantRefundPolicyUrl,
        merchantPrivacyPolicyUrl: currentTerminal.merchantPrivacyPolicyUrl,
        merchantContactUsUrl: currentTerminal.merchantContactUsUrl,
        merchantLogoUrl: currentTerminal.merchantLogoUrl,
        curlingAccessKey: currentTerminal.curlingAccessKey,
        ternoJsonValue: currentTerminal.ternoJsonValue,
        selectTemplates: currentTerminal.selectTemplates,
        selectTemplatesLog: currentTerminal.selectTemplatesLog,
        deletedBussinessUrl: currentTerminal.deletedBussinessUrl,
        checkoutTheme: currentTerminal.checkoutTheme,
        selectMcc: currentTerminal.selectMcc,
        webhookUrl: currentTerminal.webhookUrl,
        returnUrl: currentTerminal.returnUrl,
        terName: currentTerminal.terName,
        privateKey: currentTerminal.privateKey,
      };

      console.log('Submitting payload:', payload);

      let response;
      if (currentTerminal.id) {
        response = await axiosInstance.put(`/api/terminals/update/${currentTerminal.id}`, payload);
      } else {
        delete payload.id;
        response = await axiosInstance.post('/api/terminals/create', payload);
      }

      if (response?.data) {
        toast.success(currentTerminal.id ? "Terminal updated successfully" : "Terminal added successfully");
        await fetchTerminals();
        closeModal();
      }
    } catch (error) {
      console.error("Error details:", error);
      const errorMessage = error.response?.data?.message || 'Failed to save terminal';
      toast.error(errorMessage);
    }
  };

  const generatePublicKey = async () => {
    try {
      if (!currentTerminal.id || !user.id) {
        toast.error('Terminal ID and Merid are required to generate public key');
        return;
      }

      // Add confirmation dialog
      if (!window.confirm('Are you sure you want to regenerate the public key?')) {
        return;
      }

      const response = await axiosInstance.get(`/api/terminals/generatePublicKey/${currentTerminal.id}`);
      
      if (response?.data) {
        setCurrentTerminal(prev => ({
          ...prev,
          publicKey: response.data
        }));
        toast.success('Public key generated successfully');
      } else {
        throw new Error('No public key received from server');
      }
    } catch (error) {
      console.error('Error generating public key:', error);
      toast.error(error.response?.data?.message || 'Failed to generate public key');
    }
  };

  const generatePrivateKey = async () => {
    try {
      if (!currentTerminal.id || !user.id) {
        toast.error('Merid and Terminal ID are required to generate private key');
        return;
      }

      // Add confirmation dialog
      if (!window.confirm('Are you sure you want to regenerate the private key?')) {
        return;
      }

      const response = await axiosInstance.get(`/api/terminals/generatePrivateKey/${currentTerminal.id}`);
      
      if (response?.data) {
        setCurrentTerminal(prev => ({
          ...prev,
          privateKey: response.data
        }));
        toast.success('Private key generated successfully');
      } else {
        throw new Error('No private key received from server');
      }
    } catch (error) {
      console.error('Error generating private key:', error);
      toast.error(error.response?.data?.message || 'Failed to generate private key');
    }
  };

  const copyToClipboard = (text, label, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      '5': { text: 'Awaiting Terminal', color: '#17a2b8' }, // Cyan
      '6': { text: 'Terminated', color: '#6c757d' }    // Gray
    };
    return statusConfig[status] || { text: 'Unknown', color: '#6c757d' };
  };

  const renderActionButtons = (terminal) => (
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
        onClick={() => openModal(terminal)}
        title="Edit"
      >
        <FaEdit />
      </button>
    </>
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getSortedData = () => {
    return [...filteredTerminals].sort((a, b) => b.id - a.id);
  };

  const totalPages = Math.ceil(getSortedData().length / itemsPerPage);
  
  // Get current posts
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedData().slice(indexOfFirstItem, indexOfLastItem);

  const handleExport = async (format, data, filename) => {
    setIsExporting(true);
    try {
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

  const handleExpandAll = (e) => {
    // Prevent default behavior and stop event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandAll(!expandAll);
  };

  const handleViewJson = (optionId, e) => {
    // Prevent default behavior and stop event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setVisibleJsonItems(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const styles = {
    defaultHide: {
      display: 'none'
    },
    visible: {
      display: 'block'
    }
  };

  const isJsonItemVisible = (optionId) => {
    return expandAll || visibleJsonItems.includes(optionId);
  };

  return (
    <div className="container mt-2">
      <div className="container-fluid card py-4">
        {/* Search, filters, add, edit, and export buttons */}
        <div className="row ">
          <h2>Terminal</h2>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mb-0">
            <div className="row g-3">
              <div className="col-md-2">
                <select
                  name="active"
                  className="form-select"
                  value={searchCriteria.active}
                  onChange={handleSearch}
                >
                  <option value="">Terminal Status</option>
                  <option value="1">Approved </option>
                  <option value="3">Rejected</option>
                  <option value="4">Under review</option>
                  <option value="5">Awaiting Terminal</option>
                  <option value="6">Terminated</option>
                </select>
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Terminal Name"
                  name="ter_name"
                  value={searchCriteria.ter_name}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Public Key"
                  name="public_key"
                  value={searchCriteria.public_key}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Business URL"
                  name="bussiness_url"
                  value={searchCriteria.bussiness_url}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="col-md-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="DBA Brand Name"
                  name="dba_brand_name"
                  value={searchCriteria.dba_brand_name}
                  onChange={handleSearch}
                />
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn btn-primary">Search</button>
              </div>
              <div className="col float-end">
                    <div className="d-flex float-end">
                        <button className="btn btn-primary me-2" title="Add Terminal" onClick={() => openModal()}>+</button>

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
                                        onClick={() => handleExport('json', currentItems, `terminal_page_${currentPage}`)}
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
                                        onClick={() => handleExport('csv', getSortedData(), 'all_terminal')}
                                        disabled={isExporting}
                                    >
                                        Export as CSV
                                    </button>
                                    </li>
                                    <li>
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => handleExport('json', getSortedData(), 'all_terminal')}
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
            <div>Loading terminals...</div>
          ) : filteredTerminals.length === 0 ? (
            <div>No terminals found</div>
          ) : (
            <>
              <div className="row mb-2 align-items-center pe-0 me-0 pb-0 mb-0">
                <div className="col-md-6">
                  <small className="text-muted">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTerminals.length)} of {filteredTerminals.length} entries
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
                      <th>TerNO</th>
                      {showMerid && <th>Merid</th>}
                      <th>Name</th>
                      <th>URL</th>
                      <th>Key</th>
                      <th>Status</th>
                      <th>Connector Ids</th>
                      <th>Terminal Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((terminal) => (
                      <tr key={terminal.id}>
                        <td>{terminal.id}</td>
                        {showMerid && <td>{terminal.merid}</td>}
                        <td>{terminal.terName}</td>
                        <td>{terminal.bussinessUrl}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <button
                              className="btn btn-sm btn-outline-success  me-2"
                              onClick={(e) => copyToClipboard(terminal.publicKey, 'Public', e)}
                              title={`Copy public key: ${terminal.publicKey}`}
                            >
                              <FaCopy />
                            </button>

                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={(e) => copyToClipboard(terminal.privateKey, 'Private', e)}
                              title={`Copy private key: ${terminal.privateKey}`}
                            >
                              <FaCopy />
                            </button>
                            
                          </div>
                        </td>
                        <td>
                          <span style={{ 
                            color: getStatusDisplay(terminal.active).color,
                            fontWeight: 'bold'
                          }}>
                            {getStatusDisplay(terminal.active).text}
                          </span>
                        </td>
                       
                        <td>{terminal.connectorids}</td>
                        
                        <td>{terminal.terminalType}</td>
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
              
              <nav className="d-flex align-items-center" aria-label="Connector list pagination">
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
                zIndex: 1050
              },
              content: {
                position: 'relative',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
              <form id="terminal-form" onSubmit={handleSubmit} className="row">
                <div className="modal-header" style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid #ccc', zIndex: 1 }}>
                  <h5 className="modal-title  p-3">
                      {currentTerminal?.id
                        ? (
                          <>
                            Edit Terminal :: terNO: <span style={{ color: '#dd00b0' }}><strong>{currentTerminal.id}</strong></span> 
                            { /* Add button to generate public key as a 256 encrypted for ID_merid_timestamp */}
                            <button
                              type="button"
                              className="btn btn-outline-primary ms-2"
                              onClick={generatePublicKey}
                              title="Re-Generate new public key"
                            >
                              <FaSync className="me-1" />Re-Generate Public Key
                            </button>

                            <button
                              className="btn btn-sm btn-outline-success ms-2"
                              onClick={(e) => copyToClipboard(currentTerminal.publicKey, 'Public', e)}
                              title={`Copy public key: ${currentTerminal.publicKey}`}
                            >
                              <FaCopy />
                            </button>


                            { /* Add button to private public key as a 256 encrypted for merid_ID_timestamp */}
                            <button
                              type="button"
                              className="btn btn-outline-success ms-2"
                              onClick={generatePrivateKey}
                              title="Re-Generate new private key"
                            >
                              <FaSync className="me-1" />Re-Generate private key
                            </button>

                            <button
                              className="btn btn-sm btn-outline-secondary ms-2"
                              onClick={(e) => copyToClipboard(currentTerminal.privateKey, 'Private', e)}
                              title={`Copy private key: ${currentTerminal.privateKey}`}
                            >
                              <FaCopy />
                            </button>
                          </>
                        )
                        :
                        (
                          <>
                            Add Terminal:
                            
                          </>
                        )
                        }
                      
                  </h5>
                  <button type="button" className="btn-close me-2" onClick={closeModal}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto', padding: '20px' }}>
                  <div className="row fs-6 gx-2"> 
                  
                  {currentTerminal?.id
                        ? (
                          <>
                  <div className="col-md-6 form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="publicKey"
                        value={currentTerminal.publicKey}
                        onChange={handleInputChange}
                      />
                      <label className="form-label">Public Key:</label>
                  </div>

                  <div className="col-md-6 form-floating">
                    <input
                      type="text"
                      className="form-control"
                      name="privateKey"
                      value={currentTerminal.privateKey}
                      onChange={handleInputChange}
                    />
                    <label className="form-label">Private Key:</label>
                  </div>
                  </>
                    )
                    :
                    ("")
                    }



                  <div className="col-md-6">
                    <label className="form-label">Terminal Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="terName"
                      value={currentTerminal.terName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  
                  
                  <div className="col-md-6">
                    <label className="form-label">Business URL:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="bussinessUrl"
                      value={currentTerminal.bussinessUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Terminal Type:</label>
                    <input
                      type="text"
                      className="form-control"
                      name="terminalType"
                      value={currentTerminal.terminalType}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Business Description:</label>
                    <input type="text" className="form-control" name="businessDescription" value={currentTerminal.businessDescription} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Business Nature:</label>
                    <input type="text" className="form-control" name="businessNature" value={currentTerminal.businessNature} onChange={handleInputChange} />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Merchant Transaction Alert Email:</label>
                    <input type="email" className="form-control" name="merTransAlertEmail" value={currentTerminal.merTransAlertEmail} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">DBA Brand Name:</label>
                    <input type="text" className="form-control" name="dbaBrandName" value={currentTerminal.dbaBrandName} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Customer Service Number:</label>
                    <input type="text" className="form-control" name="customerServiceNo" value={currentTerminal.customerServiceNo} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Customer Service Email:</label>
                    <input type="email" className="form-control" name="customerServiceEmail" value={currentTerminal.customerServiceEmail} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Terms & Conditions URL:</label>
                    <input type="url" className="form-control" name="merchantTermConditionUrl" value={currentTerminal.merchantTermConditionUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Refund Policy URL:</label>
                    <input type="url" className="form-control" name="merchantRefundPolicyUrl" value={currentTerminal.merchantRefundPolicyUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Privacy Policy URL:</label>
                    <input type="url" className="form-control" name="merchantPrivacyPolicyUrl" value={currentTerminal.merchantPrivacyPolicyUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 pt-3">
                    <label className="form-label">Contact Us URL:</label>
                    <input type="url" className="form-control" name="merchantContactUsUrl" value={currentTerminal.merchantContactUsUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 pt-3">
                    <label className="form-label">Logo URL:</label>
                    <input type="url" className="form-control" name="merchantLogoUrl" value={currentTerminal.merchantLogoUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 pt-3">
                    <label className="form-label">Curling Access Key:</label>
                    <input type="text" className="form-control" name="curlingAccessKey" value={currentTerminal.curlingAccessKey} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6 pt-3">
                    <label className="form-label">Select Templates:</label>
                    <input type="text" className="form-control" name="selectTemplates" value={currentTerminal.selectTemplates} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Templates Log:</label>
                    <input type="text" className="form-control" name="selectTemplatesLog" value={currentTerminal.selectTemplatesLog} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Deleted Business URL:</label>
                    <input type="url" className="form-control" name="deletedBussinessUrl" value={currentTerminal.deletedBussinessUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Checkout Theme:</label>
                    <input type="text" className="form-control" name="checkoutTheme" value={currentTerminal.checkoutTheme} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Select MCC:</label>
                    <input type="text" className="form-control" name="selectMcc" value={currentTerminal.selectMcc} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Webhook URL:</label>
                    <input type="url" className="form-control" name="webhookUrl" value={currentTerminal.webhookUrl} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Return URL:</label>
                    <input type="url" className="form-control" name="returnUrl" value={currentTerminal.returnUrl} onChange={handleInputChange} />
                  </div>
                  


                  <div className="col-md-12 py-3">
                    <label className="form-label">Transaction Alert Email Options:</label>
                    <div className="row col-sm-12">
                      <div className="checkbox_div col-sm-2" title="To Merchant on Approved">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_001" 
                            className="checkbox_d form-check-input"
                            value="001"
                            checked={currentTerminal.tarnsAlertEmail?.includes('001')}
                            onChange={() => handleTarnsAlertEmailChange('001')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_001">Approved</label>
                      </div>

                      <div className="checkbox_div col-sm-2" title="To Merchant on Declined">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_004" 
                            className="checkbox_d form-check-input"
                            value="004"
                            checked={currentTerminal.tarnsAlertEmail?.includes('004')}
                            onChange={() => handleTarnsAlertEmailChange('004')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_004">Declined</label>
                      </div>

                      <div className="checkbox_div col-sm-2" title="To Merchant on Withdraw">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_011" 
                            className="checkbox_d form-check-input"
                            value="011"
                            checked={currentTerminal.tarnsAlertEmail?.includes('011')}
                            onChange={() => handleTarnsAlertEmailChange('011')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_011">Withdraw</label>
                      </div>

                      <div className="checkbox_div col-sm-2" title="To Merchant on Chargeback">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_012" 
                            className="checkbox_d form-check-input"
                            value="012"
                            checked={currentTerminal.tarnsAlertEmail?.includes('012')}
                            onChange={() => handleTarnsAlertEmailChange('012')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_012">Chargeback</label>
                      </div>

                      <div className="checkbox_div col-sm-2" title="To Merchant on Refund">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_013" 
                            className="checkbox_d form-check-input"
                            value="013"
                            checked={currentTerminal.tarnsAlertEmail?.includes('013')}
                            onChange={() => handleTarnsAlertEmailChange('013')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_013">Refund</label>
                      </div>

                      <div className="checkbox_div col-sm-2" title="Notification to customer for success and decline">
                        <span className="form-check form-switch float-start">
                          <input 
                            type="checkbox" 
                            name="tarns_alert_email[]" 
                            id="tarns_alert_email_002" 
                            className="checkbox_d form-check-input"
                            value="002"
                            checked={currentTerminal.tarnsAlertEmail?.includes('002')}
                            onChange={() => handleTarnsAlertEmailChange('002')}
                          />
                        </span>
                        <label className="form-check-label" htmlFor="tarns_alert_email_002">Customer</label>
                      </div>
                    </div>
                  </div>


                  <div className="modal-footer p-2" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1 }}>
                    <button type="submit" className="btn btn-primary me-2" form="terminal-form">
                      {currentTerminal?.id ? "Update" : "Add"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>

                </div>
                </div>
              </form>
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
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
                          {currentTerminal?.id
                              ? (
                                  <>
                                      View Terminal Details :: terNO: <span style={{ color: '#dd00b0' }}><strong>{currentTerminal.id}</strong></span> 
                                  </>
                              )
                              : "View Terminal Details"}
                      </h5>
                <button type="button" className="btn-close me-2" onClick={closeViewModal}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: 'calc(90vh - 130px)', overflowY: 'auto', padding: '20px' }}>
                <div className="row fs-6 gx-2">
                  {Object.entries(currentTerminal)
                    .filter(([key]) => !['id', 'ternoJsonValue', 'curlingAccessKey', 'connectorids','merid','publicKeyDe','deletedBussinessUrl'].includes(key)) // Exclude specified fields
                    .map(([key, value]) => (
                      <div key={key} className="col-md-6 mb-3">
                        <label className="fw-bold text-capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </label>
                        <div className="rounded p-2 bg-light">
                          {key === 'active' ? (value ? 'Yes' : 'No') : 
                           key === 'tarnsAlertEmail' ? (
                             value?.split(',').map(code => {
                               const labels = {
                                 '001': 'Approved',
                                 '004': 'Declined',
                                 '011': 'Withdraw',
                                 '012': 'Chargeback',
                                 '013': 'Refund',
                                 '002': 'Customer notifications'
                               };
                               return labels[code] || code;
                             }).join(', ') || 'N/A'
                           ) : value || 'N/A'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="modal-footer p-2" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1 }}>
                <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                  Close
                </button>
              </div>
            </div>
          </Modal>

          {/* Confirmation Modal for Processing Fee Changes */}
          <Modal
            isOpen={showConfirmation}
            onRequestClose={() => handleConfirmationResponse(false)}
            className="modal-dialog modal-sm"
            overlayClassName="modal-backdrop"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1060
              },
              content: {
                position: 'relative',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                width: '300px',
                border: 'none',
                background: '#fff',
                borderRadius: '6px',
                padding: 0,
                overflow: 'hidden'
              }
            }}
          >
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">Confirm Modification</h5>
                <button type="button" className="btn-close" onClick={() => handleConfirmationResponse(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to {selectedProcessingFees.includes(confirmationOption?.id?.toString() || '') ? 'remove' : 'add'} this processing fee option?</p>
                <p className="fw-bold">{confirmationOption ? `[${confirmationOption.id}] - ${confirmationOption.connectorId}` : ''}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => handleConfirmationResponse(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={() => handleConfirmationResponse(true)}>Confirm</button>
              </div>
            </div>
          </Modal>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
