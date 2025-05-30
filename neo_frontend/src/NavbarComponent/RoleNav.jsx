import AdminHeader from "./AdminHeader";
import NormalHeader from "./NormalHeader";
import CustomerHeader from "./CustomerHeader";
import BankHeader from "./BankHeader";
import { useState } from "react";

const RoleNav = ({ toggleSidebar }) => {
  const customer = JSON.parse(sessionStorage.getItem("active-customer"));
  const admin = JSON.parse(sessionStorage.getItem("active-admin"));
  const bank = JSON.parse(sessionStorage.getItem("active-bank"));

  if (admin != null) {
    return  <div className={`sidebar ${true ? "show" : "show"}`}><AdminHeader toggleSidebar={toggleSidebar} /></div>;
  } else if (customer != null) {
    return <div className={`sidebar ${true ? "show" : "show"}`}><CustomerHeader toggleSidebar={toggleSidebar}/></div>;
  } else if (bank != null) {
    return <div className={`sidebar ${true ? "show" : "show"}`}><BankHeader toggleSidebar={toggleSidebar}/></div>;
  } else {
  }
};

export default RoleNav;