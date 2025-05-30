//import PayinAdminPanel from "../PayinComponent/PayinAdminPanel";
import PayingAdminDashboard from "../PayinComponent/PayingAdminDashboard"; 
import PayinUserDashboard from "../PayinComponent/PayinUserDashboard";
const customer = JSON.parse(sessionStorage.getItem("active-customer"));
const admin = JSON.parse(sessionStorage.getItem("active-admin"));

const PayinHomePage = () => {
  if (customer) {
    return (
      <div>
        <PayinUserDashboard />
      </div>
    );
  } else if (admin) {
    return (
      <div>
        <PayingAdminDashboard />
      </div>
    );
  }
};

export default PayinHomePage;
