import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import img from '../images/profileIcon.png';
import { ToastContainer, toast } from "react-toastify";
import { FaSave,FaCamera } from 'react-icons/fa'; // Import the save icon from react-icons/fa
import UserProfileUpdate from "../UserComponent/UserProfileUpdate";


const UserProfile = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const user = JSON.parse(sessionStorage.getItem("active-customer"));
  const [profileImg, setProfileImg] = useState(null);
  const [showButton, setShowButton] = useState(true);
  const [showModal, setShowModal] = useState(false);


  // Function to retrieve customer data from the server
  const retrieveCustomerData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/user/fetch/id?id=${user.id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getCustomer = async () => {
      const customerData = await retrieveCustomerData();
      if (customerData) {
        setCustomer(customerData.users[0]);
        if (customerData.users[0].profileImg) {
          try {
            const img = await import(`../customerPhotos/${customerData.users[0].profileImg}`);
            setProfileImg(img.default);
          } catch (error) {
            console.error('Error loading image:', error);
            setProfileImg(img);
          }
        } else {
          setProfileImg(img);
        }
      }
    };
    getCustomer();
  }, []);

  // Function to navigate to the update profile page
  const navigateToUpdateProfilePage = () => {
    navigate('/customer/profile/update', { state: customer });
  };

  // Function to handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    console.log(event);
    setSelectedImage(file);
    setShowButton(true)
  };

  // Function to save the selected image
  const saveImage = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', customer.id);
      formData.append('image', selectedImage);

      // Send POST request to the server to upload the image
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/user/upload-profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status===200) {
        console.log("Got the success response");
        setShowButton(false);
        toast.success("Update Image Successfully", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          // window.location.reload(true);
        }, 1000); // Redirect after 3 seconds
      } else {
        console.log("Didn't got success response");
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          // window.location.reload(true);
        }, 1000); // Redirect after 3 seconds
      }

      // Log the response (or handle it as needed)
      console.log("Image uploaded:", response.data);

    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  const handleCloseEditForm = () => {
    // setEditTransaction("");
    setShowModal(false);
  };
  const showProfile = () => {
    // setEditTransaction("");
    setShowModal(true);
  };
  return (
    <div className="container">
      <div className="mt_2" style={{ display: showModal ? "none" : "block" }}>
      <div className="row justify-content-center">
        <div className=" col-md-8">
          <div className=" card bg-light shadow rounded-lg">
            <div className="img-fluid card-header custom-bg-text text-center">
              <h4 className=" text-color " >Customer Profile</h4>
            </div>
            <div className=" card-body d-flex align-items-top">
              <div className="col-md-4 text-center"style={{marginTop:'20px' }} >
               <div >
                <label className="camera-input">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control mt-3 d-none" // Hide the file input
                    onChange={handleImageChange}
                  />
                  <FaCamera className="camera-icon" />
                </label>
                </div>
                <div className="img-container">
                  {selectedImage ? (
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Profile"
                      className="img-fluid profile-image"
                    />
                  ) : customer && customer.profileImg ? (
                    <img
                      src={profileImg}
                      alt="Profile"
                      className=" img-fluid profile-image"
                    />
                  ) : (
                    <img
                      src={img}
                      alt="Profile"
                      className="img-fluid profile-image"
                    />
                  )}
                {/* Input for selecting image with camera icon */}
                {selectedImage && showButton && (
                  <button className=" img-fluid btn btn-primary btn-lg mt-3" onClick={saveImage}>
                    <FaSave className="me-2" />
                    Save Image
                  </button>
                )}
                </div>
              </div>
              <div className="col-md-2"></div>
              <div className="col-md-6">
                <div style={{ marginLeft: '10px' }}>
                  <p className="row"><b className="col-md-5">Name:</b> <div className="col">{customer.name}</div></p>
                  <p className="row"><b className="col-md-5">Email:</b> <div className="col">{customer.email}</div></p>
                  <p className="row"><b className="col-md-5">Contact:</b> <div className="col">{customer.contact}</div></p>
                  <p className="row"><b className="col-md-5">Gender:</b> <div className="col">{customer.gender}</div></p>
                  <p className="row"><b className="col-md-5">Address:</b> <div className="col">{customer.address}</div></p>
                  <p className="row"><b className="col-md-5 ">Account Balance:</b> <div className="col">Rs. {customer.accountBalance}</div></p>
                </div >
                &nbsp;<button style={{ marginLeft: '40px' }} className="img-fluid btn btn-primary btn-lg" onClick={showProfile}>Update Profile</button>
              </div>  
            </div>
          </div>
        </div>
      </div>
    </div>
          {showModal && (
            <div>
              <UserProfileUpdate userId={user.id} handleClose={handleCloseEditForm} />
    
            </div>    
    
          )}</div>
  );
}

export default UserProfile;
