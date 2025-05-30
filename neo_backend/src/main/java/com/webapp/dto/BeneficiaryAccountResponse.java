//The BeneficiaryAccountResponse class serves to format API responses that include beneficiary account details. By extending CommonApiResponse, it ensures consistency with other response types while focusing on providing specific data related to beneficiary accounts. This class helps in structuring the response in a way that clients can easily interpret and use the beneficiary information provided by the API.
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.Beneficiary;

public class BeneficiaryAccountResponse extends CommonApiResponse {

	private List<Beneficiary> beneficiaryAccounts = new ArrayList<>();

	public List<Beneficiary> getBeneficiaryAccounts() {
		return beneficiaryAccounts;
	}

	public void setBeneficiaryAccounts(List<Beneficiary> beneficiaryAccounts) {
		this.beneficiaryAccounts = beneficiaryAccounts;
	}

}
