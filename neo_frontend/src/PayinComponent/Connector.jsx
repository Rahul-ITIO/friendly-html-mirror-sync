//The React code provides a user interface for adding, viewing, editing, deleting, and setting a default currency in a currency management system.
import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
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

const AddConnector = ({ onAddConnector }) => {
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
     defaultConnector: "", // was bankCode
     
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
        toast.error("Please enter valid JSON in Connector Processing Credentials", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'processing-creds-error'
        });
        return;
      }
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/connectors/add`,
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Connector added successfully", {
          position: "top-center",
          autoClose: 2000,
          toastId: 'add-success'
        });
        
        AddConnector(dataToSubmit);
        
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
          defaultConnector: "",
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

  /*
  return (
      <>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Add Connector..
        </button>

        {showForm && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Connector..</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowForm(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmitAndClose}>
                    <div className="row">
                      <div className="col-md-6 Left Column">
                        
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Number *"
                            name="connectorNumber"
                            value={formData.connectorNumber}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="channelType"
                            value={formData.channelType}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Type</option>
                            <option value="1">1. ch (e-Check Payment)</option>
                            <option value="2">2. 2d (2D Card Payment)</option>
                            <option value="3">3. 3d (3D Card Payment)</option>
                            <option value="4">4. wa (Wallets Payment)</option>
                            <option value="5">5. upi (UPI Collect)</option>
                            <option value="6">6. nb (Net Banking Payment)</option>
                            <option value="7">7. crypto (Coins Payment)</option>
                            <option value="9">9. upiqr (UPI Collect QR & Intent)</option>
                            <option value="10">10. qr (UPI QR & Intent)</option>
                            <option value="11">11. bt (Bank Transfer)</option>
                            <option value="90">90. np (Network Payment)</option>
                            <option value="99">99. ot (Other Payment)</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Base URL"
                            name="connectorBaseUrl"
                            value={formData.connectorBaseUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Login Credentials"
                            name="connectorLoginCreds"
                            value={formData.connectorLoginCreds}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Processing Currency"
                            name="connectorProcessingCurrency"
                            value={formData.connectorProcessingCurrency}
                            onChange={handleInputChange}
                          />
                        </div>                      <div className="form-group mb-3">
                          <label className="form-label">Connection Method</label>
                          <select
                            className="form-control"
                            name="connectionMethod"
                            value={formData.connectionMethod}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Connection Method</option>
                            <option value="1">Direct (Curl Option)</option>
                            <option value="4">Whitelisting IP - Direct (Curl Option)</option>
                            <option value="2">Redirect (Get Method)</option>
                            <option value="3">Redirect (Post Method)</option>
                            <option value="5">Whitelisting IP - Redirect (Post Method)</option>
                            <option value="6">Redirect (Curl Option)</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Production URL"
                            name="connectorProdUrl"
                            value={formData.connectorProdUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">Processing Credentials JSON</label>
                          <textarea
                            className="form-control font-monospace"
                            placeholder="Processing Credentials JSON"
                            name="connectorProcessingCredsJson"
                            value={formData.connectorProcessingCredsJson}
                            onChange={handleInputChange}
                            rows={4}
                            style={{
                              fontFamily: 'monospace',
                              whiteSpace: 'pre',
                              overflowX: 'auto'
                            }}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">E-commerce Cruises JSON</label>
                          <textarea
                            className="form-control"
                            placeholder="E-commerce Cruises JSON"
                            name="ecommerceCruisesJson"
                            value={formData.ecommerceCruisesJson}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">Merchant Settings JSON</label>
                          <textarea
                            className="form-control"
                            placeholder="Merchant Settings JSON"
                            name="merSettingJson"
                            value={formData.merSettingJson}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Processing Currency Markup"
                            name="processingCurrencyMarkup"
                            value={formData.processingCurrencyMarkup}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="col-md-6 Right Column">
                        
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Name *"
                            name="connectorName"
                            value={formData.connectorName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">Status</label>
                          <select
                            className="form-control"
                            value={formData.connectorStatus}
                            name="connectorStatus"
                            onChange={handleInputChange}
                          >
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Common</option>
                          </select>
                        </div>                      <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MCC Code"
                            name="mccCode"
                            value={formData.mccCode}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="connectorProdMode"
                            value={formData.connectorProdMode}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Production Mode</option>
                            <option value="1">Production</option>
                            <option value="0">Testing</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Default Connector"
                                name="defaultConnector"
                                value={formData.defaultConnector}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector UAT URL"
                            name="connectorUatUrl"
                            value={formData.connectorUatUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Status URL"
                            name="connectorStatusUrl"
                            value={formData.connectorStatusUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Refund URL"
                            name="connectorRefundUrl"
                            value={formData.connectorRefundUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Refund Policy"
                            name="connectorRefundPolicy"
                            value={formData.connectorRefundPolicy}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Descriptor"
                            name="connectorDescriptor"
                            value={formData.connectorDescriptor}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="transAutoExpired"
                            value={formData.transAutoExpired}
                            onChange={handleInputChange}
                          >
                            <option value="">Auto Expire Transactions</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="transAutoRefund"
                            value={formData.transAutoRefund}
                            onChange={handleInputChange}
                          >
                            <option value="">Auto Refund Transactions</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">Technical Comments</label>
                          <textarea
                            className="form-control"
                            placeholder="Technical Comments"
                            name="techCommentsText"
                            value={formData.techCommentsText}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>                 
                    <div className="row mt-3 Additional fields in a new row ">
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector WL IP"
                            name="connectorWlIp"
                            value={formData.connectorWlIp}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector WL Domain"
                            name="connectorWlDomain"
                            value={formData.connectorWlDomain}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Connector Dev API URL"
                            name="connectorDevApiUrl"
                            value={formData.connectorDevApiUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MOP Web"
                            name="mopWeb"
                            value={formData.mopWeb}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MOP Mobile"
                            name="mopMobile"
                            value={formData.mopMobile}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Hard Code Payment URL"
                            name="hardCodePaymentUrl"
                            value={formData.hardCodePaymentUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Hard Code Status URL"
                            name="hardCodeStatusUrl"
                            value={formData.hardCodeStatusUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Hard Code Refund URL"
                            name="hardCodeRefundUrl"
                            value={formData.hardCodeRefundUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="skipCheckoutValidation"
                            value={formData.skipCheckoutValidation}
                            onChange={handleInputChange}
                          >
                            <option value="">Skip Checkout Validation</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Redirect Popup Message Web"
                            name="redirectPopupMsgWeb"
                            value={formData.redirectPopupMsgWeb}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Redirect Popup Message Mobile"
                            name="redirectPopupMsgMobile"
                            value={formData.redirectPopupMsgMobile}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Checkout Label Name Web"
                            name="checkoutLabelNameWeb"
                            value={formData.checkoutLabelNameWeb}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Checkout Label Name Mobile"
                            name="checkoutLabelNameMobile"
                            value={formData.checkoutLabelNameMobile}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                   
                    <div className="row mt-3 JSON fields row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Label JSON</label>
                          <textarea
                            className="form-control"
                            placeholder="Connector Label JSON"
                            name="connectorLabelJson"
                            value={formData.connectorLabelJson}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <label className="form-label">Processing Countries JSON</label>
                          <textarea
                            className="form-control"
                            placeholder="Processing Countries JSON"
                            name="processingCountriesJson"
                            value={formData.processingCountriesJson}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Block Countries JSON</label>
                          <textarea
                            className="form-control"
                            placeholder="Block Countries JSON"
                            name="blockCountriesJson"
                            value={formData.blockCountriesJson}
                            onChange={handleInputChange}
                            rows={4}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Notification Email"
                            name="notificationEmail"
                            value={formData.notificationEmail}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group mb-3">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Notification Count"
                            name="notificationCount"
                            value={formData.notificationCount}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                   
                    <div className="row mt-3 Auto Status fields">
                      <div className="col-md-3">
                        <div className="form-group mb-3">
                          <select
                            className="form-control"
                            name="autoStatusFetch"
                            value={formData.autoStatusFetch}
                            onChange={handleInputChange}
                          >
                            <option value="">Auto Status Fetch</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Auto Status Start Time"
                            name="autoStatusStartTime"
                            value={formData.autoStatusStartTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Auto Status Interval Time"
                            name="autoStatusIntervalTime"
                            value={formData.autoStatusIntervalTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Cron Bank Status Response"
                            name="cronBankStatusResponse"
                            value={formData.cronBankStatusResponse}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Add Connector
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );

    */
};


const ConnectorList = ({ connectors, setConnectors, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [editedConnector, setEditedConnector] = useState({});
    const [originalCode, setOriginalCode] = useState('');  
    const [sortConfig, setSortConfig] = useState({
      key: 'connectorNumber',
      direction: 'asc'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isExporting, setIsExporting] = useState(false);
    const [goToPage, setGoToPage] = useState('');
    const [lastKeyPressed, setLastKeyPressed] = useState(null);
    const keyIndicatorTimeout = useRef(null);
    const [connectorToDelete, setConnectorToDelete] = useState(null);
    const [updatedCode, setUpdatedCode] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addFormData, setAddFormData] = useState({
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
        defaultConnector: "",
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
  
    // Filter connectors based on search and filters
    const getFilteredConnectors = () => {
      let filtered = [...connectors];
  
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (connector) =>
            connector.connectorNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            connector.connectorName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Apply type filter
      if (filterType) {
        filtered = filtered.filter((connector) => connector.channelType === filterType);
      }
  
      // Apply status filter
      if (filterStatus) {
        filtered = filtered.filter((connector) => connector.connectorStatus === filterStatus);
      }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const filteredConnectors = getFilteredConnectors();

  // Sorting function
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (a[key] === null && b[key] === null) return 0;
      
      // Handle numeric fields
      if (['defaultConnector', 'connectorProcessingCurrency', 'connectorProdMode'].includes(key)) {
        return direction === 'asc' 
          ? Number(a[key] || 0) - Number(b[key] || 0)
          : Number(b[key] || 0) - Number(a[key] || 0);
      }
      
      // Handle string fields
      return direction === 'asc'
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
  };

  // Handle column header click for sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered data
  const getSortedData = () => {
    const filtered = connectors.filter(connector => {
      const matchesSearch = searchTerm === "" || 
        Object.values(connector)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "" || connector.channelType === filterType;
      const matchesStatus = filterStatus === "" || connector.connectorStatus === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  
    return sortData(filtered, sortConfig.key, sortConfig.direction);
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const handleEdit = (index) => {
    // Get the actual connector object instead of using index
    const connector = filteredConnectors[index];
    console.log("Opening edit modal for connector:", connector);
    setShowModal(true);
    setOriginalCode(connector.connectorNumber); 
    setEditedConnector({
      ...connector,
      connectorNumber: connector.connectorNumber || ''
    });
    // Find the index in the original connectors array
    const originalIndex = connectors.findIndex(c => c.connectorNumber === connector.connectorNumber);
    setEditIndex(originalIndex);
  };

  const handleUpdate = async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'session-error'
        });
        return;
      }

      if (!editedConnector.connectorNumber || !editedConnector.connectorName || !editedConnector.channelType || !editedConnector.connectorStatus) {
        toast.error("Please fill in all required fields", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'validation-error'
        });
        return;
      }

      // Store the code for message
      const connectorCode = editedConnector.connectorNumber;

      // Close modal first to prevent any race conditions
      setShowModal(false);
      setEditedConnector({});
      setOriginalCode('');
      setEditIndex(-1);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/connectors/update?originalCode=${originalCode}`,
        editedConnector,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      if (response.data.success) {
        // Update local state
        setConnectors(prevConnectors => {
          const updatedConnectors = [...prevConnectors];
          const index = updatedConnectors.findIndex(c => c.connectorNumber === originalCode);
          if (index !== -1) {
            updatedConnectors[index] = editedConnector;
          }
          return updatedConnectors;
        });

        // Set the updated code to trigger highlight
        setUpdatedCode(connectorCode);

        // Show success message for any update
        toast.success(`Successfully updated connector with code ${connectorCode}`, {
          position: "top-center",
          autoClose: 2000,
          toastId: 'update-success'
        });
      } else {
        toast.error(response.data.responseMessage || "Failed to update connector", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'update-error'
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.responseMessage || "Failed to update connector", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'update-error'
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedConnector({}); 
    setOriginalCode(''); 
  };

  const handleDelete = async (id) => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      toast.error("Session expired. Please login again.", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'session-error'
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/connectors/delete`,
        id,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      
      toast.success("Connector deleted successfully", {
        position: "top-center",
        autoClose: 2000,
        toastId: 'delete-success'
      });
      
      setConnectors(prevConnectors => prevConnectors.filter(connector => connector.id !== id));
      setShowDeleteModal(false);
      setConnectorToDelete(null);
    } catch (error) {
      toast.error("Failed to delete connector", {
        position: "top-center",
        autoClose: 2000,
        toastId: 'delete-error'
      });
      console.error("Error deleting connector:", error);
    }
  };

  const initiateDelete = (connector) => {
    setConnectorToDelete(connector);
    setShowDeleteModal(true);
  };


  // Export functions
  const exportToCSV = (data, filename) => {
    const headers = [
      'Connector Number', 'Connector Name', 'Channel Type', 'Connector Status',
      'Base URL', 'Login Credentials', 'Processing Currency', 'Connection Method',
      'Production URL', 'UAT URL', 'Status URL', 'Dev API URL',
      'WL Domain', 'Processing Creds JSON', 'Currency Markup', 'Tech Comments',
      'Refund Policy', 'Refund URL', 'Default Connector', 'MCC Code',
      'Production Mode', 'Descriptor', 'Auto Expired', 'Auto Refund',
      'WL IP', 'MOP Web', 'MOP Mobile', 'Hardcode Payment URL',
      'Hardcode Status URL', 'Hardcode Refund URL', 'Skip Checkout Validation',
      'Redirect Popup Web', 'Redirect Popup Mobile', 'Checkout Label Web',
      'Checkout Label Mobile', 'Checkout Sublabel Web', 'Checkout Sublabel Mobile',
      'Ecommerce Cruises JSON', 'Merchant Settings JSON', 'Connector Label JSON',
      'Processing Countries JSON', 'Block Countries JSON', 'Notification Email',
      'Notification Count', 'Auto Status Fetch', 'Auto Status Start Time',
      'Auto Status Interval', 'Cron Bank Status Response'
    ];
    
    const fields = [
      'connectorNumber', 'connectorName', 'channelType', 'connectorStatus',
      'connectorBaseUrl', 'connectorLoginCreds', 'connectorProcessingCurrency', 'connectionMethod',
      'connectorProdUrl', 'connectorUatUrl', 'connectorStatusUrl', 'connectorDevApiUrl',
      'connectorWlDomain', 'connectorProcessingCredsJson', 'processingCurrencyMarkup', 'techCommentsText',
      'connectorRefundPolicy', 'connectorRefundUrl', 'defaultConnector', 'mccCode',
      'connectorProdMode', 'connectorDescriptor', 'transAutoExpired', 'transAutoRefund',
      'connectorWlIp', 'mopWeb', 'mopMobile', 'hardCodePaymentUrl',
      'hardCodeStatusUrl', 'hardCodeRefundUrl', 'skipCheckoutValidation',
      'redirectPopupMsgWeb', 'redirectPopupMsgMobile', 'checkoutLabelNameWeb',
      'checkoutLabelNameMobile', 'checkoutSubLabelNameWeb', 'checkoutSubLabelNameMobile',
      'ecommerceCruisesJson', 'merSettingJson', 'connectorLabelJson',
      'processingCountriesJson', 'blockCountriesJson', 'notificationEmail',
      'notificationCount', 'autoStatusFetch', 'autoStatusStartTime',
      'autoStatusIntervalTime', 'cronBankStatusResponse'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        fields.map(field => {
          const value = item[field] || '';
          // Handle values that contain commas, quotes, or newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced export functions with loading state
  const handleExport = async (format, data, filename) => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        await exportToCSV(data, filename);
      } else {
        await exportToJSON(data, filename);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedData().slice(indexOfFirstItem, indexOfLastItem);
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
    if (updatedCode) {
      const timer = setTimeout(() => {
        setUpdatedCode(null);
      }, 2000); // Match with toast duration
      return () => clearTimeout(timer);
    }
  }, [updatedCode]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const currentToken = getAuthToken();
    if (!currentToken) {
      toast.error("Session expired. Please login again.", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'session-error'
      });
      return;
    }

    if (!addFormData.connectorNumber || !addFormData.connectorName || !addFormData.channelType || !addFormData.connectorStatus) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'validation-error'
      });
      return;
    }

    let dataToSubmit = { ...addFormData };

    // Handle processing code - keep it as string
    if (dataToSubmit.connectorProcessingCredsJson) {
      try {
        // Validate if it's valid JSON
        JSON.parse(dataToSubmit.connectorProcessingCredsJson);
        // Keep it as string, don't parse it
      } catch (error) {
        toast.error("Please enter valid JSON in Processing Code", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'processing-code-error'
        });
        return;
      }
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/connectors/add`,
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Connector added successfully", {
          position: "top-center",
          autoClose: 2000,
          toastId: 'add-success'
        });
        
        setConnectors(prevConnectors => [...prevConnectors, dataToSubmit]);
        
        // Reset form
        setAddFormData({
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
          defaultConnector: "",
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
        setShowAddForm(false);
        // With this:
        setTimeout(() => {
            window.location.reload();
        }, 1000); // Reload after 1 second to allow the toast to be visible
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
    } finally {
        setIsSubmitting(false);
    }
  };

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
      <div className="row ">
        <h4 className="mb-4">Connector Management</h4>
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control p-2"
                  placeholder="Search connectors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="1">1. ch (e-Check Payment)</option>
                <option value="2">2. 2d (2D Card Payment)</option>
                <option value="3">3. 3d (3D Card Payment)</option>
                <option value="4">4. wa (Wallets Payment)</option>
                <option value="5">5. upi (UPI Collect)</option>
                <option value="6">6. nb (Net Banking Payment)</option>
                <option value="7">7. crypto (Coins Payment)</option>
                <option value="9">9. upiqr (UPI Collect QR & Intent)</option>
                <option value="10">10. qr (UPI QR & Intent)</option>
                <option value="11">11. bt (Bank Transfer)</option>
                <option value="90">90. np (Network Payment)</option>
                <option value="99">99. ot (Other Payment)</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
                <option value="2">Common</option>
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex float-end">
            <button 
              type="button" 
              className="btn btn-primary me-2"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Connector
            </button>
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
                    onClick={() => handleExport('csv', currentItems, `connectors_page_${currentPage}`)}
                    disabled={isExporting}
                  >
                    Export as CSV
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('json', currentItems, `connectors_page_${currentPage}`)}
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
                    onClick={() => handleExport('csv', getSortedData(), 'all_connectors')}
                    disabled={isExporting}
                  >
                    Export as CSV
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleExport('json', getSortedData(), 'all_connectors')}
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

      {/* Results count and items per page selector */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-6">
          <small className="text-muted">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, getSortedData().length)} of {getSortedData().length} connectors
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
        <table className="table table-hover">
          <thead className="table-bordered border-color bg-color custom-bg-text">
            <tr>
              <th onClick={() => handleSort('connectorNumber')} style={{ cursor: 'pointer' }}>
                Code{getSortIndicator('connectorNumber')}
              </th>
              <th onClick={() => handleSort('connectorName')} style={{ cursor: 'pointer' }}>
                Name{getSortIndicator('connectorName')}
              </th>
              <th onClick={() => handleSort('channelType')} style={{ cursor: 'pointer' }}>
                Type{getSortIndicator('channelType')}
              </th>
              <th onClick={() => handleSort('connectorStatus')} style={{ cursor: 'pointer' }}>
                Status{getSortIndicator('connectorStatus')}
              </th>
              
              <th onClick={() => handleSort('connectorProdUrl')} style={{ cursor: 'pointer' }}>
                URL{getSortIndicator('connectorProdUrl')}
              </th>
              <th title='Default Connector' onClick={() => handleSort('defaultConnector')} style={{ cursor: 'pointer' }}>
              DC{getSortIndicator('defaultConnector')}
              </th>
              <th title="Connector Processing Currency" onClick={() => handleSort('connectorProcessingCurrency')} style={{ cursor: 'pointer' }}>
              CPC{getSortIndicator('connectorProcessingCurrency')}
              </th>
              <th title="Connector Prod Mode" onClick={() => handleSort('connectorProdMode')} style={{ cursor: 'pointer' }}>
              P.Mode{getSortIndicator('connectorProdMode')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((connector, index) => (
              <tr 
                key={connector.connectorNumber}
                className={connector.connectorNumber === updatedCode ? 'highlight-update' : ''}
              >
                <td>{connector.connectorNumber}</td>
                <td>{connector.connectorName}</td>
                <td>{connector.channelType}</td>
                <td>
                  <span className={`badge ${connector.connectorStatus === '1' ? 'bg-success' : connector.connectorStatus === '0' ? 'bg-danger' : 'bg-info'}`}>
                    {connector.connectorStatus === '1' ? 'Active' : connector.connectorStatus === '0' ? 'Inactive' : 'Common'}
                  </span>
                </td>
                
                <td>
                  <span className="text-truncate d-inline-block" style={{maxWidth: "200px"}} title={connector.connectorProdUrl}>
                    {connector.connectorProdUrl}
                  </span>
                </td>
                <td>{connector.defaultConnector}</td>
                <td>{connector.connectorProcessingCurrency}</td>
                <td><span className={`badge ${connector.connectorProdMode === '1' ? 'bg-success' : connector.connectorProdMode === '0' ? 'bg-danger' : 'bg-info'}`}>
                    {connector.connectorProdMode === '1' ? 'Live' : connector.connectorProdMode === '0' ? 'Test' : 'Common'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleEdit(index)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => initiateDelete(connector)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  No connectors found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination with Go to Page */}
      {getSortedData().length > 0 && (
        <div className="d-flex justify-content-end align-items-center mt-4">         
          
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

      {/* Keyboard shortcut indicator */}
      <KeyboardIndicator />

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
                    setConnectorToDelete(null);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the connector "{connectorToDelete?.connectorName}"?</p>
                <p className="text-danger"><small>This action cannot be undone.</small></p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConnectorToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(connectorToDelete?.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Connector Modal */}
      {showAddForm && (
      <div className="modal modal-overlay" style={{ display: 'block' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Connector!</h5>
              <button type="button" className="btn-close" onClick={()=> setShowAddForm(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddSubmit}>
                {/* Nav tabs for better organization */}
                <ul className="nav nav-tabs mb-3" id="connectorTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="basic-tab" data-bs-toggle="tab" data-bs-target="#basic"
                      type="button" role="tab">Basic Info</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="urls-tab" data-bs-toggle="tab" data-bs-target="#urls" type="button"
                      role="tab">URLs & Endpoints</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="processing-tab" data-bs-toggle="tab" data-bs-target="#processing"
                      type="button" role="tab">Processing</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="checkout-tab" data-bs-toggle="tab" data-bs-target="#checkout"
                      type="button" role="tab">Checkout UI</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="json-tab" data-bs-toggle="tab" data-bs-target="#json" type="button"
                      role="tab">JSON Settings</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications"
                      type="button" role="tab">Notifications</button>
                  </li>
                </ul>

                {/* Tab content */}
                <div className="tab-content" id="connectorTabsContent">
                  {/* Basic Info Tab */}
                  <div className="tab-pane fade show active" id="basic" role="tabpanel">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Number *</label>
                          <input type="text" className="form-control" placeholder="Connector Number" name="connectorNumber"
                            value={addFormData.connectorNumber} onChange={handleAddInputChange} required />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Name *</label>
                          <input type="text" className="form-control" placeholder="Connector Name" name="connectorName"
                            value={addFormData.connectorName} onChange={handleAddInputChange} required />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Default Connector</label>
                          <input
                                type="text"
                                className="form-control"
                                placeholder="Default Connector"
                                name="defaultConnector"
                                value={addFormData.defaultConnector}
                                onChange={handleAddInputChange}
                            />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Channel Type</label>
                          <select className="form-control" name="channelType" value={addFormData.channelType}
                            onChange={handleAddInputChange}>
                            <option value="">Select Type</option>
                            <option value="1">1. ch (e-Check Payment)</option>
                            <option value="2">2. 2d (2D Card Payment)</option>
                            <option value="3">3. 3d (3D Card Payment)</option>
                            <option value="4">4. wa (Wallets Payment)</option>
                            <option value="5">5. upi (UPI Collect)</option>
                            <option value="6">6. nb (Net Banking Payment)</option>
                            <option value="7">7. crypto (Coins Payment)</option>
                            <option value="9">9. upiqr (UPI Collect QR & Intent)</option>
                            <option value="10">10. qr (UPI QR & Intent)</option>
                            <option value="11">11. bt (Bank Transfer)</option>
                            <option value="90">90. np (Network Payment)</option>
                            <option value="99">99. ot (Other Payment)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Status</label>
                          <select className="form-control" name="connectorStatus" value={addFormData.connectorStatus}
                            onChange={handleAddInputChange}>
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                            <option value="2">Common</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Production Mode</label>
                          <select className="form-control" name="connectorProdMode" value={addFormData.connectorProdMode}
                            onChange={handleAddInputChange}>
                            <option value="">Select Mode</option>
                            <option value="1">Production</option>
                            <option value="0">Test</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">MCC Code</label>
                          <input type="text" className="form-control" placeholder="MCC Code" name="mccCode"
                            value={addFormData.mccCode} onChange={handleAddInputChange} />
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Connection Method</label>
                          <select className="form-control" name="connectionMethod" value={addFormData.connectionMethod}
                            onChange={handleAddInputChange}>
                            <option value="">Select Method</option>
                            <option value="1">Direct (Curl Option)</option>
                            <option value="4">Whitelisting IP - Direct (Curl Option)</option>
                            <option value="2">Redirect (Get Method)</option>
                            <option value="3">Redirect (Post Method)</option>
                            <option value="5">Whitelisting IP - Redirect (Post Method)</option>
                            <option value="6">Redirect (Curl Option)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Descriptor</label>
                          <textarea className="form-control" placeholder="Connector Descriptor" name="connectorDescriptor"
                            value={addFormData.connectorDescriptor} onChange={handleAddInputChange} rows="2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* URLs & Endpoints Tab */}
                  <div className="tab-pane fade" id="urls" role="tabpanel">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Base URL</label>
                          <input type="text" className="form-control" placeholder="Connector Base URL"
                            name="connectorBaseUrl" value={addFormData.connectorBaseUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Production URL</label>
                          <input type="text" className="form-control" placeholder="Connector Production URL"
                            name="connectorProdUrl" value={addFormData.connectorProdUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector UAT URL</label>
                          <input type="text" className="form-control" placeholder="Connector UAT URL" name="connectorUatUrl"
                            value={addFormData.connectorUatUrl} onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Status URL</label>
                          <input type="text" className="form-control" placeholder="Connector Status URL"
                            name="connectorStatusUrl" value={addFormData.connectorStatusUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Refund URL</label>
                          <input type="text" className="form-control" placeholder="Connector Refund URL"
                            name="connectorRefundUrl" value={addFormData.connectorRefundUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Developer API URL</label>
                          <input type="text" className="form-control" placeholder="Connector Developer API URL"
                            name="connectorDevApiUrl" value={addFormData.connectorDevApiUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>


                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Whitelist IP / Webhook URL</label>
                          <input type="text" className="form-control" placeholder="Whitelist IP / Webhook URL"
                            name="connectorWlIp" value={addFormData.connectorWlIp} onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Whitelist Domain</label>
                          <input type="text" className="form-control" placeholder="Connector Whitelist Domain"
                            name="connectorWlDomain" value={addFormData.connectorWlDomain}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Hard Code Payment URL</label>
                          <input type="text" className="form-control" placeholder="Hard Code Payment URL"
                            name="hardCodePaymentUrl" value={addFormData.hardCodePaymentUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Hard Code Status URL</label>
                          <input type="text" className="form-control" placeholder="Hard Code Status URL"
                            name="hardCodeStatusUrl" value={addFormData.hardCodeStatusUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Hard Code Refund URL</label>
                          <input type="text" className="form-control" placeholder="Hard Code Refund URL"
                            name="hardCodeRefundUrl" value={addFormData.hardCodeRefundUrl}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Processing Tab */}
                  <div className="tab-pane fade" id="processing" role="tabpanel">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Login Credentials</label>
                          <input type="text" className="form-control" placeholder="Connector Login Credentials"
                            name="connectorLoginCreds" value={addFormData.connectorLoginCreds}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Processing Currency</label>
                          <input type="text" className="form-control" placeholder="Connector Processing Currency"
                            name="connectorProcessingCurrency" value={addFormData.connectorProcessingCurrency}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Processing Currency Markup</label>
                          <input type="text" className="form-control" placeholder="Processing Currency Markup"
                            name="processingCurrencyMarkup" value={addFormData.processingCurrencyMarkup}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Refund Policy</label>
                          <input type="text" className="form-control" placeholder="Connector Refund Policy"
                            name="connector_refund_policy" value={addFormData.connector_refund_policy}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Transaction Auto Expired</label>
                          <select className="form-control" name="transAutoExpired" value={addFormData.transAutoExpired}
                            onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Transaction Auto Refund</label>
                          <select className="form-control" name="transAutoRefund" value={addFormData.transAutoRefund}
                            onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">MOP Web</label>
                          <select className="form-control" name="mopWeb" value={addFormData.mopWeb}
                            onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">MOP Mobile</label>
                          <select className="form-control" name="mopMobile" value={addFormData.mopMobile}
                            onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label className="form-label">Technical Comments</label>
                          <textarea className="form-control" placeholder="Technical Comments" name="techCommentsText"
                            value={addFormData.techCommentsText} onChange={handleAddInputChange} rows="3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout UI Tab */}
                  <div className="tab-pane fade" id="checkout" role="tabpanel">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Skip Checkout Validation</label>
                          <select className="form-control" name="skipCheckoutValidation"
                            value={addFormData.skipCheckoutValidation} onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Redirect Popup Message (Web)</label>
                          <textarea className="form-control" placeholder="Redirect Popup Message (Web)"
                            name="redirectPopupMsgWeb" value={addFormData.redirectPopupMsgWeb}
                            onChange={handleAddInputChange} rows="2" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Redirect Popup Message (Mobile)</label>
                          <textarea className="form-control" placeholder="Redirect Popup Message (Mobile)"
                            name="redirectPopupMsgMobile" value={addFormData.redirectPopupMsgMobile}
                            onChange={handleAddInputChange} rows="2" />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Checkout Label Name (Web)</label>
                          <input type="text" className="form-control" placeholder="Checkout Label Name (Web)"
                            name="checkoutLabelNameWeb" value={addFormData.checkoutLabelNameWeb}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Checkout Label Name (Mobile)</label>
                          <input type="text" className="form-control" placeholder="Checkout Label Name (Mobile)"
                            name="checkoutLabelNameMobile" value={addFormData.checkoutLabelNameMobile}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Checkout Sub-Label Name (Web)</label>
                          <input type="text" className="form-control" placeholder="Checkout Sub-Label Name (Web)"
                            name="checkoutSubLabelNameWeb" value={addFormData.checkoutSubLabelNameWeb}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Checkout Sub-Label Name (Mobile)</label>
                          <input type="text" className="form-control" placeholder="Checkout Sub-Label Name (Mobile)"
                            name="checkoutSubLabelNameMobile" value={addFormData.checkoutSubLabelNameMobile}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* JSON Settings Tab */}
                  <div className="tab-pane fade" id="json" role="tabpanel">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Processing Credentials JSON</label>
                          <textarea className="form-control font-monospace" placeholder="Processing Credentials JSON"
                            name="connectorProcessingCredsJson" value={addFormData.connectorProcessingCredsJson}
                            onChange={handleAddInputChange} rows="6" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">E-commerce Cruises JSON</label>
                          <textarea className="form-control font-monospace" placeholder="E-commerce Cruises JSON"
                            name="ecommerceCruisesJson" value={addFormData.ecommerceCruisesJson}
                            onChange={handleAddInputChange} rows="6" />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Merchant Setting JSON</label>
                          <textarea className="form-control font-monospace" placeholder="Merchant Setting JSON"
                            name="merSettingJson" value={addFormData.merSettingJson} onChange={handleAddInputChange}
                            rows="6" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Connector Label JSON</label>
                          <textarea className="form-control font-monospace" placeholder="Connector Label JSON"
                            name="connector_label_json" value={addFormData.connector_label_json}
                            onChange={handleAddInputChange} rows="6" />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Processing Countries JSON</label>
                          <textarea className="form-control font-monospace" placeholder="Processing Countries JSON"
                            name="processingCountriesJson" value={addFormData.processingCountriesJson}
                            onChange={handleAddInputChange} rows="6" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Block Countries JSON</label>
                          <textarea className="form-control font-monospace" placeholder="Block Countries JSON"
                            name="block_countries_json" value={addFormData.block_countries_json}
                            onChange={handleAddInputChange} rows="6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Tab */}
                  <div className="tab-pane fade" id="notifications" role="tabpanel">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Notification Email</label>
                          <input type="email" className="form-control" placeholder="Notification Email"
                            name="notificationEmail" value={addFormData.notificationEmail}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group mb-3">
                          <label className="form-label">Notification Count</label>
                          <input type="number" className="form-control" placeholder="Notification Count"
                            name="notificationCount" value={addFormData.notificationCount}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Auto Status Fetch</label>
                          <select className="form-control" name="autoStatusFetch" value={addFormData.autoStatusFetch}
                            onChange={handleAddInputChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Auto Status Start Time</label>
                          <input type="text" className="form-control" placeholder="Auto Status Start Time"
                            name="autoStatusStartTime" value={addFormData.autoStatusStartTime}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group mb-3">
                          <label className="form-label">Auto Status Interval Time</label>
                          <input type="text" className="form-control" placeholder="Auto Status Interval Time"
                            name="autoStatusIntervalTime" value={addFormData.autoStatusIntervalTime}
                            onChange={handleAddInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group mb-3">
                          <label className="form-label">Cron Bank Status Response</label>
                          <textarea className="form-control" placeholder="Cron Bank Status Response"
                            name="cronBankStatusResponse" value={addFormData.cronBankStatusResponse}
                            onChange={handleAddInputChange} rows="3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={()=> setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                    ) : (
                    'Save Connector'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Connector!</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}>
                  {/* Nav tabs */}
                  <ul className="nav nav-tabs mb-3" id="connectorTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link active" id="basic-tab" data-bs-toggle="tab" data-bs-target="#basic" type="button">Basic Info</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="urls-tab" data-bs-toggle="tab" data-bs-target="#urls" type="button">URLs & Endpoints</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="processing-tab" data-bs-toggle="tab" data-bs-target="#processing" type="button">Processing</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="checkout-tab" data-bs-toggle="tab" data-bs-target="#checkout"
                        type="button" role="tab">Checkout UI</button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link" id="json-tab" data-bs-toggle="tab" data-bs-target="#json" type="button">JSON Settings</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications"
                        type="button" role="tab">Notifications</button>
                    </li>
                  </ul>

                  {/* Tab content */}
                  <div className="tab-content">
                    {/* Basic Info Tab */}
                    <div className="tab-pane fade show active" id="basic" role="tabpanel">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Connector Number *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorNumber || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorNumber: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Connector Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorName || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Default Connector</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.defaultConnector || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, defaultConnector: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">Channel Type</label>
                                <select
                                className="form-control"
                                value={editedConnector.channelType || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, channelType: e.target.value})}
                                >
                                <option value="">Select Type</option>
                                <option value="1">1. ch (e-Check Payment)</option>
                                <option value="2">2. 2d (2D Card Payment)</option>
                                <option value="3">3. 3d (3D Card Payment)</option>
                                <option value="4">4. wa (Wallets Payment)</option>
                                <option value="5">5. upi (UPI Collect)</option>
                                <option value="6">6. nb (Net Banking Payment)</option>
                                <option value="7">7. crypto (Coins Payment)</option>
                                <option value="9">9. upiqr (UPI Collect QR & Intent)</option>
                                <option value="10">10. qr (UPI QR & Intent)</option>
                                <option value="11">11. bt (Bank Transfer)</option>
                                <option value="90">90. np (Network Payment)</option>
                                <option value="99">99. ot (Other Payment)</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Connector Status</label>
                            <select
                              className="form-control"
                              value={editedConnector.connectorStatus || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorStatus: e.target.value})}
                            >
                              <option value="">Select Status</option>
                              <option value="1">Active</option>
                              <option value="0">Inactive</option>
                              <option value="2">Common</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Production Mode</label>
                            <select
                              className="form-control"
                              value={editedConnector.connectorProdMode || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorProdMode: e.target.value})}
                            >
                              <option value="">Select Mode</option>
                              <option value="1">Production</option>
                              <option value="0">Test</option>
                            </select>
                          </div>
                        </div>
                        
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label className="form-label">MCC Code</label>
                                <input
                                type="text"
                                className="form-control"
                                value={editedConnector.mccCode || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, mccCode: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Connection Method</label>
                            <select
                              className="form-control"
                              value={editedConnector.connectionMethod || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectionMethod: e.target.value})}
                            >
                              <option value="">Select Method</option>
                              <option value="1">Direct (Curl Option)</option>
                              <option value="4">Whitelisting IP - Direct</option>
                              <option value="2">Redirect (Get Method)</option>
                              <option value="3">Redirect (Post Method)</option>
                              <option value="5">Whitelisting IP - Redirect</option>
                              <option value="6">Redirect (Curl Option)</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="mb-3">
                            <label className="form-label">Connector Descriptor</label>
                            <textarea
                              className="form-control"
                              value={editedConnector.connectorDescriptor || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorDescriptor: e.target.value})}
                              rows="1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* URLs & Endpoints Tab */}
                    <div className="tab-pane fade" id="urls" role="tabpanel">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Base URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorBaseUrl || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorBaseUrl: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Production URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorProdUrl || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorProdUrl: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector UAT URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorUatUrl || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorUatUrl: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Status URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorStatusUrl || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorStatusUrl: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Refund URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorRefundUrl || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorRefundUrl: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Login Credentials</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorLoginCreds || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorLoginCreds: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Whitelist IP / Webhook URL</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorWlIp || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorWlIp: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Whitelist Domain</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorWlDomain || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorWlDomain: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Tab */}
                    <div className="tab-pane fade" id="processing" role="tabpanel">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Connector Processing Currency</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.connectorProcessingCurrency || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorProcessingCurrency: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Processing Currency Markup</label>
                            <input
                              type="text"
                              className="form-control"
                              value={editedConnector.processingCurrencyMarkup || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, processingCurrencyMarkup: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Transaction Auto Expired</label>
                            <select
                              className="form-control"
                              value={editedConnector.transAutoExpired || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, transAutoExpired: e.target.value})}
                            >
                              <option value="">Select</option>
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Transaction Auto Refund</label>
                            <select
                              className="form-control"
                              value={editedConnector.transAutoRefund || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, transAutoRefund: e.target.value})}
                            >
                              <option value="">Select</option>
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">MOP Web</label>
                            <select
                              className="form-control"
                              value={editedConnector.mopWeb || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, mopWeb: e.target.value})}
                            >
                              <option value="">Select</option>
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">MOP Mobile</label>
                            <select
                              className="form-control"
                              value={editedConnector.mopMobile || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, mopMobile: e.target.value})}
                            >
                              <option value="">Select</option>
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Technical Comments</label>
                            <textarea
                              className="form-control"
                              value={editedConnector.techCommentsText || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, techCommentsText: e.target.value})}
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* Checkout UI Tab */}
                    <div className="tab-pane fade" id="checkout" role="tabpanel">
                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Skip Checkout Validation</label>
                            <select
                                className="form-control"
                                value={editedConnector.skipCheckoutValidation || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, skipCheckoutValidation: e.target.value})}
                            >
                                <option value="">Select Option</option>
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Redirect Popup Message Web</label>
                            <textarea
                                className="form-control"
                                value={editedConnector.redirectPopupMsgWeb || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, redirectPopupMsgWeb: e.target.value})}
                                rows="2"
                            />
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Redirect Popup Message Mobile</label>
                            <textarea
                                className="form-control"
                                value={editedConnector.redirectPopupMsgMobile || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, redirectPopupMsgMobile: e.target.value})}
                                rows="2"
                            />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout Label Name Web</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.checkoutLabelNameWeb || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutLabelNameWeb: e.target.value})}
                            />
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout Label Name Mobile</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.checkoutLabelNameMobile || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutLabelNameMobile: e.target.value})}
                            />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout Sub Label Name Web</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.checkoutSubLabelNameWeb || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutSubLabelNameWeb: e.target.value})}
                            />
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout Sub Label Name Mobile</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.checkoutSubLabelNameMobile || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutSubLabelNameMobile: e.target.value})}
                            />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout UI Version</label>
                            <select
                                className="form-control"
                                value={editedConnector.checkoutUiVersion || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutUiVersion: e.target.value})}
                            >
                                <option value="">Select Version</option>
                                <option value="1">Version 1</option>
                                <option value="2">Version 2</option>
                                <option value="3">Version 3</option>
                            </select>
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout UI Theme</label>
                            <select
                                className="form-control"
                                value={editedConnector.checkoutUiTheme || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutUiTheme: e.target.value})}
                            >
                                <option value="">Select Theme</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="custom">Custom</option>
                            </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Checkout UI Language</label>
                            <select
                                className="form-control"
                                value={editedConnector.checkoutUiLanguage || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, checkoutUiLanguage: e.target.value})}
                            >
                                <option value="">Select Language</option>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                                <option value="it">Italian</option>
                                <option value="pt">Portuguese</option>
                                <option value="ru">Russian</option>
                                <option value="zh">Chinese</option>
                                <option value="ja">Japanese</option>
                            </select>
                            </div>
                        </div>
                        </div>

                    </div>

                    {/* JSON Settings Tab */}
                    <div className="tab-pane fade" id="json" role="tabpanel">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Processing Credentials JSON</label>
                            <textarea
                              className="form-control font-monospace"
                              value={editedConnector.connectorProcessingCredsJson || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, connectorProcessingCredsJson: e.target.value})}
                              rows="6"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">E-commerce Cruises JSON</label>
                            <textarea
                              className="form-control font-monospace"
                              value={editedConnector.ecommerceCruisesJson || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, ecommerceCruisesJson: e.target.value})}
                              rows="6"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Merchant Setting JSON</label>
                            <textarea
                              className="form-control font-monospace"
                              value={editedConnector.merSettingJson || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, merSettingJson: e.target.value})}
                              rows="6"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Processing Countries JSON</label>
                            <textarea
                              className="form-control font-monospace"
                              value={editedConnector.processingCountriesJson || ''}
                              onChange={(e) => setEditedConnector({...editedConnector, processingCountriesJson: e.target.value})}
                              rows="6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notifications Tab */}
                    <div className="tab-pane fade" id="notifications" role="tabpanel">
                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Notification Email</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.notificationEmail || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, notificationEmail: e.target.value})}
                            />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Notification Count</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.notificationCount || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, notificationCount: e.target.value})}
                            />
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Auto Status Fetch</label>
                            <select
                                className="form-control"
                                value={editedConnector.autoStatusFetch || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, autoStatusFetch: e.target.value})}
                            >
                                <option value="">Select Option</option>
                                <option value="1">Enabled</option>
                                <option value="0">Disabled</option>
                            </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Auto Status Start Time</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.autoStatusStartTime || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, autoStatusStartTime: e.target.value})}
                            />
                            </div>
                        </div>
                        </div>

                        <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Auto Status Interval Time</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.autoStatusIntervalTime || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, autoStatusIntervalTime: e.target.value})}
                            />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                            <label className="form-label">Cron Bank Status Response</label>
                            <input
                                type="text"
                                className="form-control"
                                value={editedConnector.cronBankStatusResponse || ''}
                                onChange={(e) => setEditedConnector({...editedConnector, cronBankStatusResponse: e.target.value})}
                            />
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
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

