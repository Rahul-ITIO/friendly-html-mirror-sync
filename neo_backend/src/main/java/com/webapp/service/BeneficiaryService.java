//The purpose of the BeneficiaryService interface is to specify the methods that should be implemented by any service class that handles operations related to Beneficiary entities. It defines the business logic for managing beneficiaries, including creating, updating, retrieving, and querying beneficiaries
package com.webapp.service;

import java.util.List;

import com.webapp.entity.Beneficiary;
import com.webapp.entity.User;

public interface BeneficiaryService {

	Beneficiary addBeneficiary(Beneficiary beneficiary);
	
	Beneficiary updateBeneficiary(Beneficiary beneficiary);
	
	Beneficiary getById(int beneficiaryId);
	
	List<Beneficiary> getAllUserBeneficiaryAndStatus(User user, String status);
	
}
