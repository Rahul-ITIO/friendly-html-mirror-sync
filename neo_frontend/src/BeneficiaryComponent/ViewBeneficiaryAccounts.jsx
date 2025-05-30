//The ViewBeneficiaryAccounts component retrieves, displays, and manages a list of beneficiary accounts, allowing users to view, update, quick pay, or delete beneficiaries, with feedback provided via toast notifications
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Function to fetch all beneficiary accounts
const ViewBeneficiaryAccounts = () => {
  let navigate = useNavigate();
  const [allBeneficiary, setAllBeneficiary] = useState([]);

  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  const retrieveAllBeneficiary = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/beneficiary/fetch?userId=` + customer.id,
      {
        headers: {
          Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
        },
      }
    );
    console.log(response.data);
    return response.data;
  };
// useEffect hook to fetch beneficiary accounts when the component mounts
  useEffect(() => {
    const getAllBeneficiary = async () => {
      const beneficiaryRes = await retrieveAllBeneficiary();
      if (beneficiaryRes) {
        setAllBeneficiary(beneficiaryRes.beneficiaryAccounts);
      }
    };

    getAllBeneficiary();
  }, []);
// Function to navigate to the update form with beneficiary data
  const updateAccount = (beneficiary) => {
    navigate("/customer/beneficiary/account/update", { state: beneficiary });
  };
// Function to navigate to the quick pay page with beneficiary data
  const navigateToQuickPay = (beneficiary) => {
    navigate("/customer/beneficiary/quick/pay", { state: beneficiary });
  };
// Function to delete a beneficiary account
  const deleteAccount = (beneficiaryId) => {
    fetch(
      `${process.env.REACT_APP_BASE_URL}/api/beneficiary/delete?beneficiaryId=` +
        beneficiaryId,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + customer_jwtToken,
        },
        //  body: JSON.stringify(addBeneficiaryRequest),
      }
    )
      .then((result) => {
        console.log("result", result);
        result.json().then((res) => {
          console.log(res);

          if (res.success) {
            console.log("Got the success response");

            toast.success(res.responseMessage, {
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
            }, 1000); // Redirect after 3 seconds
          } else {
            console.log("Didn't got success response");
            toast.error(res.responseMessage, {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  return (
    <div className="container">
      <div className="mt_2" >
        <div
          className="card"
          style={{
            height: "45rem",
          }}
        >
          <div className="card-header custom-bg-text text-center ">
            <h4 className=" text-color " >View Beneficiaries</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="table-responsive mt-3">
              <table className="table table-hover text-color text-center">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">Beneficiary Name</th>
                    <th scope="col">Account Number</th>
                    <th scope="col">Swift Code</th>
                    <th scope="col">Bank Name</th>
                    <th scope="col">Bank Address</th>
                    <th scope="col">Country</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allBeneficiary.map((beneficiary) => {
                    return (
                      <tr>
                        <td>
                          <b>{beneficiary.beneficiaryName}</b>
                        </td>
                        <td>
                          <b>{beneficiary.accountNumber}</b>
                        </td>
                        <td>
                          <b>{beneficiary.swiftCode}</b>
                        </td>
                        <td>
                          <b>{beneficiary.bankName}</b>
                        </td>
                        <td>
                          <b>{beneficiary.bankAddress}</b>
                        </td>
                        <td>
                          <b>{beneficiary.country}</b>
                        </td>
                        <td>
                          <b>{beneficiary.status}</b>
                        </td>
                        <td>
                          &nbsp;<button
                            onClick={() => navigateToQuickPay(beneficiary)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            Quick Pay
                          </button>

                          &nbsp;<button
                            onClick={() => updateAccount(beneficiary)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            Udpate
                          </button>

                          &nbsp;<button
                            onClick={() => deleteAccount(beneficiary.id)}
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBeneficiaryAccounts;
