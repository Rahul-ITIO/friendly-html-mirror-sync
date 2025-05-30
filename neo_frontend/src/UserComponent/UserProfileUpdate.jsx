    import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import img from "../images/profileIcon.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FaArrowLeft, FaPiggyBank } from "react-icons/fa"; // Import the arrow left icon from Font Awesome


//UserProfileForm is a React component that accepts two props: userId (the ID of the user to be fetched) and handleClose (a function to handle closing the form).
const UserProfileForm = ({ userId, handleClose }) => {
  const [step, setStep] = useState(1);// Manages the current step of the form.
  let navigate = useNavigate();// Provides navigation capabilities within the app
  const user = JSON.parse(sessionStorage.getItem("active-customer"));// Retrieves the currently active customer from session storage.
  const [customer, setCustomer] = useState({});// State for storing customer details.
  const [accountDetail, setAccountDetail] = useState({});// State for storing account details.
  const [commonAccounts, setCommonAccounts] = useState({});
  const [selectedAccount, setSelectedAccount] = useState("");
  const [error, setError] = useState("");
  const [bankDetail, setBankDetail] = useState({});
  const retrieveAllBankUsers = async () => {
    try {
      console.log(userId);
      const id = user?.id ?? userId;// Determines which ID to use (from session storage or props).
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/id?id=` + id
      );// Sends a GET request to fetch user data by ID.
      return response.data;
    } catch (error) {
      // Handle any errors here
      console.error("Error fetching bank managers:", error);
      throw error;
    }
  };

  const fetchAccountData = async () => {
    try {
      // Fetch account data from the server
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${
          user?.id ?? userId
        }`
      );
      // Update the account state with the fetched data
      setAccountDetail(response.data.accounts);
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
  useEffect(() => {
    const getCustomer = async () => {
      const customerRes = await retrieveAllBankUsers();
      if (customerRes) {
        setCustomer(customerRes.users[0]);
      }
      if (customerRes) {
        const customerData = customerRes.users[0];
        console.log(customerData);
        setCustomer(customerData);
        setUser(customerData.userName || "");
        setemail(customerData.email || "");
        setPersonalInfo({
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          email: customerData.email || "",
          contact: customerData.contact || "",
          gender: customerData.gender || "",
          defaultCurrency: customerData.defaultCurrency || "",
          dateOfBirth: customerData.dateOfBirth || "",
        });
        setAddressInfo({
          address: customerData.address || "",
          address2: customerData.address2 || "",
          city: customerData.city || "",
          state: customerData.state || "",
          country: customerData.country || "",
          pincode: customerData.pincode || "",
        });
        setOwnerDetail({
          individualOrCorporate: customerData.individualOrCorporate || "",
          employmentStatus: customerData.employmentStatus || "",
          roleInCompany: customerData.roleInCompany || "",
          businessActivity: customerData.businessActivity || "",
          enterActivity: customerData.enterActivity || "",
          companyName: customerData.companyName || "",
          companyRegistrationNumber:
            customerData.companyRegistrationNumber || "",
          dateOfIncorporation: customerData.dateOfIncorporation || "",
          countryOfIncorporation: customerData.countryOfIncorporation || "",
          companyAddress: customerData.companyAddress || "",
        });
        setCustomerDetail({
          nationality: customerData.nationality || "",
          placeOfBirth: customerData.placeOfBirth || "",
          idType: customerData.idType || "",
          idNumber: customerData.idNumber || "",
          idExpiryDate: customerData.idExpiryDate || "",
          acno: customerData.commonBankAccounts || "",
        });
        try {
          // Fetch account data from the server
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchAccount`
          );
          // Update the account state with the fetched data
          setCommonAccounts(response.data.commonBankAccountDetais);
          setBankDetail(
            response.data.commonBankAccountDetais.filter((account) =>
              customerData.commonBankAccounts.includes(account.iban)
            )
          );
        } catch (error) {
          // Handle error
          console.error("Error fetching account data:", error);
          // Notify error
          // toast.error("Failed to fetch account data", {
          //   position: "top-center",
          //   autoClose: 1000,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          // });
        }
      }
    };

    getCustomer();
    fetchAccountData();
  }, []);
  // States to track completion status of each section
  const [sectionsCompleted, setSectionsCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  console.log();
  const [userName, setUser] = useState(customer.userName || "");
  const [email, setemail] = useState(customer.email || "");
  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: customer.firstName || "",
    lastName: customer.lastName || "",
    email: customer.email || "",
    contact: customer.contact || "",
    gender: customer.gender || "",
    defaultCurrency: customer.defaultCurrency || "",
    dateOfBirth: customer.dateOfBirth || "",
  });

  // Address State
  const [addressInfo, setAddressInfo] = useState({
    address: customer.address || "",
    address2: customer.address2 || "",
    city: customer.city || "",
    state: customer.state || "",
    country: customer.country || "",
    pincode: customer.pincode || "",
  });

  // Owner Detail State
  const [ownerDetail, setOwnerDetail] = useState({
    individualOrCorporate: customer.individualOrCorporate || "",
    employmentStatus: customer.employmentStatus || "",
    roleInCompany: customer.roleInCompany || "",
    businessActivity: customer.businessActivity || "",
    enterActivity: customer.enterActivity || "",
    companyName: customer.companyName || "",
    companyRegistrationNumber: customer.companyRegistrationNumber || "",
    dateOfIncorporation: customer.dateOfIncorporation || "",
    countryOfIncorporation: customer.countryOfIncorporation || "",
    companyAddress: customer.companyAddress || "",
  });

  // Customer Detail State
  const [customerDetail, setCustomerDetail] = useState({
    nationality: customer.nationality || "",
    placeOfBirth: customer.placeOfBirth || "",
    idType: customer.idType || "",
    idNumber: customer.idNumber || "",
    idExpiryDate: customer.idExpiryDate || "",
  });

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all form fields before submitting
    const isValid = validateStep();
    if (!isValid) {
      // If form is not valid, display an error message and return
      toast.error("Please fill in all required fields.");
      return;
    }
    console.log(customer);
    try {
      // Make a POST request to the API endpoint with the user data
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/user/update-profile`,
        customer
      );
      console.log(response.status); // Log response data
      if (response.status === 200) {
        // Display success message to the user
        toast.success("Profile updated successfully.", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
        if (user == null) {
        } else {
          sessionStorage.setItem("active-customer", JSON.stringify(customer));
          sessionStorage.setItem("user-role", JSON.stringify(customer));
        }
        return;
      } else {
        // Handle other status codes if needed
        console.error("Unexpected status code:", response.status);
        toast.error("Failed to update profile. Unexpected status code.");
      }
    } catch (error) {
      // If there was an error with the request, display an error message
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again later.");
    }
  };

  // Function to handle next step
  const nextStep = () => {
    let isValid = validateStep();
    if (isValid) {
      setSectionsCompleted((prev) => ({ ...prev, [step]: true }));
      setStep(step + 1);
    } else {
      // Update completion status of the current section to false
      setSectionsCompleted((prev) => ({ ...prev, [step]: false }));
      setStep(step + 1);
    }
  };

  // Function to handle previous step without validation
  const prevStep = () => {
    setStep(step - 1);
  };

  // Function to validate current step
  const validateStep = () => {
    switch (step) {
      case 1:
        return validatePersonalInfo();
      case 2:
        return validateAddressInfo();
      case 3:
        return validateOwnerDetail();
      case 4:
        return validateCustomerDetail();
      // case 5:
      //   return validateAccountNumber();
      default:
        return true;
    }
  };

  // Function to validate personal info fields
  const validatePersonalInfo = () => {
    const { firstName, lastName, email, contact, gender, defaultCurrency, dateOfBirth } =
      personalInfo;
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      email.trim() !== "" &&
      contact.trim() !== "" &&
      gender.trim() !== "" &&
      defaultCurrency.trim() !== "" &&
      dateOfBirth.trim() !== ""
    );
  };

  // Function to validate address info fields
  const validateAddressInfo = () => {
    const { address, city, state, country, pincode } = addressInfo;
    return (
      address.trim() !== "" &&
      city.trim() !== "" &&
      state.trim() !== "" &&
      country.trim() !== "" &&
      pincode.trim() !== ""
    );
  };

  // Function to validate owner detail fields
  const validateOwnerDetail = () => {
    const {
      individualOrCorporate,
      employmentStatus,
      roleInCompany,
      businessActivity,
      enterActivity,
      companyName,
      companyRegistrationNumber,
      dateOfIncorporation,
      countryOfIncorporation,
      companyAddress,
    } = ownerDetail;
    if (individualOrCorporate === "individual") {
      return employmentStatus.trim() !== "";
    } else if (individualOrCorporate === "corporate") {
      return (
        roleInCompany.trim() !== "" &&
        businessActivity.trim() !== "" &&
        enterActivity.trim() !== "" &&
        companyName.trim() !== "" &&
        companyRegistrationNumber.trim() !== "" &&
        dateOfIncorporation.trim() !== "" &&
        countryOfIncorporation.trim() !== "" &&
        companyAddress.trim() !== ""
      );
    }
    return false; // Return false for other cases
  };

  // Function to validate customer detail fields
  const validateCustomerDetail = () => {
    const { nationality, placeOfBirth, idType, idNumber, idExpiryDate } =
      customerDetail;
    return (
      nationality.trim() !== "" &&
      placeOfBirth.trim() !== "" &&
      idType.trim() !== "" &&
      idNumber.trim() !== "" &&
      idExpiryDate.trim() !== ""
    );
  };

  // Function to handle input change for each section
  const handleChange = (e, category) => {
    const { name, value } = e.target;
    let isSectionCompleted = false;

    switch (category) {
      case "personalInfo":
        console.log("Updating personalInfo");
        setPersonalInfo({ ...personalInfo, [name]: value });
        setCustomer({ ...personalInfo, [name]: value });
        isSectionCompleted = checkSectionCompletion(personalInfo);
        break;
      case "addressInfo":
        console.log("Updating addressInfo");
        setAddressInfo({ ...addressInfo, [name]: value });
        setCustomer({ ...addressInfo, [name]: value });
        isSectionCompleted = checkSectionCompletion(addressInfo);
        break;
      case "ownerDetail":
        console.log("Updating ownerDetail");
        setOwnerDetail({ ...ownerDetail, [name]: value });
        setCustomer({ ...ownerDetail, [name]: value });
        isSectionCompleted = Object.values(ownerDetail).every(
          (field) => field !== ""
        );
        break;
      case "customerDetail":
        console.log("Updating customerDetail");
        setCustomer({ ...customerDetail, [name]: value });
        setCustomerDetail({ ...customerDetail, [name]: value });
        isSectionCompleted = checkSectionCompletion(customerDetail);
        break;
      default:
        break;
    }
    setCustomer({ ...customer, [name]: value });
    console.log(customer);
    // Update completion status of the current section
    setSectionsCompleted((prev) => ({ ...prev, [step]: isSectionCompleted }));
  };

  // Function to check if all fields in a section are filled
  const checkSectionCompletion = (section) => {
    return Object.values(section).every((field) => field !== "");
  };
  // Function to render form content based on the current step

  const handleResetPasswordClick = () => {
    const id = user?.id ?? userId;
    navigate(`/${id}/reset-password`);
  };
  const handleSetup2FA = () => {
    const id = user?.id ?? userId;
    navigate(`/customer/security/${id}`);
  };

  const handleSelectChange = (event) => {
    const newAccount = event.target.value;

    // Split the current commonBankAccounts string into an array
    let commonBankAccountsArray = customer.commonBankAccounts
      ? customer.commonBankAccounts.split(",")
      : [];

    // Add the new account if it isn't already present in the array
    if (!commonBankAccountsArray.includes(newAccount)) {
      commonBankAccountsArray.push(newAccount);
    }

    // Join the array back into a comma-separated string
    const updatedCommonBankAccounts = commonBankAccountsArray.join(",");

    // Update the customer state with the new commonBankAccounts string
    setCustomer({ ...customer, commonBankAccounts: updatedCommonBankAccounts });

    setSelectedAccount(event.target.value);
    setError("");
  };
  const handleChangeBank = (e) => {
    console.log(commonAccounts);
    setCustomer({ ...customer, commonBankAccounts: selectedAccount });
    setBankDetail([selectedAccount]);
    if (selectedAccount) {
      const matchingAccount = commonAccounts.find(
        (account) => account.accountNumber === selectedAccount
      );
      if (matchingAccount) {
        if (
          !commonAccounts.find(
            (account) => account.accountNumber === selectedAccount
          )
        ) {
          setBankDetail([...bankDetail, matchingAccount]);
          setError("");
        } else {
          setError("This account is already added.");
        }
      }
    }
    handleSubmit(e);
  };
  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <div div className="text-color">
            <h3>Personal Information</h3>
            <form onSubmit={nextStep}>
              <div className="row">
                <div className="col">
                  <label htmlFor="firstName">First Name:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="lastName">Last Name:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="email">Email Address:</label>
                </div>
                <div className="col">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="contact">Contact Number:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={personalInfo.contact}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit number"
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="gender">Gender:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="gender"
                    name="gender"
                    value={personalInfo.gender}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="defaultCurrency">Payin Default Currency:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="defaultCurrency"
                    name="defaultCurrency"
                    value={personalInfo.defaultCurrency}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="dateOfBirth">Date of Birth:</label>
                </div>
                <div className="col">
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => handleChange(e, "personalInfo")}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div div className="text-color">
            <h3>Address</h3>
            <form onSubmit={nextStep}>
              <div className="row">
                <div className="col">
                  <label htmlFor="address">Address Line 1:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={addressInfo.address}
                    onChange={(e) => handleChange(e, "addressInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="address2">Address Line 2:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={addressInfo.address2}
                    onChange={(e) => handleChange(e, "addressInfo")}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="city">City:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={addressInfo.city}
                    onChange={(e) => handleChange(e, "addressInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="state">State:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={addressInfo.state}
                    onChange={(e) => handleChange(e, "addressInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="country">Country:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={addressInfo.country}
                    onChange={(e) => handleChange(e, "addressInfo")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="pincode">Postal Code:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={addressInfo.pincode}
                    onChange={(e) => handleChange(e, "addressInfo")}
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        );
      case 3:
        return (
          <div div className="text-color">
            <h3>Owner Detail</h3>
            <form onSubmit={nextStep}>
              <div className="row">
                <div className="col">
                  <label htmlFor="individualOrCorporate">
                    Individual or Corporate:
                  </label>
                </div>
                <div className="col">
                  <select
                    id="individualOrCorporate"
                    name="individualOrCorporate"
                    value={ownerDetail.individualOrCorporate}
                    onChange={(e) => handleChange(e, "ownerDetail")}
                    required
                  >
                    <option value="">Select</option>
                    <option value="individual">Individual</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
              {ownerDetail.individualOrCorporate === "individual" && (
                <div className="row">
                  <div className="col">
                    <label htmlFor="employmentStatus">Employment Status:</label>
                  </div>
                  <div className="col">
                    <select
                      id="employmentStatus"
                      name="employmentStatus"
                      value={ownerDetail.employmentStatus}
                      onChange={(e) => handleChange(e, "ownerDetail")}
                      required
                    >
                      <option value="">Select Employment Status</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-employed">Self-employed</option>
                    </select>
                  </div>
                </div>
              )}
              {ownerDetail.individualOrCorporate === "corporate" && (
                <div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="roleInCompany">Role in Company:</label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="roleInCompany"
                        name="roleInCompany"
                        value={ownerDetail.roleInCompany}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="businessActivity">
                        Business Activity:
                      </label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="businessActivity"
                        name="businessActivity"
                        value={ownerDetail.businessActivity}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="enterActivity">Enter Activity:</label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="enterActivity"
                        name="enterActivity"
                        value={ownerDetail.enterActivity}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="companyName">Company Name:</label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={ownerDetail.companyName}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="companyRegistrationNumber">
                        Company Registration Number:
                      </label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="companyRegistrationNumber"
                        name="companyRegistrationNumber"
                        value={ownerDetail.companyRegistrationNumber}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="dateOfIncorporation">
                        Date of Incorporation:
                      </label>
                    </div>
                    <div className="col">
                      <input
                        type="date"
                        id="dateOfIncorporation"
                        name="dateOfIncorporation"
                        value={ownerDetail.dateOfIncorporation}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="countryOfIncorporation">
                        Country of Incorporation:
                      </label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="countryOfIncorporation"
                        name="countryOfIncorporation"
                        value={ownerDetail.countryOfIncorporation}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label htmlFor="companyAddress">Company Address:</label>
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        id="companyAddress"
                        name="companyAddress"
                        value={ownerDetail.companyAddress}
                        onChange={(e) => handleChange(e, "ownerDetail")}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        );
      case 4:
        return (
          <div div className="text-color">
            <h3>Customer Detail</h3>
            <form onSubmit={nextStep}>
              <div className="row">
                <div className="col">
                  <label htmlFor="nationality">Nationality:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={customerDetail.nationality}
                    onChange={(e) => handleChange(e, "customerDetail")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="placeOfBirth">Place of Birth:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="placeOfBirth"
                    name="placeOfBirth"
                    value={customerDetail.placeOfBirth}
                    onChange={(e) => handleChange(e, "customerDetail")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="idType">ID Type:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="idType"
                    name="idType"
                    value={customerDetail.idType}
                    onChange={(e) => handleChange(e, "customerDetail")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="idNumber">ID Number:</label>
                </div>
                <div className="col">
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={customerDetail.idNumber}
                    onChange={(e) => handleChange(e, "customerDetail")}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="idExpiryDate">ID Expiry Date:</label>
                </div>
                <div className="col">
                  <input
                    type="date"
                    id="idExpiryDate"
                    name="idExpiryDate"
                    value={customerDetail.idExpiryDate}
                    onChange={(e) => handleChange(e, "customerDetail")}
                    required
                  />
                </div>
              </div>
              {user === null && (
                <div className="row">
                  <div className="col">
                    <label htmlFor="status">Status:</label>
                  </div>
                  <div className="col">
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={customerDetail?.status || "None"}
                      onChange={(e) => handleChange(e, "customerDetail")}
                    >
                      <option value="Success">Success</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
          </div>
        );
      case 5:
        return (
          <div div className="text-color">
            <h3>Security</h3>
            <form onSubmit={handleSubmit}>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col">
                    <label htmlFor="resetPassword">Reset Password:</label>
                    <a
                      href="#"
                      id="resetPassword"
                      onClick={handleResetPasswordClick}
                      className="btn btn-link"
                    >
                      Click here to reset your password
                    </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <label htmlFor="setup2FA">
                      Set Up Two-Factor Authentication:
                    </label>
                    <a
                      href="#"
                      id="setup2FA"
                      onClick={handleSetup2FA}
                      className="btn btn-link"
                    >
                      Click here to set up 2FA
                    </a>
                  </div>
                </div>
              </form>
            </form>
          </div>
        );
      case 6:
        return (
          <div className="text-color">
            <h3>Account Details</h3>
            {accountDetail.length > 0 ? (
              <ul className="account-list">
                {accountDetail.map((account, index) => (
                  <li key={index} className="account-list-item">
                    <div className="account-item">
                      <strong>Account Number:</strong> {account.accountNumber}
                    </div>
                    <div className="account-item">
                      <strong>Currency:</strong> {account.currency}
                    </div>
                    <div className="account-item">
                      <strong>Balance:</strong> {account.accountBalance}
                    </div>
                    <div className="account-item">
                      <strong>Status:</strong> {account.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No account details available.</p>
            )}
          </div>
        );
      case 7:
        return (
          <div className="text-color">
            {user === null && (
              <div className="row-2">
                <h3>Add Bank</h3>
                <div className="col">
                  <label htmlFor="bankSelect">Select Bank:</label>
                  <select
                    id="bankSelect"
                    className="form-select"
                    value={selectedAccount}
                    onChange={handleSelectChange}
                  >
                    <option value="">Select a bank</option>
                    {commonAccounts.map((account, index) => (
                      <option key={index} value={account.iban}>
                        {account.bankName} - {account.iban}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col">
                  <button
                    className="btn btn-primary"
                    onClick={handleChangeBank}
                  >
                    <FontAwesomeIcon icon={faPlusCircle} /> Add Bank
                  </button>
                </div>
              </div>
            )}
            {bankDetail.length > 0 ? (
              <ul className="account-list">
                <h3>Added Banks</h3>
                {bankDetail.map((account, index) => (
                  <li key={account.id} className="common-account-list-item">
                    <div className="account-details">
                      <div className="account-detail">
                        <div className="account-item">
                          <strong>Bank Name:</strong> {account.bankName}
                        </div>
                        <div className="account-item">
                          <strong>Beneficiary:</strong> {account.beneficiary}
                        </div>
                        <div className="account-item">
                          <strong>IBAN:</strong> {account.iban}
                        </div>
                        <div className="account-item">
                          <strong>Status:</strong> {account.status}
                        </div>
                        <div className="account-item">
                          <strong>Swift Code:</strong> {account.swiftCode}
                        </div>
                      </div>
                    </div>
                    <div className="account-icon">
                      <FontAwesomeIcon icon={faUniversity} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No account details available.</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Function to handle tab click and switch steps
  const handleTabClick = (selectedStep) => {
    setStep(selectedStep);
  };
  return (
    <div className="container_2">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn"
            onClick={() => {
              console.log("Close button clicked");
              handleClose();
            }}
          >
            <FaArrowLeft /> Back
          </button>
          <h4 className="text-color text-center flex-grow-1 mb-0">
            Update Profile
          </h4>
          <div className="dummy-space"></div>
        </div>
        <div className=" text-color1 profile-header">
          <div className="user-info d-flex align-items-center mt-3 mb-3">
            <img
              src={img}
              alt="User"
              className="user-image rounded-circle"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                marginRight: "20px",
              }}
            />
            &nbsp;&nbsp;&nbsp;
            <div>
              <h2 className="user-name  mb-0 ">{userName}</h2>
              <p className="user-email mb-0">{email}</p>
            </div>
          </div>
          <ul className="nav nav-tabs justify-content-center text-color1">
            {[
              { label: "Personal Detail", step: 1 },
              { label: "Address Detail", step: 2 },
              { label: "Owner Detail", step: 3 },
              { label: "Customer Detail", step: 4 },
              { label: "Security Info", step: 5 },
              { label: "Accounts Info", step: 6 },
              { label: "Assign Banks", step: 7 },
            ].map(({ label, step: tabStep }) => (
              <li className="nav-item" key={tabStep}>
                <button
                  className={`nav-link ${step === tabStep ? "active" : ""}`}
                  onClick={() => handleTabClick(tabStep)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body user-info">
          <div className="form-content">{renderForm()}</div>
        </div>
        <div className="card-footer d-flex justify-content-between">
          {step !== 1 && (
            <button className="btn btn-secondary" onClick={prevStep}>
              Previous
            </button>
          )}
          {step !== 5 && step !== 6 && step !== 7 && (
            <div>
              <button className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
              &nbsp;
              <button
                className="btn btn-success"
                type="submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          )}
          {/* {step === 5 && ( */}

          {/* )} */}
        </div>
      </div>
    </div>
  );
};
export default UserProfileForm;
