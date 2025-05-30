package com.webapp.resource;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.webapp.dto.BeneficiaryAccountResponse;
import com.webapp.dto.CommonApiResponse;
import com.webapp.entity.Beneficiary;
import com.webapp.entity.User;
import com.webapp.service.BeneficiaryService;
import com.webapp.service.UserService;
import com.webapp.utility.Constants.BeneficiaryStatus;

@Component
public class BeneficiaryResource {

	private final Logger LOG = LoggerFactory.getLogger(BankAccountResource.class);

	@Autowired
	private BeneficiaryService beneficiaryService;

	@Autowired
	private UserService userService;

	public ResponseEntity<CommonApiResponse> addBeneficiaryAccount(Beneficiary beneficiary) {
		
               // Log the request for adding a beneficiary account
		LOG.info("Received request for add beneficiary account");

		CommonApiResponse response = new CommonApiResponse();
		
                 // Validate if the beneficiary object is null
		if (beneficiary == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		// Check if the userId is present in the beneficiary object
		if (beneficiary.getUserId()  == null) {
			response.setResponseMessage("bad request, user not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                  // Ensure all required fields are present
		if (beneficiary.getAccountNumber() == null || beneficiary.getBankAddress() == null
				|| beneficiary.getBankName() == null || beneficiary.getBeneficiaryName() == null
				|| beneficiary.getCountry() == null || beneficiary.getSwiftCode() == null
				|| beneficiary.getUserId() == null) {
			response.setResponseMessage("bad request, missing input");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                  // Retrieve user and set beneficiary details
		User user = this.userService.getUserById(beneficiary.getUserId());
		
		 // Set the status of the beneficiary to ACTIVE and associate it with the retrieved user
		beneficiary.setStatus(BeneficiaryStatus.ACTIVE.value());
		beneficiary.setUser(user);
		
                 // Add the beneficiary to the system
		Beneficiary addedBeneficiary = this.beneficiaryService.addBeneficiary(beneficiary);
		
                 // Check if the beneficiary was successfully added
		if (addedBeneficiary != null) {
			

			response.setResponseMessage("Beneficiary Account Added Successful!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} else {
			response.setResponseMessage("Failed to add the beneficiary account");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

	}

	public ResponseEntity<BeneficiaryAccountResponse> getBeneficiaryAccountByUserId(Integer userId) {
		
               // Log the request to get beneficiary accounts by userId
		LOG.info("Received request for add beneficiary account");

		BeneficiaryAccountResponse response = new BeneficiaryAccountResponse();
		
                // Check if the userId parameter is null
		if (userId == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<BeneficiaryAccountResponse>(response, HttpStatus.BAD_REQUEST);
		}
                 // Retrieve the user based on the provided userId
		User user = this.userService.getUserById(userId);
		
                 // Check if the user was found
		if (user == null) {
			response.setResponseMessage("bad request, user not found");
			response.setSuccess(true);

			return new ResponseEntity<BeneficiaryAccountResponse>(response, HttpStatus.BAD_REQUEST);
		}
                 // Fetch the list of active beneficiaries for the retrieved user
		List<Beneficiary> beneficiaries = this.beneficiaryService.getAllUserBeneficiaryAndStatus(user,
				BeneficiaryStatus.ACTIVE.value());

		// Check if any beneficiaries were found
		if (beneficiaries != null) {
                          // Set the list of beneficiaries in the response
			response.setBeneficiaryAccounts(beneficiaries);
			response.setResponseMessage("Beneficiary Accounts Fetched Successful!!!");
			response.setSuccess(true);

			return new ResponseEntity<BeneficiaryAccountResponse>(response, HttpStatus.OK);
		} else {
			 // No beneficiaries found, set appropriate response message
			response.setResponseMessage("No Beneficary accounts found!!!");
			response.setSuccess(true);

			return new ResponseEntity<BeneficiaryAccountResponse>(response, HttpStatus.OK);
		}

	}

	public ResponseEntity<CommonApiResponse> updateBeneficiaryAccount(Beneficiary beneficiary) {
		
                // Log the incoming request to update a beneficiary account
		LOG.info("Received request for add beneficiary account");

		CommonApiResponse response = new CommonApiResponse();
                // Check if the beneficiary object is null
		if (beneficiary == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                  // Validate required fields for updating the beneficiary account
		if (beneficiary.getId() == 0 || beneficiary.getAccountNumber() == null || beneficiary.getBankAddress() == null
				|| beneficiary.getBankName() == null || beneficiary.getBeneficiaryName() == null
				|| beneficiary.getCountry() == null || beneficiary.getSwiftCode() == null
				|| beneficiary.getUser() == null) {
			response.setResponseMessage("bad request, missing input");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                 // Set the status of the beneficiary to ACTIVE
		beneficiary.setStatus(BeneficiaryStatus.ACTIVE.value());
		
                 // Fetch the existing beneficiary record from the database using the provided ID
		Beneficiary fetchedBeneficiary = this.beneficiaryService.getById(beneficiary.getId());
		
                // Ensure the user is set correctly from the existing beneficiary record
		beneficiary.setUser(fetchedBeneficiary.getUser());
		
                 // Update the beneficiary record in the database
		Beneficiary addedBeneficiary = this.beneficiaryService.updateBeneficiary(beneficiary);
		
                  // Check if the update was successful
		if (addedBeneficiary != null) {

			response.setResponseMessage("Beneficiary Account Updated Successful!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} else {
			response.setResponseMessage("Failed to update the beneficiary account");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

	}

	public ResponseEntity<CommonApiResponse> deleteBeneficiaryAccount(Integer beneficiaryId) {
              // Log the incoming request to delete a beneficiary account
		LOG.info("Received request for add beneficiary account");

		CommonApiResponse response = new CommonApiResponse();
		
                 // Check if the beneficiary ID is provided
		if (beneficiaryId == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
                 // Retrieve the beneficiary record from the database using the provided ID
		Beneficiary fetchedBeneficiary = this.beneficiaryService.getById(beneficiaryId);
		
                 // Check if the beneficiary record exists
		if (fetchedBeneficiary == null) {
			response.setResponseMessage("bad request, beneficiary not found!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
                 // Set the status of the beneficiary to DEACTIVATED
		fetchedBeneficiary.setStatus(BeneficiaryStatus.DEACTIVATED.value());
		
                // Update the beneficiary record in the database with the new status
		Beneficiary addedBeneficiary = this.beneficiaryService.updateBeneficiary(fetchedBeneficiary);
		
                 // Check if the update was successful
		if (addedBeneficiary != null) {

			response.setResponseMessage("Beneficiary Account Deleted Successful!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} else {
			response.setResponseMessage("Failed to delete the beneficiary account");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

	}

}
