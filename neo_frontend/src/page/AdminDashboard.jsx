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
  const user = JSON.parse(sessionStorage.getItem("active-Admin"));
  const admin_jwtToken = sessionStorage.getItem("admin-jwtToken");
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
  });

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
        `${process.env.REACT_APP_BASE_URL}/api/transaction/fetch/transactions/success`,
        {
          headers: {
            Authorization: "Bearer " + admin_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      let transactions = response2.data.transactions;
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
          acc[account.status.toLowerCase()] += 1;
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
    // Call the fetchCurrencies function when the component mounts
    fetchCurrencies();
    // fetchAccountData();
    fetchData();
    fetchtransactions();
    retrieveAllBeneficiary();
  }, []);

  const handleAccountClick = async (account) => {
    setSelectedAccount(account);
    // const response = await axios.get(
    //   `${process.env.REACT_APP_BASE_URL}/api/transaction/fetch/account/transactions?accountId=${account.id}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${customer_jwtToken}`,
    //     },
    //   }
    // );
    // setAccountTransactions(response.data.transactions);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h5>Dashboard</h5>
      </div>
      <div className="dashboard-summary">
        <Link
          className="summary-item"
          aria-current="page"
          to="/admin/all/bank/customers"
        >
          <h3> Users</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Active</h6>
              <p>{data.users.active}</p>
            </div>
            <div className="summary-detail">
              <h6>Pending</h6>
              <p>{data.users.pending}</p>
            </div>
            <div className="summary-detail">
              <h6>Closed</h6>
              <p>{data.users.closed}</p>
            </div>
            <div className="summary-detail">
              <h6>Rejected</h6>
              <p>{data.users.rejected}</p>
            </div>
            <div className="summary-detail">
              <h6>Total</h6>
              <p>
                {data.users.active +
                  data.users.pending +
                  data.users.closed +
                  data.users.rejected}
              </p>
            </div>
          </div>
        </Link>
        <Link
          className="summary-item"
          aria-current="page"
          to="/admin/customer/transaction/success"
        >
          <h3> Transactions</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Success</h6>
              <p>{data.transactions.success}</p>
            </div>
            <div className="summary-detail">
              <h6>Pending</h6>
              <p>{data.transactions.pending}</p>
            </div>
            <div className="summary-detail">
              <h6>Rejected</h6>
              <p>{data.transactions.rejected}</p>
            </div>
            <div className="summary-detail">
              <h6>Cancelled</h6>
              <p>{data.transactions.cancelled}</p>
            </div>
            <div className="summary-detail">
              <h6>Total</h6>
              <p>
                {data.transactions.success +
                  data.transactions.pending +
                  data.transactions.cancelled +
                  data.transactions.rejected}
              </p>
            </div>
          </div>
        </Link>
        <Link
          className="summary-item"
          aria-current="page"
          to="/Admin/ticket/detail/AdminTicket"
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
      </div>
      <div className="dashboard-summary">
      <div className="monthly-transactions-chart currency-chart ">
          <h3>Monthly Credit and Debit Transactions</h3>
          <MonthlyTransactionsChart transactions={transactions} />
        </div>
        <div className="currency-chart">
          <h3>Added Currency</h3>
          <CurrencyChart data={data.currencyAmounts} />
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
        <h3>Letest Transaction</h3>
        <table className="transaction-table-A">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="hide-on-mobile" >Sender Name</th>
              <th className="hide-on-mobile" >Description</th>
              <th className="hide-on-mobile">Transaction Ref ID</th>
              <th className="hide-on-mobile" >Fee</th>
              <th>Date</th>
              <th>Currency</th>
              <th>Account Number</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((transaction, index) => (
              <tr key={index} className="">
                <td>{transaction.type || "N/A"}</td>
                <td>{transaction.amount || "N/A"}</td>
                <td>{transaction.status || "N/A"}</td>
                <td className="hide-on-mobile">{transaction.senderName || "N/A"}</td>
                <td className="hide-on-mobile">{transaction.description || "N/A"}</td>
                <td className="hide-on-mobile" >{transaction.transactionRefId || "N/A"}</td>
                <td className="hide-on-mobile">{transaction.fee || "N/A"}</td>
                <td>{transaction.date || "N/A"}</td>
                <td>{transaction.currency || "N/A"}</td>
                <td >{transaction.accountNumber || "N/A"}</td>
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


export default Dashboard;
