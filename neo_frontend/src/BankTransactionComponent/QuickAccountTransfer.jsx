import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const QuickAccountTransfer = () => {
  let navigate = useNavigate();

  const [addMoneyRequest, setAddMoneyRequest] = useState({});
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");

  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  const handleUserInput = (e) => {
    setAddMoneyRequest({ ...addMoneyRequest, [e.target.name]: e.target.value });
  };

  const [beneficiaryAccounts, setBeneficiaryAccounts] = useState([]);

  const retrieveAllBeneficiaries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/beneficiary/fetch?userId=` + customer.id,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      return response.data;
    } catch (error) {
      // Handle any errors here
      console.error("Error fetching bank managers:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getAllBeneficiaries = async () => {
      const allBeneficiaries = await retrieveAllBeneficiaries();
      if (allBeneficiaries) {
        setBeneficiaryAccounts(allBeneficiaries.beneficiaryAccounts);
      }
    };

    getAllBeneficiaries();
  }, []);

  const accountTransfer = (e) => {
    addMoneyRequest.userId = customer.id;

    fetch(`${process.env.REACT_APP_BASE_URL}/api/transaction/quick/accountTransfer`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + customer_jwtToken,
      },
      body: JSON.stringify(addMoneyRequest),
    })
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
    e.preventDefault();
  };

  return (
    <div>
      <div className="mt_3 ">
        <div
          className="card form-card border-color custom-bg"
          style={{ width: "25rem" }}
        >
          <div className="card-header text-center custom-bg-text">
            <h4 className="text-color">Quick Account Transfer</h4>
          </div>
          <div className="card-body">
            <form>
              <div className="mb-3 text-color">
                <label for="amount" class="form-label">
                  <b>Amount</b>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="amount"
                  name="amount"
                  onChange={handleUserInput}
                  value={addMoneyRequest.amount}
                  required
                />
              </div>

              <div className="mb-3 text-color">
                <label className="form-label">
                  <b>Beneficary Account</b>
                </label>
                <select
                  name="beneficiaryId"
                  onChange={handleUserInput}
                  className="form-control"
                >
                  <option value="">Select Beneficiary Account</option>

                  {beneficiaryAccounts.map((beneficiary) => {
                    return (
                      <option value={beneficiary.id}>
                        {beneficiary.accountNumber +
                          " [" +
                          beneficiary.beneficiaryName +
                          "]"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-3 text-color">
                <label for="purpose" class="form-label">
                  <b>Purpose</b>
                </label>
                <textarea
                  type="text"
                  className="form-control"
                  id="purpose"
                  name="purpose"
                  onChange={handleUserInput}
                  value={addMoneyRequest.purpose}
                  required
                />
              </div>
              &nbsp;<button
                type="submit"
                className="btn bg-color custom-bg-text"
                onClick={accountTransfer}
              >
                Transfer
              </button>
              <ToastContainer />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccountTransfer;