const ConnectorApp = () => {
  const [connectors, setConnectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };

  useEffect(() => {
    if (!getAuthToken()) {
      toast.error("Authentication token not found. Please login again.", {
        toastId: 'auth-error',
        position: "top-center",
        autoClose: 3000,
      });
      // Optionally redirect to login
      return;
    }
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    setIsLoading(true);
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        toast.error("Session expired. Please login again.", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'session-error'
        });
        setIsLoading(false);
        return;
      }

      console.log("Fetching connectors...");
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/connectors/all`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      
      console.log("Connectors response:", response.data);
      
      if (response.data.success) {
        setConnectors(response.data.connectors || []);
      } else {
        console.error("Failed to fetch connectors:", response.data.responseMessage);
        toast.error(response.data.responseMessage || "Failed to fetch connectors", {
          position: "top-center",
          autoClose: 3000,
          toastId: 'fetch-error'
        });
      }
    } catch (error) {
      console.error("Error fetching connectors:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast.error(error.response?.data?.responseMessage || "Failed to fetch connectors", {
        position: "top-center",
        autoClose: 3000,
        toastId: 'fetch-error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConnector = (newConnector) => {
    setConnectors(prevConnectors => [...prevConnectors, newConnector]);
  };

  return (
    <div className="container mt-2">
     
      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading connectors...</p>
        </div>
      ) : (
        <>
          <ConnectorList 
            connectors={connectors} 
            setConnectors={setConnectors} 
            onRefresh={fetchConnectors}
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

export default ConnectorApp;
