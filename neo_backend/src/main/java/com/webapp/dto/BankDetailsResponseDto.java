//The BankDetailsResponseDto class provides a structured response format for API calls or service methods that return a list of bank details. It combines the standard response fields from CommonApiResponse with a specific list of Bank entities, making it easier to manage and transport bank-related data in a consistent manner

package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.Bank;

public class BankDetailsResponseDto extends CommonApiResponse {

	private List<Bank> banks = new ArrayList<>();

	public List<Bank> getBanks() {
		return banks;
	}

	public void setBanks(List<Bank> banks) {
		this.banks = banks;
	}

}
