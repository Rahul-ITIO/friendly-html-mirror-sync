import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ViewBankManagers = () => {
  let navigate = useNavigate();
  const [allManagers, setAllManagers] = useState([]);

  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");

  const retrieveAllManagers = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/api/user/fetch/role?role=BANK`,
      {
        headers: {
          Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
        },
      }
    );
    console.log(response.data);
    return response.data;
  };

  useEffect(() => {
    const getAllBanks = async () => {
      const managers = await retrieveAllManagers();
      if (managers) {
        setAllManagers(managers.users);
      }
    };

    getAllBanks();
  }, []);

  return (
    <div className="container">
      <div className="mt_2">
        <div
          className="card   "
          style={{
            height: "45rem",
          }}
        >
          <div className="card-header custom-bg-text text-center">
            <h4 className=" text-color " >All Bank Managers</h4>
          </div>
          <div
            className="card-body"
            style={{
              overflowY: "auto",
            }}
          >
            <div className="table-responsive">
              <table className="table table-hover text-color text-center">
                <thead className="table-bordered border-color bg-color custom-bg-text">
                  <tr>
                    <th scope="col">Manager Name</th>
                    <th scope="col">Bank Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Street</th>
                    <th scope="col">City</th>
                    <th scope="col">Pincode</th>
                  </tr>
                </thead>
                <tbody>
                  {allManagers.map((manager) => {
                    return (
                      <tr>
                        <td>
                          <b>{manager.name}</b>
                        </td>
                        <td>
                          <b>{manager.bank ? manager.bank.name : "NA"}</b>
                        </td>
                        <td>
                          <b>{manager.email}</b>
                        </td>
                        <td>
                          <b>{manager.gender}</b>
                        </td>
                        <td>
                          <b>{manager.contact}</b>
                        </td>
                        <td>
                          <b>{manager.street}</b>
                        </td>
                        <td>
                          <b>{manager.city}</b>
                        </td>
                        <td>
                          <b>{manager.pincode}</b>
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

export default ViewBankManagers;
