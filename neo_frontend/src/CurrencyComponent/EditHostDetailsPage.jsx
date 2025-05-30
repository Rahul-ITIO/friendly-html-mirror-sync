import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // Import useHistory
import axios from "axios";
import img from "../images/logo.png";
import { ToastContainer, toast } from "react-toastify";
import { FaSave, FaCamera } from "react-icons/fa";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
const EditHostDetailsPage = () => {
  // The default image filename and URL
  const imageFileName = '19_1_1712740180419_old.png'; // Replace with your actual image filename

  const imageUrl = "http://localhost:8080/images/Logo_abc.png"; // Your image URL
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  const [selectedImage, setSelectedImage] = useState(null);// To store the selected image file
  const [profileImg, setProfileImg] = useState(null);// To store the profile image URL
  const [hostDetails, setHostDetails] = useState({
    logo: "",
    shortName: "",
    longName: "",
    contact: "",
    email: "",
    address: "",
    headerColor: "",
    sidebarColor: "",
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
  });
  // Fetch host details and profile image when the component mounts
  useEffect(() => {
    fetchHostDetails();// Fetch host details from the server
    const getImg = async () => {
      try {
        // Dynamically import the logo image
        const img = await import(`../customerPhotos/${hostDetails.logo}`);
        setProfileImg(img.default);
        setSelectedImage(img.default)// Set the selected image to the fetched one

      } catch (error) {
        console.error('Error loading image:', error);
        setProfileImg(img);// Use default image if fetching fails
      }
    };
    getImg();
  }, []);// Empty dependency array means this runs only once when the component mounts

  // Fetch host details from the server
  const fetchHostDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchHostDetail`
      );
      setHostDetails(response.data.hostingDetail);
      const img = await import(`../images/${response.data.hostingDetail.logo}`);
      setProfileImg(img.default);
      console.log(response);
      // history.push(history.location.pathname);
    } catch (error) {
      setProfileImg(img);
      console.error("Error fetching host details:", error);
    }
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHostDetails({
      ...hostDetails,
      [name]: value,
    });
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(); // Create a new FormData object

      // Append the image to the FormData object
      if (selectedImage === null) {
        formData.append('image', img);
      } else {
        formData.append('image', selectedImage);
      }
      // Append other values from hostDetails
      formData.append('logo', hostDetails.logo);
      formData.append('shortName', hostDetails.shortName);
      formData.append('longName', hostDetails.longName);
      formData.append('contact', hostDetails.contact);
      formData.append('email', hostDetails.email);
      formData.append('address', hostDetails.address);
      formData.append('headerColor', hostDetails.headerColor + "");
      formData.append('sidebarColor', hostDetails.sidebarColor + "");
      formData.append('smtpHost', hostDetails.smtpHost);
      formData.append('smtpPort', hostDetails.smtpPort);
      formData.append('smtpUsername', hostDetails.smtpUsername);
      formData.append('smtpPassword', hostDetails.smtpPassword);

      console.log(formData)
      // Send the form data to the server
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/updateHostDetail`,
        formData
      );
      // Optionally, show success message or redirect to another page
      toast.success("update Hosting Detail successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error deleting update Hosting Detail:", error);
      // Handle error
    }
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    console.log(event);
    setSelectedImage(file);
  };

  return (
    <div className="container bg-white">
      <div>
        <div >
          <div className="card-header custom-bg-text text-center">
            <h3 className=" text-color text-primary" >Edit Host Details</h3>
          </div>
          <div
            className="card-body d-flex flex-column"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="mb-2">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                      <div className="d-flex align-items-center">
                        <span className="logo-label">Logo</span>

                        <div className="img-container ms-3">
                          {selectedImage ? (
                            <img
                              src={URL.createObjectURL(selectedImage)}
                              alt="Profile"
                              className="logo-image" height="50" width="50"
                            />
                          ) : hostDetails && hostDetails.logo ? (
                            <img
                              src={profileImg}
                              alt="Profile"
                              className="img-fluid logo-image"
                            />
                          ) : (
                            <img
                              src={img}
                              alt="Profile"
                              className="img-fluid logo-image"
                            />
                          )}
                        </div>

                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Host Short Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="shortName"
                            name="shortName"
                            value={hostDetails.shortName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Host Full Name:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="longName"
                            name="longName"
                            value={hostDetails.longName}
                            onChange={handleInputChange}
                          />
                        </div>{" "}
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Contact Number:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="contact"
                            name="contact"
                            value={hostDetails.contact}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email ID</label>
                          <input
                            type="text"
                            className="form-control"
                            id="email"
                            name="email"
                            value={hostDetails.email}
                            onChange={handleInputChange}
                          />
                        </div>{" "}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="address">Address:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          value={hostDetails.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">SideBar Color:</label>
                          <input
                            type="text"
                            className="form-control"
                            id="sidebarColor"
                            name="sidebarColor"
                            value={hostDetails.sidebarColor}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Header Color</label>
                          <input
                            type="text"
                            className="form-control"
                            id="headerColor"
                            name="headerColor"
                            value={hostDetails.headerColor}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="accordion" id="smtpAccordion">
                        <div className="accordion-item">

                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#smtpCollapse"
                            aria-expanded="true"
                            aria-controls="smtpCollapse"
                          >
                            SMTP Satting
                          </button>
                          <div
                            id="smtpCollapse"
                            className="accordion-collapse collapse show"
                            aria-labelledby="smtpHeader"
                            data-bs-parent="#smtpAccordion"
                          >
                            <div className="accordion-body">
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <label
                                    htmlFor="smtpHost"
                                    className="form-label"
                                  >
                                    Host:
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="smtpHost"
                                    name="smtpHost"
                                    value={hostDetails.smtpHost}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label
                                    htmlFor="smtpPort"
                                    className="form-label"
                                  >
                                    Port:
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="smtpPort"
                                    name="smtpPort"
                                    value={hostDetails.smtpPort}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <label
                                    htmlFor="smtpUsername"
                                    className="form-label"
                                  >
                                    Username:
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="smtpUsername"
                                    name="smtpUsername"
                                    value={hostDetails.smtpUsername}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label
                                    htmlFor="smtpPassword"
                                    className="form-label"
                                  >
                                    Password:
                                  </label>
                                   <div className="position-relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="smtpPassword"
                                    name="smtpPassword"
                                    value={hostDetails.smtpPassword}
                                    onChange={handleInputChange}
                                  />
                                  <span
                                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {showPassword ? <VisibilityOffIcon className="text-primary" size={18} /> : <VisibilityIcon  className="text-primary" size={18} />}
                                  </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      &nbsp;<button type="submit" className="btn btn-primary" style={{ marginTop: "4px" }}>
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHostDetailsPage;
