//The BankTransactionResponseDto class is a specialized response DTO (Data Transfer Object) used for API responses that include bank account transactions. It extends the CommonApiResponse class to maintain consistency with other API responses while focusing on delivering specific transaction details. This class helps in organizing and sending transaction data in a structured manner, making it easier for clients to process and utilize the information
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.BankAccountTransaction;

public class BankTransactionResponseDto extends CommonApiResponse {

	private List<BankAccountTransaction> bankTransactions = new ArrayList<>();

	public List<BankAccountTransaction> getBankTransactions() {
		return bankTransactions;
	}

	public void setBankTransactions(List<BankAccountTransaction> bankTransactions) {
		this.bankTransactions = bankTransactions;
	};

}
