import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import "../Dashboard.css";
import Flag from "react-world-flags"; // Import Flag component

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("active-customer"));
  const customer_jwtToken = sessionStorage.getItem("customer-jwtToken");
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [isFormValid, setIsFormValid] = useState(true); // State to manage form validity
  const [totalInUSD, setTotalInUSD] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [highlightedCard, setHighlightedCard] = useState(null);
  const [editedAccount, setEditedAccount] = useState({
    id: 0,
    userId: "",
    status: "",
    accountNumber: "",
    accountBalance: 0,
    currency: "", // Array to store selected currencies
  });

  const [accountTransactions, setAccountTransactions] = useState([
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
  // const [exchangeRates, setExchangeRates] = useState({});
  useEffect(() => {

    const fetchData = async () => {
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/user/fetch/userId?userId=${user.id}`
      );
      const accounts = response1.data.accounts;

      // Calculate account statuses and filter active accounts
      const statusCounts = accounts.reduce(
        (acc, account) => {
          acc[account.status.toLowerCase()] += 1;
          return acc;
        },
        { active: 0, pending: 0, closed: 0, rejected: 0 }
      );

      const activeAccounts = accounts.filter(
        (account) => account.status.toLowerCase() === "active"
      );
      handleAccountClick(activeAccounts[0]);
      let exchangeRates= {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.75,
        INR: 74.0,
        JPY: 110.0,
        CAD: 1.25,
      };
      try {
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/521c4cac49833694704ab4b3/latest/USD`
        );
        exchangeRates = response.data.conversion_rates;
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
       

      let total = 0;
      activeAccounts.forEach((account) => {
        const accountBalance = parseFloat(account.accountBalance);
        const accountCurrency = account.currency;
        const exchangeRate = exchangeRates[accountCurrency];
        if (exchangeRate) {
          total += accountBalance / exchangeRate;
        }
      });
      setTotalInUSD(total.toFixed(2));

      const currencyTotals = activeAccounts.reduce((acc, account) => {
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
          closed: statusCounts.closed,
          rejected: statusCounts.rejected,
        },
        currencyAmounts,
        activeAccounts,
      }));
    };

    const fetchtransactions = async () => {
      const response1 = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/transaction/fetch/customer/transactions/all?customerId=` +
          user.id,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      let Accountstransactions = response1.data.transactions;
      Accountstransactions.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB - dateA; // For descending order (latest date first)
        // return dateB - dateA; // For descending order
      });
      console.log(transactions);
      setTransactions(Accountstransactions);
      if (Accountstransactions.length < 9) {
        // Fetch or generate additional transactions if needed
        // For now, we will just log a message
        console.log(
          `Only ${Accountstransactions.length} transactions found. Need more transactions.`
        );
      } else {
        // Select the first 10 transactions
        Accountstransactions = Accountstransactions.slice(0, 9);
      }

      setAccountTransactions(Accountstransactions);
     

      // Calculate transaction statuses
      const statusCounts = Accountstransactions.reduce(
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
        `${process.env.REACT_APP_BASE_URL}/api/beneficiary/fetch?userId=` +
          user.id,
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken, // Replace with your actual JWT token
          },
        }
      );
      const accounts = response1.data.beneficiaryAccounts;

      // Calculate beneficiary statuses
      const statusCounts = accounts.reduce(
        (acc, account) => {
          acc[account.status.toLowerCase()] += 1;
          return acc;
        },
        { active: 0, pending: 0, closed: 0, rejected: 0 }
      );
      setData((prevData) => ({
        ...prevData,
        beneficiary: {
          active: statusCounts.active,
          pending: statusCounts.pending,
          closed: statusCounts.closed,
          rejected: statusCounts.rejected,
        },
      }));
    };

    fetchData();
    fetchtransactions();
    retrieveAllBeneficiary();
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      // Make GET request to the API endpoint to fetch currencies
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/currencies/fatch`
      );
      // Set the fetched currencies data to state
      setCurrencies(response.data.currencyDetails);
      if (!editedAccount.currency && response.data.currencyDetails.length > 0) {
        setEditedAccount({
          ...editedAccount,
          currency: response.data.currencyDetails[0].code,
        });
      }
    } catch (error) {
      // Handle error if fetching data fails
      console.error("Error fetching accounts:", error);
      // Notify error
      toast.error("Failed to fetch accounts", {
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
  const handleAccountClick = async (account) => {

    if (!account || !account.id) {
        console.error("Account data is missing or undefined:", account);
        return;
    }
    console.log("Account ID:", account.id);
    
    setHighlightedCard(account.id);
    let Accountstransactions = transactions.filter(
      (t) => t.accountNumber === account.accountNumber
    );

    // Ensure at least 10 transactions
    if (Accountstransactions.length < 9) {
      // Fetch or generate additional transactions if needed
      // For now, we will just log a message
      console.log(
        `Only ${Accountstransactions.length} transactions found. Need more transactions.`
      );
    } else {
      // Select the first 10 transactions
      Accountstransactions = Accountstransactions.slice(0, 9);
    }

    console.log(account);
    setAccountTransactions(Accountstransactions);
  };
  const currencyToCountry = {
    AED: "ae",
    AFN: "af",
    ALL: "al",
    AMD: "am",
    ANG: "nl",
    AOA: "ao",
    ARS: "ar",
    AUD: "au",
    AWG: "aw",
    AZN: "az",
    BAM: "ba",
    BBD: "bb",
    BDT: "bd",
    BGN: "bg",
    BHD: "bh",
    BIF: "bi",
    BMD: "bm",
    BND: "bn",
    BOB: "bo",
    BRL: "br",
    BSD: "bs",
    BTN: "bt",
    BWP: "bw",
    BYN: "by",
    BZD: "bz",
    CAD: "ca",
    CDF: "cd",
    CHF: "ch",
    CLP: "cl",
    CNY: "cn",
    COP: "co",
    CRC: "cr",
    CUP: "cu",
    CVE: "cv",
    CZK: "cz",
    DJF: "dj",
    DKK: "dk",
    DOP: "do",
    DZD: "dz",
    EGP: "eg",
    ERN: "er",
    ETB: "et",
    EUR: "EU",
    FJD: "fj",
    FKP: "fk",
    FOK: "fo",
    GBP: "gb",
    GEL: "ge",
    GGP: "gg",
    GHS: "gh",
    GIP: "gi",
    GMD: "gm",
    GNF: "gn",
    GTQ: "gt",
    GYD: "gy",
    HKD: "hk",
    HNL: "hn",
    HRK: "hr",
    HTG: "ht",
    HUF: "hu",
    IDR: "id",
    ILS: "il",
    IMP: "im",
    INR: "in",
    IQD: "iq",
    IRR: "ir",
    ISK: "is",
    JEP: "je",
    JMD: "jm",
    JOD: "jo",
    JPY: "jp",
    KES: "ke",
    KGS: "kg",
    KHR: "kh",
    KID: "ki",
    KMF: "km",
    KRW: "kr",
    KWD: "kw",
    KYD: "ky",
    KZT: "kz",
    LAK: "la",
    LBP: "lb",
    LKR: "lk",
    LRD: "lr",
    LSL: "ls",
    LYD: "ly",
    MAD: "ma",
    MDL: "md",
    MGA: "mg",
    MKD: "mk",
    MMK: "mm",
    MNT: "mn",
    MOP: "mo",
    MRU: "mr",
    MUR: "mu",
    MVR: "mv",
    MWK: "mw",
    MXN: "mx",
    MYR: "my",
    MZN: "mz",
    NAD: "na",
    NGN: "ng",
    NIO: "ni",
    NOK: "no",
    NPR: "np",
    NZD: "nz",
    OMR: "om",
    PAB: "pa",
    PEN: "pe",
    PGK: "pg",
    PHP: "ph",
    PKR: "pk",
    PLN: "pl",
    PYG: "py",
    QAR: "qa",
    RON: "ro",
    RSD: "rs",
    RUB: "ru",
    RWF: "rw",
    SAR: "sa",
    SBD: "sb",
    SCR: "sc",
    SDG: "sd",
    SEK: "se",
    SGD: "sg",
    SHP: "sh",
    SLL: "sl",
    SOS: "so",
    SRD: "sr",
    SSP: "ss",
    STN: "st",
    SYP: "sy",
    SZL: "sz",
    THB: "th",
    TJS: "tj",
    TMT: "tm",
    TND: "tn",
    TOP: "to",
    TRY: "tr",
    TTD: "tt",
    TVD: "tv",
    TWD: "tw",
    TZS: "tz",
    UAH: "ua",
    UGX: "ug",
    USD: "us",
    UYU: "uy",
    UZS: "uz",
    VES: "ve",
    VND: "vn",
    VUV: "vu",
    WST: "ws",
    XAF: "cm",
    XCD: "ag",
    XOF: "bj",
    XPF: "pf",
    YER: "ye",
    ZAR: "za",
    ZMW: "zm",
    ZWL: "zw",
  };
  const currencySymbols = {
    AED: 'د.إ',   // United Arab Emirates Dirham
    AFN: '؋',    // Afghan Afghani
    ALL: 'L',    // Albanian Lek
    AMD: '֏',    // Armenian Dram
    ANG: 'ƒ',    // Netherlands Antillean Guilder
    AOA: 'Kz',   // Angolan Kwanza
    ARS: '$',    // Argentine Peso
    AUD: 'A$',   // Australian Dollar
    AWG: 'ƒ',    // Aruban Florin
    AZN: '₼',    // Azerbaijani Manat
    BAM: 'KM',   // Bosnia-Herzegovina Convertible Mark
    BBD: '$',    // Barbadian Dollar
    BDT: '৳',    // Bangladeshi Taka
    BGN: 'лв',   // Bulgarian Lev
    BHD: '.د.ب',  // Bahraini Dinar
    BIF: 'FBu',  // Burundian Franc
    BMD: '$',    // Bermudian Dollar
    BND: '$',    // Brunei Dollar
    BOB: 'Bs.',  // Bolivian Boliviano
    BRL: 'R$',   // Brazilian Real
    BSD: '$',    // Bahamian Dollar
    BTN: 'Nu.',  // Bhutanese Ngultrum
    BWP: 'P',    // Botswanan Pula
    BYN: 'Br',   // Belarusian Ruble
    BZD: '$',    // Belize Dollar
    CAD: 'C$',   // Canadian Dollar
    CDF: 'FC',   // Congolese Franc
    CHF: 'CHF',  // Swiss Franc
    CLP: '$',    // Chilean Peso
    CNY: '¥',    // Chinese Yuan
    COP: '$',    // Colombian Peso
    CRC: '₡',    // Costa Rican Colón
    CUP: '$',    // Cuban Peso
    CVE: 'Esc',  // Cape Verdean Escudo
    CZK: 'Kč',   // Czech Republic Koruna
    DJF: 'Fdj',  // Djiboutian Franc
    DKK: 'kr',   // Danish Krone
    DOP: 'RD$',  // Dominican Peso
    DZD: 'د.ج',  // Algerian Dinar
    EGP: '£',    // Egyptian Pound
    ERN: 'Nfk',  // Eritrean Nakfa
    ETB: 'Br',   // Ethiopian Birr
    EUR: '€',    // Euro
    FJD: '$',    // Fijian Dollar
    FKP: '£',    // Falkland Islands Pound
    FOK: 'kr',   // Faroese Króna
    GBP: '£',    // British Pound Sterling
    GEL: '₾',    // Georgian Lari
    GGP: '£',    // Guernsey Pound
    GHS: '₵',    // Ghanaian Cedi
    GIP: '£',    // Gibraltar Pound
    GMD: 'D',    // Gambian Dalasi
    GNF: 'FG',   // Guinean Franc
    GTQ: 'Q',    // Guatemalan Quetzal
    GYD: '$',    // Guyanaese Dollar
    HKD: 'HK$',  // Hong Kong Dollar
    HNL: 'L',    // Honduran Lempira
    HRK: 'kn',   // Croatian Kuna
    HTG: 'G',    // Haitian Gourde
    HUF: 'Ft',   // Hungarian Forint
    IDR: 'Rp',   // Indonesian Rupiah
    ILS: '₪',    // Israeli New Sheqel
    IMP: '£',    // Isle of Man Pound
    INR: '₹',    // Indian Rupee
    IQD: 'ع.د',   // Iraqi Dinar
    IRR: '﷼',    // Iranian Rial
    ISK: 'kr',   // Icelandic Króna
    JEP: '£',    // Jersey Pound
    JMD: 'J$',   // Jamaican Dollar
    JOD: 'د.ا',   // Jordanian Dinar
    JPY: '¥',    // Japanese Yen
    KES: 'KSh',  // Kenyan Shilling
    KGS: 'лв',   // Kyrgystani Som
    KHR: '៛',    // Cambodian Riel
    KID: '$',    // Kiribati Dollar
    KMF: 'CF',   // Comorian Franc
    KRW: '₩',    // South Korean Won
    KWD: 'د.ك',   // Kuwaiti Dinar
    KYD: '$',    // Cayman Islands Dollar
    KZT: '₸',    // Kazakhstani Tenge
    LAK: '₭',    // Laotian Kip
    LBP: 'ل.ل',   // Lebanese Pound
    LKR: 'Rs',   // Sri Lankan Rupee
    LRD: '$',    // Liberian Dollar
    LSL: 'L',    // Lesotho Loti
    LYD: 'ل.د',   // Libyan Dinar
    MAD: 'د.م.',  // Moroccan Dirham
    MDL: 'L',    // Moldovan Leu
    MGA: 'Ar',   // Malagasy Ariary
    MKD: 'ден',  // Macedonian Denar
    MMK: 'K',    // Myanma Kyat
    MNT: '₮',    // Mongolian Tugrik
    MOP: 'MOP$', // Macanese Pataca
    MRU: 'UM',   // Mauritanian Ouguiya
    MUR: '₨',    // Mauritian Rupee
    MVR: 'Rf',   // Maldivian Rufiyaa
    MWK: 'MK',   // Malawian Kwacha
    MXN: '$',    // Mexican Peso
    MYR: 'RM',   // Malaysian Ringgit
    MZN: 'MT',   // Mozambican Metical
    NAD: '$',    // Namibian Dollar
    NGN: '₦',    // Nigerian Naira
    NIO: 'C$',   // Nicaraguan Córdoba
    NOK: 'kr',   // Norwegian Krone
    NPR: '₨',    // Nepalese Rupee
    NZD: 'NZ$',  // New Zealand Dollar
    OMR: 'ر.ع.',  // Omani Rial
    PAB: 'B/.',  // Panamanian Balboa
    PEN: 'S/.',  // Peruvian Nuevo Sol
    PGK: 'K',    // Papua New Guinean Kina
    PHP: '₱',    // Philippine Peso
    PKR: '₨',    // Pakistani Rupee
    PLN: 'zł',   // Polish Zloty
    PYG: '₲',    // Paraguayan Guarani
    QAR: 'ر.ق',   // Qatari Rial
    RON: 'lei',  // Romanian Leu
    RSD: 'дин.', // Serbian Dinar
    RUB: '₽',    // Russian Ruble
    RWF: 'FRw',  // Rwandan Franc
    SAR: 'ر.س',   // Saudi Riyal
    SBD: '$',    // Solomon Islands Dollar
    SCR: '₨',    // Seychellois Rupee
    SDG: 'ج.س.',  // Sudanese Pound
    SEK: 'kr',   // Swedish Krona
    SGD: 'S$',   // Singapore Dollar
    SHP: '£',    // Saint Helena Pound
    SLL: 'Le',   // Sierra Leonean Leone
    SOS: 'Sh',   // Somali Shilling
    SRD: '$',    // Surinamese Dollar
    SSP: '£',    // South Sudanese Pound
    STN: 'Db',   // São Tomé and Príncipe Dobra
    SYP: '£',    // Syrian Pound
    SZL: 'L',    // Swazi Lilangeni
    THB: '฿',    // Thai Baht
    TJS: 'ЅМ',   // Tajikistani Somoni
    TMT: 'T',    // Turkmenistani Manat
    TND: 'د.ت',   // Tunisian Dinar
    TOP: 'T$',   // Tongan Paʻanga
    TRY: '₺',    // Turkish Lira
    TTD: 'TT$',  // Trinidad and Tobago Dollar
    TVD: '$',    // Tuvaluan Dollar
    TWD: 'NT$',  // New Taiwan Dollar
    TZS: 'TSh',  // Tanzanian Shilling
    UAH: '₴',    // Ukrainian Hryvnia
    UGX: 'USh',  // Ugandan Shilling
    USD: '$',    // United States Dollar
    UYU: '$U',   // Uruguayan Peso
    UZS: 'лв',   // Uzbekistan Som
    VES: 'Bs.S', // Venezuelan Bolívar Soberano
    VND: '₫',    // Vietnamese Dong
    VUV: 'VT',   // Vanuatu Vatu
    WST: 'T',    // Samoan Tala
    XAF: 'FCFA', // CFA Franc BEAC
    XCD: '$',    // East Caribbean Dollar
    XDR: 'SDR',  // Special Drawing Rights
    XOF: 'CFA',  // CFA Franc BCEAO
    XPF: '₣',    // CFP Franc
    YER: '﷼',    // Yemeni Rial
    ZAR: 'R',    // South African Rand
    ZMW: 'ZK',   // Zambian Kwacha
    ZWL: 'Z$',   // Zimbabwean Dollar
  };
  
  const handleCloseForm = () => {
    setIsAccountFormOpen(false);
  };
  const handleOpenForm = () => {
    setIsAccountFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if an account with the selected currency already exists
    const existingAccount = data.activeAccounts.find(
      (account) => account.currency === editedAccount.currency
    );
    if (existingAccount) {
      toast.error("An account with this currency already exists", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      // Make POST request to the API endpoint to add account
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/user/addAccount`,
        {
          userId: user.id,
          currency: editedAccount.currency,
          currencyId: currencies.find(
            (currency) => currency.code === editedAccount.currency
          )?.id,
        },
        {
          headers: {
            Authorization: "Bearer " + customer_jwtToken,
          },
        }
      );
      // Notify success
      toast.success("Account is created successfully waiting for admin approval.", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Pass new account data to parent component
      // fetchAccountData();
      handleCloseForm();
    } catch (error) {
      // Notify error
      toast.error("Failed to add account", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Error adding account:", error);
    }
  };

  function getCurrencySymbol(currencyCode) {
    return currencySymbols[currencyCode] || currencyCode;
  }
  const handleViewClick = (transaction) => {
    console.log(transaction);
    setSelectedTransaction(transaction);
  };
  const handleBackClick = () => {
    setSelectedTransaction(null);
  };  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h5>Dashboard</h5>
      </div>

      <div className="dashboard-content">
        <h6 className="accounts">accounts</h6>
        <h6 className="summary">Summary</h6>
      </div>
      <div className="account-container">
        <div className="account-cards">
          {data.activeAccounts.slice(0, 4).map((account) => (
            <div
              key={account.id}
              className={`account-card ${highlightedCard === account.id ? 'highlight' : ''}`}
              onClick={() => handleAccountClick(account)}
            >
              <div className="flag-circle">
                <Flag code={currencyToCountry[account.currency]} />
              </div>
              <h6 className="account-currency">{account.currency}</h6>

              <h5 className="account-number">{account.accountNumber}</h5>
              <p className="account-balance">  <b>{getCurrencySymbol(account.currency)}</b>{" "+account.accountBalance}</p>
            </div>
          ))}
        </div>

        <div
          className="account-summary"
          style={{ display: isAccountFormOpen ? "none" : "block" }}
        >
          <div
            className="strip text-color"
            // onClick={() => handleAccountClick()}
          >
            Total Balance: &nbsp;
            {totalInUSD} USD
          </div>
          <div className="strip" onClick={() => handleOpenForm()}>
            <b className="text-color">Request IBAN</b>
          </div>
        </div>
        <div
          className="account-summary"
          style={{ display: isAccountFormOpen ? "block" : "none" }}
        >
          <div className=" strip1">
            <div className="modal-header"></div>

            <div className="">
              <form>
                <div className="mb-3">
                  <label className="form-label">Currencies</label>
                  <select
                    className={`form-select ${
                      !isFormValid ? "is-invalid" : ""
                    }`}
                    value={editedAccount.currency}
                    onChange={(e) =>
                      setEditedAccount({
                        ...editedAccount,
                        currency: e.target.value,
                      })
                    }
                  >
                    {/* <option value="">Select currency...</option> */}
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name}
                      </option>
                    ))}
                  </select>
                  {!isFormValid && (
                    <div className="invalid-feedback">
                      Please select a currency.
                    </div>
                  )}
                </div>
              </form>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseForm}
              >
                Close
              </button>
              &nbsp;
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="currency-chart">
          <h3>Currency Amounts</h3>
          <CurrencyChart data={data.currencyAmounts} />
        </div>
        <div className="transaction-list">
      {!selectedTransaction ? (
        <>
          <h6 className="transaction-header text-color">
            Transactions of Highlight Account
          </h6>
          <div className="transaction-table text-color">
            <div className="transaction-row transaction-header-row">
              <span className="transaction-header-item">ID</span>
              <span className="transaction-header-item">Date</span>
              <span className="transaction-header-item">Type</span>
              <span className="transaction-header-item">Amount</span>
              <span className="transaction-header-item">Status</span>
              <span className="transaction-header-item">View</span>
            </div>
            {accountTransactions.map((transaction, index) => (
              <div
                key={index}
                className={`transaction-row transaction-status-${transaction.status.toLowerCase()} transaction-type-${transaction.type.toLowerCase()}`}
              >
                <span className="transaction-id">{transaction.id}</span>
                <span className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
                <span className="transaction-type">{transaction.type}</span>
                <span className="transaction-amount">{transaction.billAmount} {transaction.toCurrency || ''}</span>
                <span className="transaction-status">{transaction.status}</span>
                <span className="transaction-view">
                  <button onClick={() => handleViewClick(transaction)}>View</button>
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="transaction-details text-color">
        <h4>Transaction Details</h4> <button   type="button" className="btn btn-primary" onClick={handleBackClick}>Back to Transactions</button>
        <p><strong>Transaction Reference ID:</strong> {selectedTransaction.transactionRefId}</p>
        <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</p>
        <p><strong>Type:</strong> {selectedTransaction.type}</p>
        <p><strong>Account Number:</strong> {selectedTransaction.accountNumber}</p>
        <p><strong>Transaction Amount:</strong> {selectedTransaction.amount +" "+selectedTransaction.fromCurrency}</p>
        <p><strong>Bill Amount:</strong> {selectedTransaction.billAmount} {selectedTransaction.toCurrency || 'N/A'}</p>
        <p><strong>Fee:</strong> {selectedTransaction.fee +" "+selectedTransaction.fromCurrency}</p>
        <p><strong>Description:</strong> {selectedTransaction.description || 'N/A'}</p>      
        <p><strong>Country:</strong> {selectedTransaction.country || 'N/A'}</p>
        <p><strong>Purpose:</strong> {selectedTransaction.purpose || 'N/A'}</p>
        <p><strong>Bank Address:</strong> {selectedTransaction.bankAddress || 'N/A'}</p>
        <p><strong>Bank Name:</strong> {selectedTransaction.bankName || 'N/A'}</p>
        <p><strong>Beneficiary Account Number:</strong> {selectedTransaction.beneficiaryAccountNumber || 'N/A'}</p>
        <p><strong>Beneficiary Name:</strong> {selectedTransaction.beneficiaryName || 'N/A'}</p>
        <p><strong>Sender Address:</strong> {selectedTransaction.senderAddress || 'N/A'}</p>
        <p><strong>Sender Name:</strong> {selectedTransaction.senderName || 'N/A'}</p>
        <p><strong>SWIFT Code:</strong> {selectedTransaction.swiftCode || 'N/A'}</p>
        <p><strong>Status:</strong> {selectedTransaction.status}</p>
      </div>
      )}
    </div>
      </div>
      <div className="dashboard-summary">
        <Link
          className="summary-item"
          aria-current="page"
          to="/customer/UserAccounts"
        >
          <h3>Accounts</h3>
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
          to="/customer/transaction/all"
        >
          <h3>Transactions</h3>
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
          to="/customer/beneficiary/view"
        >
          <h3>Beneficiary</h3>
          <div className="summary-details">
            <div className="summary-detail">
              <h6>Active</h6>
              <p>{data.beneficiary.active}</p>
            </div>
            <div className="summary-detail">
              <h6>Pending</h6>
              <p>{data.beneficiary.pending}</p>
            </div>
            <div className="summary-detail">
              <h6>Closed</h6>
              <p>{data.beneficiary.closed}</p>
            </div>
            <div className="summary-detail">
              <h6>Rejected</h6>
              <p>{data.beneficiary.rejected}</p>
            </div>
            <div className="summary-detail">
              <h6>Total</h6>
              <p>
                {data.beneficiary.active +
                  data.beneficiary.pending +
                  data.beneficiary.closed +
                  data.beneficiary.rejected}
              </p>
            </div>
          </div>
        </Link>
      </div>

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
  const barCanvasRef = useRef(null);
  const doughnutCanvasRef = useRef(null);

  useEffect(() => {
    drawBarChart();
    drawDoughnutChart();
  }, [data]);

  const drawBarChart = () => {
    const canvas = barCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data || data.length === 0) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
      return;
    }

    const maxAmount = Math.max(...data.map(({ amount }) => amount));
    if (maxAmount === 0) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
      return;
    }

    const barWidth = (canvas.width - 80) / data.length;
    const canvasHeight = canvas.height;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    const gridSpacing = 20;
    for (let i = gridSpacing; i < canvasHeight; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    data.forEach(({ amount, currency }, index) => {
      if (amount === 0) return;

      const barHeight = (amount / maxAmount) * (canvasHeight - 40);

      ctx.fillStyle = getColor(index);
      ctx.fillRect(
        30 + index * barWidth,
        canvasHeight - barHeight - 20,
        barWidth - 5,
        barHeight
      );

      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.font = "12px Arial";
      ctx.fillText(
        currency,
        30 + index * barWidth + (barWidth - 5) / 2,
        canvasHeight - 5
      );
      ctx.fillText(
        amount,
        30 + index * barWidth + (barWidth - 5) / 2,
        canvasHeight - barHeight - 25
      );
    });

    ctx.fillStyle = "#000";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "10px Arial";
    for (let i = 0; i <= maxAmount; i += maxAmount / 5) {
      const y = canvasHeight - 20 - (i / maxAmount) * (canvasHeight - 40);
      ctx.fillText(i, 20, y);
    }
  };

  const drawDoughnutChart = () => {
    const canvas = doughnutCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!data || data.length === 0) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
      return;
    }

    const totalAmount = data.reduce((acc, { amount }) => acc + amount, 0);
    if (totalAmount === 0) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#ccc";
      ctx.textAlign = "center";
      ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
      return;
    }

    let startAngle = 0;

    data.forEach(({ amount, currency }, index) => {
      if (amount === 0) return;

      const sliceAngle = (amount / totalAmount) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 2 - 20,
        startAngle,
        endAngle
      );
      ctx.closePath();

      ctx.fillStyle = getColor(index);
      ctx.fill();

      startAngle = endAngle;
    });

    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.height / 4,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };

  const getColor = (index) => {
    const colors = [
      "#1976D2",
      "#36d1dc",
      "#282f4b",
      "#8e44ad",
      "#3498db",
      "#2ecc71",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="chartContainer">
      <div className="dataContainer">
        <div>
          {data.map(({ currency, amount }, index) => (
            <div key={index} className="dataItem">
              <div
                className="colorBox"
                style={{ backgroundColor: getColor(index) }}
              ></div>
              <span>{`${currency}:  ${amount}`}</span>
            </div>
          ))}
        </div>
        <canvas ref={doughnutCanvasRef} className="doughnutCanvas" width={200} height={200}></canvas>
      </div>
      <canvas ref={barCanvasRef} className="barCanvas" width={500} height={200}></canvas>
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
      <div className="transaction-form">
        <h3>Letest Transaction</h3>
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="hide-on-mobile">Description</th>
              <th>Transaction Ref ID</th>
              <th>Fee</th>
              <th>Date</th>
              <th className="hide-on-mobile">Currency</th>
              <th>Account Number</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0,5).map((transaction, index) => (
              <tr key={index} className="">
                <td>{transaction.type || "N/A"}</td>
                <td>{transaction.billAmount|| "N/A"}</td>
                <td>{transaction.status || "N/A"}</td>
                <td className="hide-on-mobile">
                  {transaction.description || "N/A"}
                </td>
                <td>{transaction.transactionRefId || "N/A"}</td>
                <td>{transaction.fee || "N/A"}</td>
                <td>{transaction.date || "N/A"}</td>
                <td className="hide-on-mobile">
                  {transaction.toCurrency || "N/A"}
                </td>
                <td>{transaction.accountNumber || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="currency-converter">
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
          &nbsp;
          <button onClick={handleConvert} className="convert-button">
            Convert
          </button>
        </div>
        {result !== null && (
          <div >
            <h6>Converted Amount: {result.toFixed(2)}</h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
