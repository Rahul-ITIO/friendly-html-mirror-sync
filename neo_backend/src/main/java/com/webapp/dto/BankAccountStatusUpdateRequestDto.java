//The BankAccountStatusUpdateRequestDto class is used to package and transfer data required for updating the status of a bank account. It provides a structured way to handle this specific type of request in an API or service layer, ensuring that the account ID and new status are correctly conveyed and processed
package com.webapp.dto;

public class BankAccountStatusUpdateRequestDto {

	private int accountId;

	private String status;

	public int getAccountId() {
		return accountId;
	}

	public void setAccountId(int accountId) {
		this.accountId = accountId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
