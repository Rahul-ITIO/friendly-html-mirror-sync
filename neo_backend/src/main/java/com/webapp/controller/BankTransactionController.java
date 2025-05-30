//The BankTransactionController class is a REST controller in a Spring Boot application that manages bank transactions. It provides endpoints for adding money, transferring funds between accounts, fetching transaction details, and updating transaction statuses. This controller interacts with the BankTransactionResource to handle the business logic for these operations.

package com.webapp.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.dto.BankTransactionRequestDto;
import com.webapp.dto.BankTransactionResponse;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.UserStatusUpdateRequestDto;
import com.webapp.entity.UserAccounts;
import com.webapp.resource.BankTransactionResource;
import com.webapp.utility.Constants.UserStatus;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("api/transaction/")
@CrossOrigin(origins = "http://localhost:3000")
public class BankTransactionController {

	@Autowired
	private BankTransactionResource bankTransactionResource;

	@PostMapping("addMoney")
	@Operation(summary = "Api for add money")
	//Adds money to a user's account
	public ResponseEntity<CommonApiResponse> addMoney(@RequestBody BankTransactionRequestDto request) throws Exception {
		return this.bankTransactionResource.addMoney(request);
	}
         //Performs an internal money transfer between accounts.
	@PostMapping("accountTransfer/internal")
	public ResponseEntity<CommonApiResponse> moneyTransferInternal(@RequestBody Map<String, String> request) {
		return this.bankTransactionResource.moneyTransferInternal(request);
	}
         //Transfers money between accounts
	@PostMapping("accountTransfer")
	@Operation(summary = "Api for account transfer")
	public ResponseEntity<CommonApiResponse> accountTransfer(@RequestBody BankTransactionRequestDto request)
			throws Exception {
		return this.bankTransactionResource.accountTransfer(request);
	}
        //Fetches pending transactions
	@GetMapping("fetch/transactions/pending")
	@Operation(summary = "Api to get pending transactions")
	public ResponseEntity<BankTransactionResponse> fetchPendingTransaction() throws Exception {
		return this.bankTransactionResource.fetchPendingTransaction();
	}
         //Fetches successful transactions
	@GetMapping("fetch/transactions/success")
	@Operation(summary = "Api to get success transactions")
	public ResponseEntity<BankTransactionResponse> fetchSuccessTransaction() throws Exception {
		return this.bankTransactionResource.fetchSuccessTransaction();
	}
         //Fetches all transactions of a specific customer.
	@GetMapping("fetch/customer/transactions/all")
	@Operation(summary = "Api to get customer transactions")
	public ResponseEntity<BankTransactionResponse> fetchCustomerTransactions(@RequestParam("customerId") int customerId)
			throws Exception {
		return this.bankTransactionResource.fetchCustomerTransactions(customerId);
	}
         //Searches customer transactions by reference ID
	@GetMapping("search/customer/transactions/ref-id")
	@Operation(summary = "Api to serach the customer transactions")
	public ResponseEntity<BankTransactionResponse> searchCustomerTransactionsByRefId(
			@RequestParam("transactionRefId") String transactionRefId, @RequestParam("customerId") int customerId)
			throws Exception {
		return this.bankTransactionResource.fetchCustomerTransactionsByTransactionRefId(transactionRefId, customerId);
	}
         //Updates the status of a transaction
	@PutMapping("update/status")
	@Operation(summary = "Api to update the transaction status")
	public ResponseEntity<CommonApiResponse> updateTransactionStatus(@RequestBody UserStatusUpdateRequestDto request)
			throws Exception {
		return this.bankTransactionResource.updateTransactionStatus(request);
	}
         //Performs a quick account transfer
	@PostMapping("quick/accountTransfer")
	@Operation(summary = "Api for quick account transfer")
	public ResponseEntity<CommonApiResponse> quickAccountTransfer(@RequestBody BankTransactionRequestDto request)
			throws Exception {
		return this.bankTransactionResource.quickAccountTransfer(request);
	}

}
