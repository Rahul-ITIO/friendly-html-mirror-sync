//The BeneficiaryServiceImpl class provides the necessary methods to handle Beneficiary entities in the application. It ensures that business logic for managing beneficiaries is properly encapsulated and interacts with the database through the DAO layer. This service is used to manage beneficiaries' data, including creating, updating, retrieving by ID, and querying by user and status
package com.webapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.BeneficiaryDao;
import com.webapp.entity.BankTransaction;
import com.webapp.entity.Beneficiary;
import com.webapp.entity.User;

@Service
public class BeneficiaryServiceImpl implements BeneficiaryService {

	@Autowired
	private BeneficiaryDao beneficiaryDao;
	
	@Override
	public Beneficiary addBeneficiary(Beneficiary beneficiary) {
		// TODO Auto-generated method stub
		return beneficiaryDao.save(beneficiary);
	}

	@Override
	public Beneficiary updateBeneficiary(Beneficiary beneficiary) {
		// TODO Auto-generated method stub
		return beneficiaryDao.save(beneficiary);
	}

	@Override
	public Beneficiary getById(int beneficiaryId) {
		// TODO Auto-generated method stub
		Optional<Beneficiary> optional = beneficiaryDao.findById(beneficiaryId);

		if (optional.isPresent()) {
			return optional.get();
		}
		
		return null;
	}

	@Override
	public List<Beneficiary> getAllUserBeneficiaryAndStatus(User user, String status) {
		// TODO Auto-generated method stub
		return beneficiaryDao.findByUserAndStatus(user, status);
	}

	
	
}
