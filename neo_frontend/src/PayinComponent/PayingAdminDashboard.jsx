import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import PeopleIcon from '@mui/icons-material/People';
import { toast } from 'react-toastify';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import 'react-toastify/dist/ReactToastify.css';
import '../new-dash.css';
import { Link } from "react-router-dom";
const Dashboard = () => {
  // State to store transactions and accounts
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  // Retrieve user and token from session storage
  const user = JSON.parse(sessionStorage.getItem("active-Admin"));
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
  // State for selected account and account transactions
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [externalSortConfig, setExternalSortConfig] = useState({
    key: 'transactionDate',
    direction: 'desc'  // Make sure this is 'desc'
  });

  const getAuthToken = () => {
    return sessionStorage.getItem("admin-jwtToken");
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching transactions with config:", externalSortConfig);

      // Build the sort parameter string
      const sortParam = `${externalSortConfig.key},${externalSortConfig.direction}`;
      const url = `${process.env.REACT_APP_BASE_URL}/api/transactions/all?sort=${sortParam}`;


      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (Array.isArray(response.data)) {
        console.log("Setting transactions from array, length:", response.data.length);
        setTransactions(response.data.slice(0, 7));

        setIsLoading(false);
      } else if (response.data && typeof response.data === 'object') {
        if (response.data.content && Array.isArray(response.data.content)) {
          console.log("Found Spring Data pagination format, content length:", response.data.content.length);
          setTransactions(response.data.slice(0, 7));
        } else {
          const transactionData = response.data.content || response.data.transactions || response.data.data || [];
          console.log("Extracted transaction data from object, length:", transactionData.length);
          setTransactions(response.data.slice(0, 7));
        }
        setIsLoading(false); // Explicitly set loading to false here too
      } else {
        console.error("Unexpected response format:", response.data);
        setTransactions([]); // Set empty array as fallback
        setIsLoading(false); // Explicitly set loading to false here too
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      console.error("Error details:", error.response ? error.response.data : "No response data");
      toast.error("Failed to fetch transactions. Please try again later.", {
        toastId: 'fetch-error',
        position: "top-center",
        autoClose: 3000,
      });
      setTransactions([]); // Set empty array on error
      setIsLoading(false); // Explicitly set loading to false here too
    } finally {
      console.log("Finally block - setting isLoading to false");
      setIsLoading(false);
    }
  };

  // Fix the typo in useEffect
  useEffect(() => {
    console.log("Effect running with sort config:", externalSortConfig);
    if (!getAuthToken()) {
      toast.error("Authentication token not found. Please login again.", {
        toastId: 'auth-error',
        position: "top-center",
        autoClose: 3000,
      });
      // Optionally redirect to login
      return;
    }
    fetchTransactions();
  }, [externalSortConfig]); // Only run when sort config changes

  const [data, setData] = useState({
    users: {
      active: 0,
      pending: 0,
      closed: 0,
      rejected: 0,
    },
    beneficiary: {
      active: 0,
      pending: 0,
      closed: 0,
      rejected: 0,
    },
    transactions: {
      success: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
    },
    revenue: 0,
    exchangeRates: {},
    currencyAmounts: [],
    activeAccounts: [],
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [statusBillAmounts, setStatusBillAmounts] = useState({});

  useEffect(() => {
    // Fetch data for users, transactions, and beneficiaries
    const fetchData = async () => {
      // Fetch accounts with role CUSTOMER
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/role?role=CUSTOMER`,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      const accounts = response1.data.users;
      console.log(response1);
      // Calculate account statuses and filter active accounts
      const statusCounts = accounts.reduce(
        (acc, account) => {
          acc[account.status.toLowerCase()] += 1;
          return acc;
        },
        { active: 0, suspended: 0, pending: 0, inactive: 0 }
      );

      const activeAccounts = accounts.filter(
        (account) => account.status.toLowerCase() === "active"
      );
      // Calculate currency totals
      const currencyTotals = accounts.reduce((acc, account) => {
        const { currency, accountBalance } = account;
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += accountBalance;
        return acc;
      }, {});

      // Convert currencyTotals to an array format for the chart
      const currencyAmounts = Object.entries(currencyTotals).map(
        ([currency, amount]) => ({
          currency,
          amount,
        })
      );

      setData((prevData) => ({
        ...prevData,
        users: {
          active: statusCounts.active,
          pending: statusCounts.pending,
          closed: statusCounts.inactive,
          rejected: statusCounts.suspended,
        },
        // currencyAmounts,
        activeAccounts,
      }));
    };
    const fetchtransactions = async () => {
      const response2 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/fetch/1`,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      let transactions = response2.data; // Fix: use response2.data directly
      transactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB - dateA; // For descending order (latest date first)
        // return dateB - dateA; // For descending order
      });
      setTransactions(transactions);

      // Calculate transaction statuses
      const statusCounts = transactions.reduce(
        (acc, account) => {
          acc[account.status?.toLowerCase()] += 1;
          return acc;
        },
        { success: 0, pending: 0, cancelled: 0, rejected: 0 }
      );

      setData((prevData) => ({
        ...prevData,
        transactions: {
          success: statusCounts.success,
          pending: statusCounts.pending,
          cancelled: statusCounts.cancelled,
          rejected: statusCounts.rejected,
        },
      }));
    };


    const retrieveAllBeneficiary = async () => {
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/ticket/fetch/all`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("admin-jwtToken"),
          },
        }
      );
      const accounts = response1.data.ticketDetails;

      // Calculate beneficiary statuses
      const statusCounts = accounts.reduce(
        (acc, account) => {
          acc[account.status.toLowerCase()] += 1;
          return acc;
        },
        { close: 0, open: 0, hold: 0, inProgress: 0 }
      );
      setData((prevData) => ({
        ...prevData,
        beneficiary: {
          Open: statusCounts.open,
          InProgress: statusCounts.inProgress,
          Close: statusCounts.close,
          Hold: statusCounts.hold,
        },
      }));
    };

    const fetchAccountData = async () => {
      try {
        // Fetch account data from the server
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/currencies/fatchAccount`
        );
        // Update the account state with the fetched data
        setAccounts(response.data.commonBankAccountDetais);
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

    const fetchCurrencies = async () => {
      try {
        // Make GET request to the API endpoint to fetch currencies
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/currencies/fatch`
        );

        // Extract currency details from the response
        const currencyAmounts = response.data.currencyDetails.map(({ name, accountBalance }) => ({
          currency: name,
          amount: 0,
        }));

        setData((prevData) => ({
          ...prevData,
          currencyAmounts,
        }));
      } catch (error) {
        // Handle error if fetching data fails
        console.error("Error fetching currencies:", error);
        // Notify error
        toast.error("Failed to fetch currencies", {
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
    const fetchStatusCounts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/transactions/scount/all`,
          {
            headers: {
              Authorization: "Bearer " + admin_jwtToken,
            },
          }
        );
        setStatusCounts(response.data);
      } catch (error) {
        setStatusCounts({});
      }
    };
    const fetchSumBillAmtStatusWise = async () => {
      try {
        console.log("admin_jwtToken", admin_jwtToken);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/transactions/sbasum/all`,
          {
            headers: {
              Authorization: "Bearer " + admin_jwtToken,
            },
          }
        );
        setStatusBillAmounts(response.data);
      } catch (error) {
        setStatusBillAmounts({});
      }
    };
    //fetchSumBillAmtStatusWise();
    fetchStatusCounts();
    // Call the fetchCurrencies function when the component mounts
    fetchCurrencies();
    // fetchAccountData();
    fetchData();
    fetchtransactions();
    retrieveAllBeneficiary();
    fetchSumBillAmtStatusWise();
  }, []);
  // Render status-wise counts and total count
  const totalStatusCount = Object.values(statusCounts).reduce((sum, val) => sum + val, 0);

  // Bar chart for status-wise transaction counts

  const statusLabels1 = {
    1: 'Approved',
    3: 'Refunded',
    5: 'Chargeback',
    2: 'Declined',
  };

  // Map status to color
  const statusColors1 = {
    1: '#2ecc71',    // Approved - Green
    3: '#17a2b8',    // Refunded - Bootstrap info
    5: '#e74c3c',    // Chargeback - Red
    2: '#e74c3c',    // Declined - Red
  };

  const StatusCountsBarChart = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const statuses = Object.keys(statusLabels1);
      const maxCount = Math.max(...statuses.map(s => statusCounts[s] || 0), 1);
      const barWidth = 60;
      const gap = 40;
      statuses.forEach((status, i) => {
        const count = statusCounts[status] || 0;
        const x = 50 + i * (barWidth + gap);
        const y = 200 - (count / maxCount) * 150;
        //ctx.fillStyle = '#1976D2';
        ctx.fillStyle = statusColors1[status] || '#36d1dc';
        ctx.fillRect(x, y, barWidth, (count / maxCount) * 150);

        // Draw status label below the bar
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = "12px Arial";
        ctx.fillText(statusLabels1[status], x + barWidth / 2, 240);

        // Draw amount label
        ctx.font = "bold 15px Arial";

        ctx.fillStyle = '#222';
        // Place the label inside the bar, a bit below the top of the bar
        ctx.fillText(count, x + barWidth / 2, y - 10);


      });
    }, [statusCounts]);
    return <canvas ref={canvasRef} width={500} height={275} />;
  };
  const StatusBillAmountsBarChart = ({ statusBillAmounts }) => {
    const canvasRef = useRef(null);


    const statusLabels = {
      1: 'Approved',
      3: 'Refunded',
      5: 'Chargeback',
      2: 'Declined',
    };

    // Map status to color
    const statusColors = {
      1: '#2ecc71',    // Approved - Green
      3: '#17a2b8',    // Refunded - Bootstrap info
      5: '#e74c3c',    // Chargeback - Red
      2: '#e74c3c',    // Declined - Red
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const statuses = Object.keys(statusLabels);
      const maxAmount = Math.max(...statuses.map(s => statusBillAmounts[s] || 0), 1);
      const barWidth = 60;
      const gap = 40;
      statuses.forEach((status, i) => {
        let amount = statusBillAmounts[status] || 0;
        // For Refunded and Chargeback, show as negative
        if (status === "3" || status === "5") {
          amount = Math.abs(amount);
        }
        const x = 50 + i * (barWidth + gap);
        const barHeight = Math.abs((amount / maxAmount) * 150);
        const y = amount >= 0 ? 200 - barHeight : 200;
        ctx.fillStyle = statusColors[status] || '#36d1dc';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw status label below the bar
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.font = "12px Arial";
        ctx.fillText(statusLabels[status], x + barWidth / 2, 240);

        // Draw amount label
        ctx.font = "bold 15px Arial";
        if (amount >= 0) {
          ctx.fillStyle = '#222';
          ctx.fillText(amount.toFixed(2), x + barWidth / 2, y - 10);
        } else {
          ctx.fillStyle = '#222';
          // Place the label inside the bar, a bit below the top of the bar
          ctx.fillText(amount.toFixed(2), x + barWidth / 2, y + barHeight / 2 + 8);
        }
      });
    }, [statusBillAmounts]);

    return <canvas ref={canvasRef} width={500} height={275} />;
  };
  return (
    <div className="container py-4">
      <h3 className="dash-title">Dashboard</h3>
      <div className="row g-4 mb-4 pt-4">
        <div className="col-md-3">
          <div className="card position-relative shadow-sm">
            <span
              className={`badge bg-success position-absolute top-0 start-50 translate-middle rounded-pill px-3 py-1`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {statusCounts[1] ?? 0}
            </span>
            <div className="card-body text-center">
              <h5 className="mb-2">
                {statusBillAmounts[1] ? Number(statusBillAmounts[1]).toLocaleString() : "0"}
              </h5>
              <p className={`text-success fw-bold mb-0`}>Approved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card position-relative shadow-sm">
            <span
              className={`badge bg-danger position-absolute top-0 start-50 translate-middle rounded-pill px-3 py-1`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {statusCounts[2] ?? 0}
            </span>
            <div className="card-body text-center">
              <h5 className="mb-2">
                {statusBillAmounts[2] ? Number(statusBillAmounts[2]).toLocaleString() : "0"}
              </h5>
              <p className={`text-danger fw-bold mb-0`}>Declined</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card position-relative shadow-sm">
            <span
              className={`badge bg-info position-absolute top-0 start-50 translate-middle rounded-pill px-3 py-1`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {statusCounts[3] ?? 0}
            </span>
            <div className="card-body text-center">
              <h5 className="mb-2">
                {statusBillAmounts[3] ? Number(statusBillAmounts[3]).toLocaleString() : "0"}
              </h5>
              <p className={`text-info fw-bold mb-0`}>Refunded</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card position-relative shadow-sm">
            <span
              className={`badge bg-warning position-absolute top-0 start-50 translate-middle rounded-pill px-3 py-1`}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              {statusCounts[5] ?? 0}
            </span>
            <div className="card-body text-center">
              <h5 className="mb-2">
                {statusBillAmounts[5] ? Number(statusBillAmounts[5]).toLocaleString() : "0"}
              </h5>
              <p className={`text-warning fw-bold mb-0`}>Chargeback</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card">
           <Link
         
          aria-current="page"
          to="/admin/all/bank/customers"
        >
            <div className="card-body text-center">
              <h5 className="card-title d-flex align-items-center justify-content-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "var(--bs-primary-bg-subtle)",
                    padding: "6px",
                    borderRadius: "10px",
                  }}
                >
                  <PeopleIcon style={{ fontSize: "16px", color: "var(--bs-primary-text-emphasis)" }} />
                </span>
                <span className="text-muted fw-semibold">Users</span>
              </h5>

              <div className="d-flex justify-content-around mt-3">
                <div>
                  <p className="text-capitalize-span mb-1">Active</p>
                  <p className="text-capitalize-span mb-0">{data.users.active}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Pending</p>
                  <p className="text-capitalize-span mb-0">{data.users.pending}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Closed</p>
                  <p className="text-capitalize-span mb-0">{data.users.closed}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Rejected</p>
                  <p className="text-capitalize-span mb-0">{data.users.rejected}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Total</p>
                  <p className="text-capitalize-span mb-0">{data.users.active +
                    data.users.pending +
                    data.users.closed +
                    data.users.rejected}</p>
                </div>
              </div>
            </div>
            </Link>
          </div>
        </div>

        <div className="col-md-4">
         <Link          
          aria-current="page"
          to="/admin/transaction/list"
        >
          <div className="card">
            <div className="card-body text-center">
             <h5 className="card-title d-flex align-items-center justify-content-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "var(--bs-danger-bg-subtle)",
                    padding: "6px",
                    borderRadius: "10px",
                  }}
                >
                  <CompareArrowsIcon style={{ fontSize: "16px", color: "var(--bs-danger-text-emphasis)" }} />
                </span>
                <span className="text-muted fw-semibold">Transactions</span>
              </h5>
              <div className="d-flex justify-content-around mt-3">

                <div>
                  <p className="text-capitalize-span mb-1">Approved</p>
                  <p className="text-capitalize-span mb-0">{statusCounts[1] ?? 0}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Declined</p>
                  <p className="text-capitalize-span mb-0">{statusCounts[2] ?? 0}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Refunded</p>
                  <p className="text-capitalize-span mb-0">{statusCounts[3] ?? 0}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Chargeback</p>
                  <p className="text-capitalize-span mb-0">{statusCounts[5] ?? 0}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Total</p>
                  <p className="text-capitalize-span mb-0">{totalStatusCount}</p>
                </div>
              </div>
            </div>
          </div>
          </Link>
        </div>

        <div className="col-md-4">
         <Link
       
          aria-current="page"
          to="/Admin/ticket/detail/AdminTicket"
        >
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title d-flex align-items-center justify-content-center gap-2">
                <span
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "var(--bs-success-bg-subtle)",
                    padding: "6px",
                    borderRadius: "10px",
                  }}
                >
                  <LocalActivityIcon style={{ fontSize: "16px", color: "var(--bs-success-text-emphasis)" }} />
                </span>
                <span className="text-muted fw-semibold">Tickets</span>
              </h5>
              <div className="d-flex justify-content-around mt-3">

                <div>
                  <p className="text-capitalize-span mb-1">Active</p>
                  <p className="text-capitalize-span mb-0">{data.beneficiary.Open}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Progress</p>
                  <p className="text-capitalize-span mb-0">{data.beneficiary.InProgress}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Closed</p>
                  <p className="text-capitalize-span mb-0">{data.beneficiary.Close}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Hold</p>
                  <p className="text-capitalize-span mb-0">{data.beneficiary.Hold}</p>
                </div>
                <div>
                  <p className="text-capitalize-span mb-1">Total</p>
                  <p className="text-capitalize-span mb-0"> {data.beneficiary.Open +
                    data.beneficiary.InProgress +
                    data.beneficiary.Close +
                    data.beneficiary.Hold}</p>
                </div>
              </div>
            </div>
          </div>
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-md-6">
          <div className="card card-height">
            <div className="card-body">
              <h4 className="text-primary mb-4 ">Transaction Bill Amount for Status Wise</h4>
              <div className="overflow-auto">
<StatusBillAmountsBarChart statusBillAmounts={statusBillAmounts} />
              </div>
              
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-height">
            <div className="card-body">
              <h4 className="text-primary mb-4 ">Status Wise Transaction Counts : {totalStatusCount}</h4>
              <div className="overflow-auto">
                <StatusCountsBarChart />
              </div>
              
            </div>
          </div>
        </div>


      </div>
      <div className="dash-title mt-4 mb-2">
        <h2 className="text-primary">Latest Transaction</h2>
      </div>
      {isLoading ? (
        <p>Loading transactions...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>TransID</th>
                <th>Type</th>
                <th>Status</th>
                <th>MerchantID</th>
                <th>Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <tr key={index}>
                    <td>{txn.transID || 'N/A'}</td>
                    <td>{txn.transaction.transactionType || 'N/A'}</td>
                    <td>{txn.transaction.transactionStatus || 'N/A'}</td>
                    <td>{txn.transaction.merchantID || 'N/A'}</td>
                    <td>{txn.transaction.billAmount || 'N/A'}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
