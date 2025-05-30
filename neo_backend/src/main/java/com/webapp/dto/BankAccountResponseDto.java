//The BankAccountResponseDto class is used to transfer a collection of bank account details as part of an API response. It extends CommonApiResponse, which means it inherits properties like responseMessage and isSuccess, ensuring that the response includes not only the bank account data but also standard response attributes such as success status and messages. This helps in providing a consistent and structured response format for clients consuming the API
package com.webapp.dto;

import java.util.List;

import com.webapp.entity.BankAccount;

public class BankAccountResponseDto extends CommonApiResponse {

	private List<BankAccount> accounts;

	public List<BankAccount> getAccounts() {
		return accounts;
	}

	public void setAccounts(List<BankAccount> accounts) {
		this.accounts = accounts;
	}

}
