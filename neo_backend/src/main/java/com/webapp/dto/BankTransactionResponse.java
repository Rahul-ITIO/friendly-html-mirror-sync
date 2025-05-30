//The BankTransactionResponse class serves as a Data Transfer Object (DTO) for API responses that need to include a list of bank transactions. By extending CommonApiResponse, it ensures a standardized response format while focusing on delivering transaction-specific details. This organization helps in managing and presenting bank transaction data in a consistent and structured way, making it easier for clients to interpret and use the information
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.BankTransaction;

public class BankTransactionResponse extends CommonApiResponse {

	List<BankTransaction> transactions = new ArrayList<>();

	public List<BankTransaction> getTransactions() {
		return transactions;
	}

	public void setTransactions(List<BankTransaction> transactions) {
		this.transactions = transactions;
	}

}
