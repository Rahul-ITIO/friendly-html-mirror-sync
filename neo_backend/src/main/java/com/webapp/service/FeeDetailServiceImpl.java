//The FeeDetailServiceImpl class provides the implementation for managing FeeDetail entities, including adding new details, retrieving details by ID or type, and listing all details. It interacts with the FeeDetailDao to perform these operations and is a crucial part of the application's service layer

package com.webapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.FeeDetailDao;
import com.webapp.entity.FeeDetail;

@Service
public class FeeDetailServiceImpl implements FeeDetailService {

	@Autowired
	private FeeDetailDao feeDetailDao;
	
      // Adds a new fee detail to the database
	@Override
	public FeeDetail addFeeDetail(FeeDetail feeDetail) {
		
		// Save the fee detail entity to the database and return the saved entity
		return feeDetailDao.save(feeDetail);
	}
	
        //Retrieves a fee detail by its ID.
	@Override
	public FeeDetail getFeeDetailById(int feeDetailId) {
		
		 // Find the fee detail entity by its ID
		Optional<FeeDetail> optional = this.feeDetailDao.findById(feeDetailId);

		 // Return the fee detail if present, otherwise return null
		if(optional.isPresent()) {
			return optional.get();
		}
		
		return null;
	}
	
       // Retrieves a fee detail by its type
	@Override
	public FeeDetail getFeeDetailByType(String type) {
		 // Find the fee detail entity by its type
		return this.feeDetailDao.findByType(type);
	}

	//Retrieves all fee details from the database
	@Override
	public List<FeeDetail> getAllFeeDetails() {
		// Find and return all fee detail entities from the database
		return feeDetailDao.findAll();
	}

}
