//The BeneficiaryController class is a REST controller in a Spring Boot application that manages operations related to beneficiary accounts. It provides endpoints for adding, fetching, updating, and deleting beneficiary accounts. This controller interacts with the BeneficiaryResource to perform the necessary business logic

package com.webapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.dto.BeneficiaryAccountResponse;
import com.webapp.dto.CommonApiResponse;
import com.webapp.entity.Beneficiary;
import com.webapp.resource.BeneficiaryResource;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("api/beneficiary/")
@CrossOrigin(origins = "http://localhost:3000")
public class BeneficiaryController {

	@Autowired
	private BeneficiaryResource beneficiaryResource;
         // add a new beneficiary
	@PostMapping("add")
	@Operation(summary = "Api to add Beneficiary account")
	public ResponseEntity<CommonApiResponse> addBeneficiaryAccount(@RequestBody Beneficiary beneficiary)
			throws Exception {
		return this.beneficiaryResource.addBeneficiaryAccount(beneficiary);
	}

	@GetMapping("fetch")
	@Operation(summary = "Api to fetch Beneficiary account by used id")
	//Fetches beneficiary accounts by user ID
	public ResponseEntity<BeneficiaryAccountResponse> getBeneficiaryAccountByUserId(
			@RequestParam("userId") Integer userId) throws Exception {
		return this.beneficiaryResource.getBeneficiaryAccountByUserId(userId);
	}

	@PutMapping("update")
	@Operation(summary = "Api to update Beneficiary account")
	//Updates an existing beneficiary account
	public ResponseEntity<CommonApiResponse> updateBeneficiaryAccount(@RequestBody Beneficiary beneficiary)
			throws Exception {
		return this.beneficiaryResource.updateBeneficiaryAccount(beneficiary);
	}

	@DeleteMapping("delete")
	//Deletes a beneficiary account by its ID
	@Operation(summary = "Api to delete the Beneficiary account")
	public ResponseEntity<CommonApiResponse> deleteBeneficiaryAccount(
			@RequestParam("beneficiaryId") Integer beneficiaryId)
			throws Exception {
		return this.beneficiaryResource.deleteBeneficiaryAccount(beneficiaryId);
	}

}
