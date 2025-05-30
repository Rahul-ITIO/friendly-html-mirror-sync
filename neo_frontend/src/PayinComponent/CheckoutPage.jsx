import React, { useState, useEffect } from "react";
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import "./CheckoutPage.css";

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  RUB: '₽',
  AED: 'د.إ',
  // Add more as needed
};

const CheckoutPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('10');
  const [expiryYear, setExpiryYear] = useState('31');
  const [cvv, setCvv] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showBillAmount, setShowBillAmount] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [billAmount, setBillAmount] = useState(1.0);
  const [showBillAmountModal, setShowBillAmountModal] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [tempBillAmount, setTempBillAmount] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    fullname: 'Test Full Name',
    bill_email: 'test2854@test.com',
    bill_phone: '919828142854',
    bill_address: '161 Kallang Way New Delhi Delhi IN',
    bill_city: 'Circleville 22',
    bill_country: 'US',
    bill_state: 'Utah',
    bill_zip: '847236'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    billAddress: '',
    billCity: '',
    billCountry: '',
    billState: '',
    billZip: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [userDetails, setUserDetails] = useState([]);
  const [selectedPublicKey, setSelectedPublicKey] = useState('');
  const [billAmt, setBillAmt] = useState('');
  const [terminalDetails, setTerminalDetails] = useState([]);
  const [showNextStep1, setShowNextStep1] = useState(false);
  const [showNextStep2, setShowNextStep2] = useState(false);

  useEffect(() => {
    const fetchUserAndTerminals = async () => {
      const pathParts = window.location.pathname.split('/');
      const userName = pathParts[2];
      const billAmtFromUrl = pathParts[3];
      if (billAmtFromUrl && !isNaN(billAmtFromUrl)) {
        setBillAmt(billAmtFromUrl);
        setBillAmount(Number(billAmtFromUrl));
      }
      if (userName) {
        try {
          // No Authorization header for this request
          const userRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/user/fetchusername/${userName}`);
          const user = userRes.data;
          if (user && user.id) {
            setShowNextStep1(true);
            setUserDetails(user);
            const terminalsRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/terminals/search/merid/${user.id}`);
            setTerminalDetails(terminalsRes.data);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUserAndTerminals();
  }, []);

  const handleEditCustomerInfo = () => {
    setEditedInfo({
      fullname: customerForm.fullName,
      bill_email: customerForm.emailAddress,
      bill_phone: customerForm.mobileNumber,
      bill_address: customerForm.billAddress,
      bill_city: customerForm.billCity,
      bill_country: customerForm.billCountry,
      bill_state: customerForm.billState,
      bill_zip: customerForm.billZip
    });
    setIsEditing(true);
  };

  const handleSaveCustomerInfo = () => {
    const updatedForm = {
      fullName: editedInfo.fullname,
      emailAddress: editedInfo.bill_email,
      mobileNumber: editedInfo.bill_phone,
      billAddress: editedInfo.bill_address,
      billCity: editedInfo.bill_city,
      billCountry: editedInfo.bill_country,
      billState: editedInfo.bill_state,
      billZip: editedInfo.bill_zip
    };
    
    setCustomerForm(updatedForm);
    setCustomerInfo(editedInfo);
    setIsEditing(false);
    setShowCustomerInfoModal(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!customerForm.fullName) errors.fullName = 'Full Name is required';
    if (!customerForm.mobileNumber) errors.mobileNumber = 'Mobile Number is required';
    if (!customerForm.emailAddress) errors.emailAddress = 'Email Address is required';
    if (!customerForm.billAddress) errors.billAddress = 'Billing Address is required';
    if (!customerForm.billCity) errors.billCity = 'City is required';
    if (!customerForm.billCountry) errors.billCountry = 'Country is required';
    if (!customerForm.billState) errors.billState = 'State is required';
    if (!customerForm.billZip) errors.billZip = 'ZIP Code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value, type = 'form') => {
    if (type === 'form') {
      setCustomerForm(prev => ({
        ...prev,
        [field]: value
      }));
      // Clear error when user types
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    } else if (type === 'edit') {
      setEditedInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitCustomerDetails = async () => {
    if (validateForm()) {
      setCustomerInfo(customerForm);
      // await axios.get('/checkout', { params: customerForm });
      setShowPaymentOptions(true);
    }
  };

  const paymentOptions = [
    {
      id: '52',
      mop: 'card',
      icon: '💳',
      title: '52 - 3D Secure Card Payment - Visa Card',
      subtitle: 'Authenticate Your 3Ds Payments Securely',
      logo: '/visa.png'
    },
    {
      id: '782',
      mop: 'qrcode_and_upi',
      icon: '📱',
      title: '782 All UPI Payment',
      subtitle: 'vimPhonePeGpayPaytm_qr_code'
    },
    {
      id: '130',
      mop: 'qrcode',
      icon: '💎',
      title: '130 : TON',
      subtitle: 'Choose this option if you already have TON',
      description: 'Cryptocurrency | Minimum Transaction Value $25'
    },
    {
      id: '12',
      mop: 'qrcode',
      icon: '💰',
      title: '12 - Volet eWallet',
      subtitle: 'Choose this option if you already have Volet Wallet',
      description: 'BTC, USDT, LTC, ETH and Many More'
    },
    {
      id: '125',
      mop: 'qrcode',
      icon: '🔸',
      title: '125 - BNB',
      subtitle: 'Choose this option if you already have BNB',
      description: 'Cryptocurrency | Minimum Transaction Value $20'
    }
  ];

  const handleBackButton = () => {
    setSelectedOption(null);
    setShowQR(false);
  };

  const handleChangeBillAmount = () => {
    if (tempBillAmount && !isNaN(tempBillAmount)) {
      setBillAmount(parseFloat(tempBillAmount));
      setShowBillAmountModal(false);
    }
  };

  // Dynamically get bill_amt from URL and handle form error
  React.useEffect(() => {
    const url = window.location.href;
    const params = new URL(url).searchParams;
    // Set billAmount from last bill_amt param
    //const allBillAmts = params.getAll('bill_amt');
    //const bill_amt = allBillAmts[allBillAmts.length - 1];
    const bill_amt = params.get('bill_amt') || '';
    
    if (bill_amt) {
      setBillAmount(parseFloat(bill_amt));
    } else {
      setFormErrors(prev => ({ ...prev, bill_amt: 'Bill amount is required' }));
    }
    // Pre-fill customer form fields from URL if present
    setCustomerForm(prev => ({
      ...prev,
      fullName: params.get('fullname') || '',
      emailAddress: params.get('bill_email') || '',
      mobileNumber: params.get('bill_phone') || '',
      billAddress: params.get('bill_address') || '',
      billCity: params.get('bill_city') || '',
      billCountry: params.get('bill_country') || '',
      billState: params.get('bill_state') || '',
      billZip: params.get('bill_zip') || ''
    }));
  }, []);

  const handlePayClick = (e) => {
    e.preventDefault();
    if (!selectedPublicKey || !billAmt) {
      alert("Please select a terminal and enter an amount.");
      return;
    }
    setShowNextStep2(true);
    setShowNextStep1(false);
    // You can adjust the URL as needed for your integration
    // const url = `/checkout/${selectedPublicKey}/${billAmt}/`;
    // window.open(url, "_blank");
  };

  const renderHeader = (selectedOption) => (
    <div className="checkout-header">
      <div className="header-content">
        <div className="header-left">
          <div className="circle">5</div>
          <div className="header-text">
            <h6 className="mb-1">52 - Borderless</h6>
            <h5 className="mb-1">3D Card Payment</h5>
            <h3 className="mb-0">$ {billAmount.toFixed(2)}</h3>
          </div>
        </div>
        <div className="header-buttons">
          <button 
            className="header-action-btn"
            onClick={() => setShowCustomerInfoModal(true)}
          >
            Edit Customer Information
          </button>
          <button 
            className="header-action-btn"
            onClick={() => {
              setTempBillAmount(billAmount.toString());
              setShowBillAmountModal(true);
            }}
          >
            Change Bill Amount
          </button>
          {selectedOption && (
            <button 
              className="change-payment-btn"
              onClick={handleBackButton}
            >
              Change Payment Method
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderPaymentOptions = () => (
    <div className="container py-4">
      <h5 className="mb-4">CARDS, UPI & MORE</h5>
      <div className="payment-options">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            className="payment-option"
            onClick={() => setSelectedOption(option)}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="option-icon">{option.icon}</span>
              <div>
                <h6 className="mb-1">{option.title}</h6>
                <p className="text-muted small mb-0">{option.subtitle}</p>
                {option.description && (
                  <small className="text-muted d-block">{option.description}</small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentContent = () => {
    if (!selectedOption) return null;

    const commonHeader = (
      <div className="payment-header-purple hide1">
        <div className="header-content1">
          <button 
            className="change-payment-btn"
            onClick={handleBackButton}
          >
           <FaArrowLeft style={{ marginRight: '8px' }} /> Change Payment Method {selectedOption.title}
          </button>
        </div>
      </div>
    );

    const backButton = (
      <div className="back-section">
        <button className="back-button" onClick={handleBackButton}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="payment-title d-flex align-items-center gap-3">
          <span className="option-icon">{selectedOption.icon}</span>
          <div>
            <h6 className="mb-1">{selectedOption.title}</h6>
            <small className="text-muted">{selectedOption.subtitle}</small>
          </div>
        </div>
      </div>
    );

    switch (selectedOption.mop) {
      case 'card':
        return (
          <div className="card-payment-form">
            {commonHeader}
            {backButton}
            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="5438 8980 1456 0229"
                  className="form-control"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>MM</label>
                  <select 
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    className="form-select"
                  >
                    <option value="10">10</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>YY</label>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    className="form-select"
                  >
                    <option value="31">31</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="form-control"
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="payment-footer">
                <div className="amount-section">
                  <span>$ {billAmount.toFixed(2)}</span>
                </div>
                <button className="btn btn-primary pay-button">Pay</button>
              </div>
            </div>
          </div>
        );

      case 'qrcode_and_upi':
        return (
          <div className="upi-payment-form">
            {commonHeader}
            {backButton}
            <div className="qr-section text-center p-4">
              {!showQR ? (
                <button 
                  className="btn btn-primary show-qr-btn"
                  onClick={() => setShowQR(true)}
                >
                  Show QR
                </button>
              ) : (
                <>
                  <div className="qr-container mx-auto mb-3">
                    <img 
                      src="/qr-sample.png"
                      alt="QR Code"
                      className="img-fluid"
                    />
                  </div>
                  <p className="text-muted mb-2">Scan the QR using any UPI app on your phone.</p>
                  <div className="supported-apps">
                    <img src="/gpay.png" alt="Google Pay" className="me-2" />
                    <img src="/phonepe.png" alt="PhonePe" className="me-2" />
                    <img src="/paytm.png" alt="Paytm" className="me-2" />
                  </div>
                </>
              )}
            </div>

            <div className="payment-footer">
              <div className="amount-section">
                <span>$ {billAmount.toFixed(2)}</span>
                
              </div>
              <button className="btn btn-primary pay-button">Pay</button>
            </div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="crypto-payment-form">
            {commonHeader}
            {backButton}
            <div className="qr-section text-center p-4">
              {!showQR ? (
                <button 
                  className="btn btn-primary show-qr-btn"
                  onClick={() => setShowQR(true)}
                >
                  Show QR
                </button>
              ) : (
                <>
                  <div className="qr-container mx-auto mb-3">
                    <img 
                      src="/crypto-qr.png"
                      alt="Crypto QR Code"
                      className="img-fluid"
                    />
                  </div>
                  <p className="text-muted mb-2">Scan QR code to pay with {selectedOption.title}</p>
                  <div className="crypto-details">
                    <p className="mb-1">Network: {selectedOption.title}</p>
                    <p className="mb-1">Minimum Amount: {selectedOption.description}</p>
                  </div>
                </>
              )}
            </div>

            <div className="payment-footer">
              <div className="amount-section">
                <span>$ {billAmount.toFixed(2)}</span>
               
              </div>
              <button className="btn btn-primary pay-button">Pay</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCustomerDetailsForm = () => (
    <div className="customer-details-form">
      <div className="payment-header-purple">
        <div className="header-content">
          <div className="left-content">
            <div className="circle">1</div>
            <div className="text">
              <h6>Paying to 12 & 121 - 130 | </h6>
              <h5>volet</h5>
              <h4><span className="curr_symbol">{userDetails.defaultCurrency && (currencySymbols[userDetails.defaultCurrency] || userDetails.defaultCurrency)} {billAmount.toFixed(2)}</span></h4>
            </div>
          </div>
        </div>
      </div>

      
      {showNextStep1 && terminalDetails && Array.isArray(terminalDetails) && terminalDetails.length > 0 && (
        <div className="form-container next_step_1 p-4">
          <div className="transaction-status-card approved hover_zoom_22 col-md-12" style={{ padding: "32px" }} >
            <div className="transaction-status-badge" title="Currency">
              {userDetails.defaultCurrency} - {userDetails.defaultCurrency && (currencySymbols[userDetails.defaultCurrency] || userDetails.defaultCurrency)}
            </div>
            <div className="transaction-status-amount row d-flex justify-content-center p-0 m-0 g-1 " title="Total Approved" style={{ height: "auto" }}>
              <div className="col-md-12">
                <select
                  name="public_key"
                  className="form-control col-md-12"
                  value={selectedPublicKey}
                  onChange={e => setSelectedPublicKey(e.target.value)}
                >
                  <option value="">Terminal Public Key</option>
                  {terminalDetails.filter(terminal => terminal.active === 1).map((terminal) => (
                    <option key={terminal.id} value={terminal.publicKey}>
                      {terminal.terName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-12">
                <div className="input-group">
                  <span className="input-group-text py-0" style={{ height: "48px" }}>
                    {userDetails.defaultCurrency && (currencySymbols[userDetails.defaultCurrency] || userDetails.defaultCurrency)}
                  </span>
                  <input
                    type="text"
                    name="bill_amt"
                    className="form-control"
                    value={billAmt}
                    onChange={e => {
                      setBillAmt(e.target.value);
                      if (!isNaN(e.target.value) && e.target.value !== '') {
                        setBillAmount(Number(e.target.value));
                      }
                    }}
                    title="Enter Amount"
                    placeholder="Amt"
                  />
                </div>
              </div>
              <div className="col-md-12">
                <button className="form-control btn btn-primary" onClick={handlePayClick}>PAY</button>
              </div>
            </div>

          </div>
        </div>
      )}
        

        {showNextStep2 && (
          <div className="form-container next_step_2 p-4">
            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                placeholder="Full Name"
                value={customerForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
              {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                className={`form-control ${formErrors.mobileNumber ? 'is-invalid' : ''}`}
                placeholder="Mobile Number"
                value={customerForm.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              />
              {formErrors.mobileNumber && <div className="invalid-feedback">{formErrors.mobileNumber}</div>}
            </div>

            <div className="form-group">
              <input
                type="email"
                className={`form-control ${formErrors.emailAddress ? 'is-invalid' : ''}`}
                placeholder="Email Address"
                value={customerForm.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
              />
              {formErrors.emailAddress && <div className="invalid-feedback">{formErrors.emailAddress}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.billAddress ? 'is-invalid' : ''}`}
                placeholder="Bill Address"
                value={customerForm.billAddress}
                onChange={(e) => handleInputChange('billAddress', e.target.value)}
              />
              {formErrors.billAddress && <div className="invalid-feedback">{formErrors.billAddress}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.billCity ? 'is-invalid' : ''}`}
                placeholder="Bill City"
                value={customerForm.billCity}
                onChange={(e) => handleInputChange('billCity', e.target.value)}
              />
              {formErrors.billCity && <div className="invalid-feedback">{formErrors.billCity}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.billCountry ? 'is-invalid' : ''}`}
                placeholder="Bill Country"
                value={customerForm.billCountry}
                onChange={(e) => handleInputChange('billCountry', e.target.value)}
              />
              {formErrors.billCountry && <div className="invalid-feedback">{formErrors.billCountry}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.billState ? 'is-invalid' : ''}`}
                placeholder="Bill State"
                value={customerForm.billState}
                onChange={(e) => handleInputChange('billState', e.target.value)}
              />
              {formErrors.billState && <div className="invalid-feedback">{formErrors.billState}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={`form-control ${formErrors.billZip ? 'is-invalid' : ''}`}
                placeholder="Bill Zip"
                value={customerForm.billZip}
                onChange={(e) => handleInputChange('billZip', e.target.value)}
              />
              {formErrors.billZip && <div className="invalid-feedback">{formErrors.billZip}</div>}
            </div>

            <button 
              className="btn btn-primary w-100 next-button"
              onClick={handleSubmitCustomerDetails}
            >
              Next
            </button>
          </div>
        )}

      <div className="view-details-footer">
        <button className="btn btn-link" onClick={() => setShowDetails(!showDetails)}>
          View Details
        </button>
        <div className="powered-by">Powered by Paywb</div>
      </div>
    </div>
  );

  
  return (
    <div className="checkout-container cc">
      {!showPaymentOptions ? (
        renderCustomerDetailsForm()
      ) : (
        <>
          {renderHeader(selectedOption)}
          <div className="main-content">
            {!selectedOption ? renderPaymentOptions() : renderPaymentContent()}
          </div>
        </>
      )}
      
      {/* Bill Amount Modal */}
      {showBillAmountModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h6>Change Bill Amount</h6>
              <button onClick={() => setShowBillAmountModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  className="form-control"
                  value={tempBillAmount}
                  onChange={(e) => setTempBillAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBillAmountModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleChangeBillAmount}
              >
                Update Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Information Modal */}
      {showCustomerInfoModal && (
        <div className="modal-overlay">
          <div className="modal-content customer-info-modal">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <i className="fas fa-user-circle me-2"></i>
                <h6 className="mb-0">Customer Information</h6>
              </div>
              <div className="modal-actions">
                {!isEditing && (
                  <button 
                    className="edit-btn me-2"
                    onClick={handleEditCustomerInfo}
                  >
                    Edit
                  </button>
                )}
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowCustomerInfoModal(false);
                    setIsEditing(false);
                    setEditedInfo();
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <form className="customer-info-form">
                <div className="row fs-6 row-cols-xl-2 gy-0 gx-1 p-0 m-0">
                  <div className="form-group p-0 m-0 pe-1">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.fullname}
                        onChange={(e) => handleInputChange('fullname', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.fullName}</p>
                    )}
                  </div>
                  <div className="form-group p-0 m-0 pe-1">
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="form-control"
                        value={editedInfo.bill_email}
                        onChange={(e) => handleInputChange('bill_email', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.emailAddress}</p>
                    )}
                  </div>
                
                  <div className="form-group p-0 m-0 pe-1">
                    <label>Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="form-control"
                        value={editedInfo.bill_phone}
                        onChange={(e) => handleInputChange('bill_phone', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.mobileNumber}</p>
                    )}
                  </div>
                  <div className="form-group p-0 m-0 pe-1">
                    <label>Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.bill_address}
                        onChange={(e) => handleInputChange('bill_address', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.billAddress}</p>
                    )}
                  </div>
                
                  <div className="form-group p-0 m-0 pe-1">
                    <label>City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.bill_city}
                        onChange={(e) => handleInputChange('bill_city', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.billCity}</p>
                    )}
                  </div>
                  <div className="form-group p-0 m-0 pe-1">
                    <label>State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.bill_state}
                        onChange={(e) => handleInputChange('bill_state', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.billState}</p>
                    )}
                  </div>
                
                  <div className="form-group p-0 m-0 pe-1">
                    <label>Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.bill_country}
                        onChange={(e) => handleInputChange('bill_country', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.billCountry}</p>
                    )}
                  </div>
                  <div className="form-group p-0 m-0 pe-1">
                    <label>ZIP Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editedInfo.bill_zip}
                        onChange={(e) => handleInputChange('bill_zip', e.target.value, 'edit')}
                      />
                    ) : (
                      <p className="form-control-static mb-2">{customerForm.billZip}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            {isEditing && (
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedInfo();
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveCustomerInfo}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="checkout-footer">
        <div className="view-customer-info">
          <button 
            className="view-info-btn"
            onClick={() => setShowCustomerInfoModal(true)}
          >
            View Customer Info
          </button>
        </div>
        <div className="powered-by">
          <small className="text-muted">Powered by api.proneo.oyefin.com</small>
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
