import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "../Dashboard.css";

const Dashboard = () => {
   // State to store transactions and accounts
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
   // Retrieve user and token from session storage
  const user = JSON.parse(sessionStorage.getItem("active-customer"));
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
   // State for selected account and account transactions
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState([
     // Sample account transactions
    {
      id: 1,
      date: new Date(),
      amount: 100,
      status: "Success",
      type: "Credit",
    },
    {
      id: 2,
      date: new Date(),
      amount: 50,
      status: "Pending",
      type: "Debit",
    },
    {
      id: 3,
      date: new Date(),
      amount: 200,
      status: "Rejected",
      type: "Transfer",
    },
    {
      id: 4,
      date: new Date(),
      amount: 75,
      status: "Cancelled",
      type: "Withdrawal",
    },
  ]);
   // State to store various data for dashboard summary
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
    terminalStatusCounts: { 1: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [statusBillAmounts, setStatusBillAmounts] = useState({});
  // Add local state for selected public key and bill amount
  const [selectedPublicKey, setSelectedPublicKey] = useState("");
  const [billAmt, setBillAmt] = useState("");

  // Handler for PAY button
  const handlePayClick = (e) => {
    e.preventDefault();
    if (!selectedPublicKey || !billAmt) {
      toast.error("Please select a terminal and enter an amount.");
      return;
    }
    //
    //const url = `http://localhost:9003/api/s2s?integration-type=checkout&public_key=${encodeURIComponent(selectedPublicKey)}&bill_amt=${encodeURIComponent(billAmt)}&fullname=Testing Dev Tech`;
    //const url = `http://localhost:3000/checkout?integration-type=checkout&public_key=${(selectedPublicKey)}&bill_amt=${encodeURIComponent(billAmt)}&fullname=Testing Dev Tech`;

    const url = `http://localhost:3000/checkout/${user.userName}/${(billAmt)}/`;
    window.open(url, "_blank");
  };

  useEffect(() => {
     // Fetch data for users, transactions, and beneficiaries
    const fetchData = async () => {
      // Fetch accounts with role CUSTOMER
      //  api/user/fetch/role?role=CUSTOMER
      //  api/terminals/search/merid/${user.id}
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/terminals/search/merid/${user.id}`,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      const accounts = response1.data;
      console.log("terminals=>", accounts);

      // Count active terminals
      const activeCount = accounts.filter(
        (account) => account.status && account.status.toLowerCase() === "active"
      ).length;

      console.log("activeCount=>", activeCount);

      // You can also count other statuses if needed
      const statusCounts = accounts.reduce(
        (acc, account) => {
          const status = account.status ? account.status.toLowerCase() : "unknown";
          if (acc[status] !== undefined) acc[status] += 1;
          return acc;
        },
        { active: 0, suspended: 0, pending: 0, inactive: 0 }
      );

      const activeAccounts = accounts.filter(
        (account) => account.status && account.status.toLowerCase() === "active"
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

      // Add this at the top of fetchData
      const terminalStatusCounts = { 1: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      // Count by 'active' field
      accounts.forEach(account => {
        if (terminalStatusCounts.hasOwnProperty(account.active)) {
          terminalStatusCounts[account.active]++;
        }
      });

      // Save to state
      setData((prevData) => ({
        ...prevData,
        users: {
          active: activeCount,
          pending: statusCounts.pending,
          closed: statusCounts.inactive,
          rejected: statusCounts.suspended,
        },
        // currencyAmounts,
        activeAccounts,
        terminalStatusCounts,
        terminals: accounts,
      }));
    };

    const fetchtransactions = async () => {
      const response2 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transactions/statuswise/merchant/${user.id}/1`,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
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
            Authorization: "Bearer " + sessionStorage.getItem("customer-jwtToken"),
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
          currency:name,
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
          `${process.env.REACT_APP_BASE_URL}/api/transactions/statuscount/merchant/${user.id}`,
          {
            headers: {
              Authorization: "Bearer " + customer_jwtToken,
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
        //console.log("customer_jwtToken", customer_jwtToken);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/transactions/billamtsum/merchant/${user.id}`,
          {
            headers: {
              Authorization: "Bearer " + customer_jwtToken,
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

  

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h5>Dashboard</h5>
      </div>
      <div className="row">
        <div className="transaction-summary-cards">

          <div className="transaction-status-card approved hover_zoom_1">
            <div className="transaction-status-badge" title="Approved Count">
              {statusCounts[1] ?? 0}
            </div>
            <div className="transaction-status-amount" title="Total Approved">
              <span className="fs-6" > $ </span> {statusBillAmounts[1] ? Number(statusBillAmounts[1]).toLocaleString() : "0"}
            </div>
            <div className="transaction-status-label">
              Approved
            </div>
          </div>

          <div className="transaction-status-card declined hover_zoom_1">
            <div className="transaction-status-badge" title="Declined Count">
              {statusCounts[2] ?? 0}
            </div>
            <div className="transaction-status-amount" title="Total Declined">
              <span className="fs-6" > $ </span> {statusBillAmounts[2] ? Number(statusBillAmounts[2]).toLocaleString() : "0"}
            </div>
            <div className="transaction-status-label">
              Declined
            </div>
          </div>

          <div className="transaction-status-card refunded hover_zoom_1">
            <div className="transaction-status-badge" title="Declined Count">
              {statusCounts[3] ?? 0}
            </div>
            <div className="transaction-status-amount" title="Total Declined">
              <span className="fs-6" > $ </span> {statusBillAmounts[3] ? Number(statusBillAmounts[3]).toLocaleString() : "0"}
            </div>
            <div className="transaction-status-label">
              Refunded
            </div>
          </div>

          <div className="transaction-status-card chargeback hover_zoom_1">
            <div className="transaction-status-badge" title="Declined Count">
              {statusCounts[5] ?? 0}
            </div>
            <div className="transaction-status-amount" title="Total Declined">
              <span className="fs-6" > $ </span> {statusBillAmounts[5] ? Number(statusBillAmounts[5]).toLocaleString() : "0"}
            </div>
            <div className="transaction-status-label">
            Chargeback
            </div>
          </div>

          {(data.terminalStatusCounts?.[1] ?? 0) > 0 && (
            <div className="transaction-status-card approved hover_zoom_22 col-md-2" style={{padding: "32px 35px 5px 12px"}} >
              <div className="transaction-status-badge" title="Approved Payin Terminal Count">
              {data.terminalStatusCounts?.[1] ?? 0}
            </div>
              <div className="transaction-status-amount row d-flex justify-content-center p-0 m-0 g-1 " title="Total Approved" style={{height: "45px"}}>
                <div className="col-md-6">
                  <select
                    name="public_key"
                    className="form-control col-md-6"
                    value={selectedPublicKey}
                    onChange={e => setSelectedPublicKey(e.target.value)}
                  >
                    <option value="">Select Terminal Public Key</option>
                    {data.terminals?.filter(terminal => terminal.active === 1).map((terminal) => (
                      <option key={terminal.id} value={terminal.publicKey}>
                        {terminal.terName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    name="bill_amt"
                    className="form-control"
                    value={billAmt}
                    onChange={e => setBillAmt(e.target.value)}
                    title="Enter Amount"
                    placeholder="Amt"
                  />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary" onClick={handlePayClick}>PAY</button>
                </div>
              </div>
              <div className="transaction-status-label">
                Approved Terminal
              </div>
            </div>
          )}



        </div>
      </div>

      <div className="dashboard-summary mb-5">
        

        
        <Link
          className="summary-item"
          aria-current="page"
          to="/customer/transaction/list"
        >
          <h3> Transactions</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Approved</h6>
              <p>{statusCounts[1] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Declined</h6>
              <p>{statusCounts[2] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Refunded</h6>
              <p>{statusCounts[3] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Chargeback</h6>
              <p>{statusCounts[5] ?? 0}</p>
            </div>
            
            <div className="summary-detail">
              <h6>Total</h6>
              <p>{totalStatusCount}</p>
            </div>
          </div>
        </Link>
        <Link
          className="summary-item"
          aria-current="page"
          to="/customer/ticket/detail/UserTicket"
        >
          <h3> User Ticket</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Active</h6>
              <p>{data.beneficiary.Open}</p>
            </div>
            <div className="summary-detail">
              <h6>Progress</h6>
              <p>{data.beneficiary.InProgress}</p>
            </div>
            <div className="summary-detail">
              <h6>Closed</h6>
              <p>{data.beneficiary.Close}</p>
            </div>
            <div className="summary-detail">
              <h6>Hold</h6>
              <p>{data.beneficiary.Hold}</p>
            </div>
            <div className="summary-detail">
              <h6>Total</h6>
              <p>
                {data.beneficiary.Open +
                  data.beneficiary.InProgress +
                  data.beneficiary.Close +
                  data.beneficiary.Hold}
              </p>
            </div>
          </div>
        </Link>
        <Link
          className="summary-item"
          aria-current="page"
          to="/customer/terminal/list"
        >
          <h3> Terminal</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Approved</h6>
              <p>{data.terminalStatusCounts?.[1] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Rejected</h6>
              <p>{data.terminalStatusCounts?.[3] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6 title="Under Review">U.Review</h6>
              <p>{data.terminalStatusCounts?.[4] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Awaiting</h6>
              <p>{data.terminalStatusCounts?.[5] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Terminated</h6>
              <p>{data.terminalStatusCounts?.[6] ?? 0}</p>
            </div>
            <div className="summary-detail">
              <h6>Total</h6>
              <p>
                {Object.values(data.terminalStatusCounts ?? {}).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </Link>
      </div>
        <div className="dashboard-summary">
            
            <div className="currency-chart" style={{ height: "auto" }}>
                <h3>Transaction Bill Amount for Status Wise</h3>
                <StatusBillAmountsBarChart statusBillAmounts={statusBillAmounts} />
            </div>
            <div className="monthly-transactions-chart1 currency-chart" style={{ height: "auto" }}>
                <h3 className="pb-2">Status Wise Transaction Counts : {totalStatusCount}</h3>
                <StatusCountsBarChart />
            </div>
        </div>

      

      {/* <div className="dashboard-main">
        <div className="active-accounts">
          <div className="user-cards">
            <h3 className="card-heder dashboard-header-A">Active Users:</h3>
            {data.activeAccounts.map((account, index) => (
              <div
                key={account.id}
                className="user-card"
                onClick={() => handleAccountClick(account)}
              >
                <p>User Name: {account.name || "N/A"}</p>
                <p>Address: {account.address}</p>
                <p>Currency: {account.currency}</p>
                <div className="chip"></div>
              </div>
            ))}
          </div>
        </div>
      </div> */}
      <div>
        <CurrencyConverter
          transactions={transactions}
          setTransactions={setTransactions}
        />
      </div>
    </div>
  );
};

const CurrencyChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data || data.length === 0) {
      ctx.font = "20px Arial";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
      return;
    }

    // Check if all amounts are zero
    const allZero = data.every(({ amount }) => amount === 0);

    const drawDoughnutSlice = (startAngle, endAngle, color) => {
      const radius = Math.min(canvas.width, canvas.height) / 3;
      const holeRadius = radius / 2;

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        radius,
        startAngle,
        endAngle
      );
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        holeRadius,
        endAngle,
        startAngle,
        true
      );
      ctx.closePath();
      ctx.fill();
    };

    if (allZero) {
      // Equally divide the chart
      const sliceAngle = (2 * Math.PI) / data.length;
      let startAngle = 0;

      data.forEach(({ currency }, index) => {
        const endAngle = startAngle + sliceAngle;
        drawDoughnutSlice(startAngle, endAngle, getColor(index));
        startAngle = endAngle;
      });
    } else {
      const total = data.reduce((acc, { amount }) => acc + amount, 0);
      let startAngle = 0;

      data.forEach(({ amount, currency }, index) => {
        const sliceAngle = (amount / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;
        drawDoughnutSlice(startAngle, endAngle, getColor(index));
        startAngle = endAngle;
      });
    }
  }, [data]);

  const getColor = (index) => {
    const colors = [
      "#1976D2",
      "#8e44ad",
      "#36d1dc",
      "#282f4b",
      "#3498db",
      "#2ecc71",
    ];
    return colors[index % colors.length];
  };

  return (
       <div className="">
    <div className="dataContainer">
      {data.map(({ currency, amount }, index) => (
        <div key={index} className="dataItem">
          <div className="colorBox" style={{ backgroundColor: getColor(index) }}></div>
          <span>{`${currency}`}</span>
        </div>
      ))}
    </div>
    <canvas ref={canvasRef} className="canvas"></canvas>
  </div>
  );
};

const CurrencyConverter = ({ transactions }) => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/521c4cac49833694704ab4b3/latest/USD`
        );
        console.log(transactions);
        setExchangeRates(response.data.conversion_rates);
      } catch (error) {
        const exchangeRates1 = {
          USD: 1.0,
          EUR: 0.85,
          GBP: 0.75,
          INR: 74.0,
          JPY: 110.0,
          CAD: 1.25,
        };
        setExchangeRates(exchangeRates1);
        console.error("Error fetching exchange rates:", error);
      }
    };
    fetchExchangeRates();
  }, []);

  const handleConvert = () => {
    if (fromCurrency === toCurrency) {
      setResult(amount);
    } else {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      setResult(amount * rate);
    }
  };

  return (
    <div className="currency-converter-container">
      <div className="transaction-form-A">
        <h3>Letest Approved Transaction</h3>
        <table className="transaction-table-A">
          <thead>
            <tr>
              <th>TransID</th>
              <th>Date</th>
              <th>Reference</th>
              <th>MerID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Connector Ref.</th>
              <th className="hide-on-mobile">MOP</th>
              <th className="hide-on-mobile" >CardNo</th>
              <th className="hide-on-mobile" >Full Name</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((transaction, index) => (
              <tr key={index} className="">
                <td>{transaction.transID || "N/A"}</td>
                <td className="text-nowrap">{transaction.transactionDate || "N/A"}</td>
                <td>{transaction.transaction.reference || "N/A"}</td>
                <td>{transaction.transaction.merchantID || "N/A"}</td>
                <td>{transaction.transaction.billAmount || "N/A"}</td>
                <td>{transaction.transaction.billCurrency || "N/A"}</td>
                <td >{transaction.additional.connectorRef || "N/A"}</td>
                <td className="hide-on-mobile" >{transaction.transaction.methodOfPayment || "N/A"}</td>
                <td className="hide-on-mobile">{transaction.additional.cardNumber || "N/A"}</td>
                <td className="hide-on-mobile text-truncate">{transaction.transaction.fullName || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <div className="currency-converter">
        <h3>Currency Converter</h3>
        <div className="converter-form">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="amount-input"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="currency-select"
          >
            {Object.keys(exchangeRates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <span className="to-text">to</span>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="currency-select"
          >
            {Object.keys(exchangeRates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          &nbsp;<button onClick={handleConvert} className="convert-button">
            Convert
          </button>
        </div>
        {result !== null && (
          <div className="conversion-result">
            <h4>Converted Amount: {result.toFixed(2)}</h4>
          </div>
        )}
      </div> */}
    </div>
  );
};

const MonthlyTransactionsChart = ({ transactions }) => {
  const canvasRef = useRef(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const getMonthlyData = (transactions, type) => {
      const monthlyData = Array(12).fill(0);

      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        if (transaction.type === type) {
          monthlyData[date.getMonth()] += transaction.billAmount;
        }
      });

      return monthlyData;
    };

    const getMonthlyasDebit = (transactions, type) => {
      const monthlyData = Array(12).fill(0);
      console.log(transactions);
      transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        if (transaction.beneficiaryName!==null) {
          monthlyData[date.getMonth()] += transaction.billAmount;
        }
      });

      return monthlyData;
    };

    const creditData = getMonthlyData(transactions, "Deposit");
    const debitData = getMonthlyasDebit(transactions, "Account Transfer");

    const drawChart = () => {
      const labels = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const maxAmount = Math.max(...creditData, ...debitData);
      const chartHeight = 400;
      const chartWidth = 800;
      const barWidth = chartWidth / (labels.length * 2);
      const scale = chartHeight / maxAmount;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the axes
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(50, chartHeight + 50);
      ctx.lineTo(chartWidth + 50, chartHeight + 50);
      ctx.stroke();
      ctx.font = "13px Arial"; // Adjust font size here

      // Draw the bars
      labels.forEach((label, i) => {
        const xCredit = 60 + i * 2 * barWidth;
        const xDebit = xCredit + barWidth;
        const yCredit = chartHeight + 50 - creditData[i] * scale;
        const yDebit = chartHeight + 50 - debitData[i] * scale;

        // Draw credit bar
        ctx.fillStyle = "#1976D2";
        ctx.fillRect(xCredit, yCredit, barWidth, creditData[i] * scale);

        // Draw debit bar
        ctx.fillStyle = "#36d1dc";
        ctx.fillRect(xDebit, yDebit, barWidth, debitData[i] * scale);

        // Draw labels
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(label, xCredit + barWidth / 2, chartHeight + 70);

        // Save coordinates for hover detection
        if (
          mouseX >= xCredit &&
          mouseX <= xCredit + barWidth &&
          mouseY >= yCredit &&
          mouseY <= chartHeight + 50
        ) {
          setHoveredMonth(i);
        }
      });

      // Draw legend
      ctx.fillStyle = "#1976D2";
      ctx.fillRect(chartWidth - 100, 20, 20, 20);
      ctx.fillStyle = "black";
      ctx.fillText("Credit", chartWidth - 60, 35);

      ctx.fillStyle = "#36d1dc";
      ctx.fillRect(chartWidth - 100, 50, 20, 20);
      ctx.fillStyle = "black";
      ctx.fillText("Debit", chartWidth - 60, 65);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = x;
      mouseY = y;
      drawChart();
    };

    let mouseX = 0;
    let mouseY = 0;

    canvas.addEventListener("mousemove", handleMouseMove);

    drawChart();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [transactions, hoveredMonth]);

  return <canvas ref={canvasRef} width={900} height={500}></canvas>;
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
        amount = -Math.abs(amount);
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

export default Dashboard;
