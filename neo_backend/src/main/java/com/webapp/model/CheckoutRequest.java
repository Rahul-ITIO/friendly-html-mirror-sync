package com.webapp.model;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String fullname;
    private String bill_email;
    private String bill_phone;
    private String bill_address;
    private String bill_city;
    private String bill_country;
    private String bill_state;
    private String bill_zip;
    private Double amount;
    private String currency;
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	public String getBill_email() {
		return bill_email;
	}
	public void setBill_email(String bill_email) {
		this.bill_email = bill_email;
	}
	public String getBill_phone() {
		return bill_phone;
	}
	public void setBill_phone(String bill_phone) {
		this.bill_phone = bill_phone;
	}
	public String getBill_address() {
		return bill_address;
	}
	public void setBill_address(String bill_address) {
		this.bill_address = bill_address;
	}
	public String getBill_city() {
		return bill_city;
	}
	public void setBill_city(String bill_city) {
		this.bill_city = bill_city;
	}
	public String getBill_country() {
		return bill_country;
	}
	public void setBill_country(String bill_country) {
		this.bill_country = bill_country;
	}
	public String getBill_state() {
		return bill_state;
	}
	public void setBill_state(String bill_state) {
		this.bill_state = bill_state;
	}
	public String getBill_zip() {
		return bill_zip;
	}
	public void setBill_zip(String bill_zip) {
		this.bill_zip = bill_zip;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
    
    
}