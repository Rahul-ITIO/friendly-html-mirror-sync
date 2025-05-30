//The BankTransactionRequestDto class is used to gather and organize all the necessary information for a bank transaction request. It includes various fields to handle different aspects of the transaction, such as source and recipient account details, transaction amounts, fees, and purpose. This DTO facilitates smooth communication between different parts of the banking system, ensuring that all required data is correctly collected and processed
package com.webapp.dto;

import java.math.BigDecimal;

public class BankTransactionRequestDto {

	private int userId;

	private int bankId;

	private String modeOP;

	private String fee;

	private int sourceBankAccountId;

	private String transactionType;

	private String toBankAccount; // for account transfer

	private String toBankIfsc; // for account transfer

	private String accountTransferPurpose;

	private BigDecimal amount; // add money, Transfer Money

	private BigDecimal toAmount; // add money, Transfer Money

	private String senderName; // add money

	private String senderAddress; // add money

	private String description; // add money

	private String beneficiaryName; // Transfer Money

	private String accountNumber; // Transfer Money

	private String swiftCode; // Transfer money

	private String bankName; // Transfer Money

	private String bankAddress; // Transfer Money

	private String purpose; // Transfer Money

	private Integer beneficiaryId; // for quick account transfer

	private String currency; // for quick account transfer

	private String fromCurrency; // Transfer Money

	private String toCurrency; // Transfer Money

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public int getBankId() {
		return bankId;
	}

	public BigDecimal getToAmount() {
		return toAmount;
	}

	public void setToAmount(BigDecimal toAmount) {
		this.toAmount = toAmount;
	}

	public void setBankId(int bankId) {
		this.bankId = bankId;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public String getModeOP() {
		return modeOP;
	}

	public void setModeOP(String modeOP) {
		this.modeOP = modeOP;
	}

	public String getFee() {
		return fee;
	}

	public void setFee(String fee) {
		this.fee = fee;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public int getSourceBankAccountId() {
		return sourceBankAccountId;
	}

	public void setSourceBankAccountId(int sourceBankAccountId) {
		this.sourceBankAccountId = sourceBankAccountId;
	}

	public String getTransactionType() {
		return transactionType;
	}

	public void setTransactionType(String transactionType) {
		this.transactionType = transactionType;
	}

	public String getToBankAccount() {
		return toBankAccount;
	}

	public void setToBankAccount(String toBankAccount) {
		this.toBankAccount = toBankAccount;
	}

	public String getToBankIfsc() {
		return toBankIfsc;
	}

	public void setToBankIfsc(String toBankIfsc) {
		this.toBankIfsc = toBankIfsc;
	}

	public String getAccountTransferPurpose() {
		return accountTransferPurpose;
	}

	public void setAccountTransferPurpose(String accountTransferPurpose) {
		this.accountTransferPurpose = accountTransferPurpose;
	}

	public String getSenderName() {
		return senderName;
	}

	public void setSenderName(String senderName) {
		this.senderName = senderName;
	}

	public String getSenderAddress() {
		return senderAddress;
	}

	public void setSenderAddress(String senderAddress) {
		this.senderAddress = senderAddress;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getBeneficiaryName() {
		return beneficiaryName;
	}

	public void setBeneficiaryName(String beneficiaryName) {
		this.beneficiaryName = beneficiaryName;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getSwiftCode() {
		return swiftCode;
	}

	public void setSwiftCode(String swiftCode) {
		this.swiftCode = swiftCode;
	}

	public String getBankName() {
		return bankName;
	}

	public void setBankName(String bankName) {
		this.bankName = bankName;
	}

	public String getBankAddress() {
		return bankAddress;
	}

	public void setBankAddress(String bankAddress) {
		this.bankAddress = bankAddress;
	}

	public String getPurpose() {
		return purpose;
	}

	public void setPurpose(String purpose) {
		this.purpose = purpose;
	}

	public Integer getBeneficiaryId() {
		return beneficiaryId;
	}

	public void setBeneficiaryId(Integer beneficiaryId) {
		this.beneficiaryId = beneficiaryId;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public String getFromCurrency() {
		return fromCurrency;
	}

	public void setFromCurrency(String fromCurrency) {
		this.fromCurrency = fromCurrency;
	}

	public String getToCurrency() {
		return toCurrency;
	}

	public void setToCurrency(String toCurrency) {
		this.toCurrency = toCurrency;
	}
}
