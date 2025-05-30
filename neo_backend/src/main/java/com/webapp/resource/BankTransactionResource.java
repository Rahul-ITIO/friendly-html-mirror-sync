package com.webapp.resource;

import java.text.SimpleDateFormat;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.RequestBody;

import com.webapp.dao.BankTransactionDao;
import com.webapp.dao.UserAccountDao;
import com.webapp.dto.BankTransactionRequestDto;
import com.webapp.dto.BankTransactionResponse;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.UserStatusUpdateRequestDto;
import com.webapp.entity.BankTransaction;
import com.webapp.entity.Beneficiary;
import com.webapp.entity.EmailTempDetails;
import com.webapp.entity.FeeDetail;
import com.webapp.entity.User;
import com.webapp.entity.UserAccounts;
import com.webapp.service.BankTransactionService;
import com.webapp.service.BeneficiaryService;
import com.webapp.service.EmailService;
import com.webapp.service.EmailTempService;
import com.webapp.service.FeeDetailService;
import com.webapp.service.UserService;
import com.webapp.utility.Constants.BankTransactionStatus;
import com.webapp.utility.Constants.EmailTemplate;
import com.webapp.utility.Constants.FeeType;
import com.webapp.utility.Constants.TransactionType;
import com.webapp.utility.TransactionIdGenerator;

@Component
public class BankTransactionResource {
	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");// Add by Prince For Filter transaction

	@Autowired
	private BankTransactionService bankTransactionService;

	@Autowired
	private UserService userService;

	@Autowired
	private BeneficiaryService beneficiaryService;

	@Autowired
	private FeeDetailService feeDetailService;

	@Autowired
	private EmailService emailService;

	@Autowired
	private EmailTempService emailTempService;

	@Autowired
	private BankTransactionDao bankTransactionDao;

	@Autowired
	private UserAccountDao userAccountDao;

	public ResponseEntity<CommonApiResponse> addMoney(BankTransactionRequestDto request) {
		
                //Creates an instance of CommonApiResponse to hold the response data that will be returned to the client
		CommonApiResponse response = new CommonApiResponse();
                //Checks if the request is null, if the amount is null, or if the user ID is 0.
		if (request == null || request.getAmount() == null || request.getUserId() == 0) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);
                     //If any of these conditions are true, it sets the response message to indicate a "bad request" and returns a 400 Bad Request status
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
               // Rechecks if the userId is 0 to ensure that a valid user ID is provided.
		//If userId is 0, it sets an appropriate response message and returns a 400 Bad Request status.
		if (request.getUserId() == 0) {
			response.setResponseMessage("bad request, Bank user not selected");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
               // Fetches the user (customer) from the database using userId.
		User customer = this.userService.getUserById(request.getUserId());
                //If the customer is not found, it sets the response message to indicate the customer was not found and returns a 400 Bad Request status
		if (customer == null) {
			response.setResponseMessage("bad request, customer not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                // Retrieves the fee details for a credit transaction from the feeDetailService
		FeeDetail feeDetail = this.feeDetailService.getFeeDetailByType(FeeType.CREDIT_TRANSACTION.value());
		
                //If the fee details are not found, it sets an error message and returns a 500 Internal Server Error status
		if (feeDetail == null) {
			response.setResponseMessage("Fee Detail not found, Internal error!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
		// add by prince
		BigDecimal totalAmount = request.getAmount();//Gets the amount to be added from the request
		BigDecimal feePer = totalAmount.multiply(feeDetail.getFee()).divide(new BigDecimal("100")); // Add By Prince//Calculates the fee as a percentage of the total amount using the fee rate
		BigDecimal feeAmount = feePer.compareTo(feeDetail.getFeeAmount()) > 0 ? feePer : feeDetail.getFeeAmount();//Sets the fee amount to the higher of the calculated fee (feePer) or a minimum fee amount (feeDetail.getFeeAmount())
		BigDecimal amountToAdd = totalAmount.add(feeAmount);//Computes the total amount to be added, including the calculated fee
		
                //Creates a new BankTransaction object 
		BankTransaction transaction = new BankTransaction();
		//sets The account number where money will be added.
		transaction.setAccountNumber(request.getAccountNumber());
		// sets Fee details including the percentage
		transaction.setFee(String.valueOf(feeAmount) + "[" + String.valueOf(feeDetail.getFee()) + "%]");
		//sets total amount including fees
		transaction.setAmount(amountToAdd);
		//sets The original amount requested to add.
		//sets SenderName, SenderAddress, Description: Various transaction details from the request.
		transaction.setBillAmount(request.getToAmount());
		transaction.setSenderName(request.getSenderName());
		transaction.setSenderAddress(request.getSenderAddress());
		transaction.setDescription(request.getDescription());
		//sets The customer object associated with the transaction
		transaction.setUser(customer);
		//sets Type of transaction, which is set to "DEPOSIT
		transaction.setType(TransactionType.DEPOSIT.value());
		//set Status of the transaction, set to "SUCCESS
		transaction.setStatus(BankTransactionStatus.SUCCESS.value());
		//sets FromCurrency, ToCurrency: Currency conversion details if applicable.
		transaction.setFromCurrency(request.getFromCurrency());
		transaction.setToCurrency(request.getToCurrency());
		//sets A unique transaction reference ID generated for tracking purposes.
		transaction.setTransactionRefId(TransactionIdGenerator.generateUniqueTransactionRefId());
		//Current date formatted for filtering purposes.
		Date date = new Date(); // Add by Prince For Filter transaction
		transaction.setDate(formatter.format(date));// Add by Prince For Filter transaction
		//Calls bankTransactionService.addTransaction(transaction) to save the transaction in the database
		bankTransactionService.addTransaction(transaction);
		
                //Fetches the user account by accountNumber from the database
		UserAccounts account = userAccountDao.findByAccountNumber(request.getAccountNumber());
		
		//Updates the account balance by adding the amount (request.getToAmount()), defaulting to 0 if the current balance is null
		account.setAccountBalance((account.getAccountBalance() == null ? BigDecimal.ZERO : account.getAccountBalance())
				.add(request.getToAmount()));
		//Saves the updated account object to the database.
		userAccountDao.save(account);
		
                //Sends an email notification to the customer to inform them about the "Add Money" transaction using a predefined email template (EmailTemplate.ADD_MONEY).
		sendPasswordGenerationMail(customer, EmailTemplate.ADD_MONEY.value(), transaction);
               // Sets the response message to indicate that the "Add Money" request was initiated successfully.	
		response.setResponseMessage("Add Money Request Intiated!!!");
		//Marks the response as successful (success set to true).
		response.setSuccess(true);
		//Returns the response object wrapped in a ResponseEntity with an HTTP status of 200 OK
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> moneyTransferInternal(@RequestBody Map<String, String> request) {
		//create an object CommonApiResponse to hold the response data to return the client

		System.out.println("Received request: " + request);
		CommonApiResponse response = new CommonApiResponse();

		try {
			// Extract request parameters
			String fromAccountNumber = request.get("fromAccount").toString();
			String toAccountNumber = request.get("toAccount");
			String amountStr = request.get("amount");
			String toAmountStr = request.get("toAmount");
			String userIdStr = request.get("userId");
			String fee = request.get("fee");
			String beneficiaryName = request.get("beneficiaryName");
			String fromCurrency = request.get("fromCurrency");
			String toCurrency = request.get("toCurrency");

			// Checks if any of the required parameters (fromAccountNumber, toAccountNumber, amountStr, userIdStr, toAmountStr) are missing or null.
			if (fromAccountNumber == null || toAccountNumber == null || amountStr == null || userIdStr == null
					|| toAmountStr == null) {
				response.setResponseMessage("Bad request, missing data");
				response.setSuccess(false);
				//If any are missing, sets the response to indicate a "bad request" and returns a 400 Bad Request status
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			}
                        //Converts amountStr and toAmountStr to BigDecimal for arithmetic operations
			BigDecimal amount = new BigDecimal(amountStr);
			BigDecimal toAmount = new BigDecimal(toAmountStr);
			//Parses userIdStr to an integer to identify the user.
			int userId = Integer.parseInt(userIdStr);

			// Retrieves the user by userId from the database.
			User customer = userService.getUserById(userId);
			if (customer == null) {
				response.setResponseMessage("User not found");
				response.setSuccess(false);
				//if the user is not found, sets the response to indicate "User not found" and returns a 404 Not Found status
				return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
			}

			// Example: Validate accounts and perform transaction logic
			// Retrieves the "from" and "to" accounts using their respective account numbers.
			UserAccounts fromAccount = userAccountDao.findByAccountNumber(fromAccountNumber);
			UserAccounts toAccount = userAccountDao.findByAccountNumber(toAccountNumber);
			
                      //If either account is null, sets the response to "Invalid account(s)" and returns a 404 Not Found status.
			if (fromAccount == null || toAccount == null) {
				response.setResponseMessage("Invalid account(s)");
				response.setSuccess(false);
				return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
			}
                        //Checks if the fromAccountNumber is the same as the toAccountNumber. If so, it sets an error message and returns a 400 Bad Request status
			if (fromAccountNumber.equals(toAccountNumber)) {
				response.setResponseMessage("From and To accounts cannot be the same");
				response.setSuccess(false);
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			}

			// Retrieves the balance of the "from" account.
			BigDecimal fromAccountBalance = fromAccount.getAccountBalance();
			//Checks if the balance is less than the transfer amount. If true, it sets the response to "Insufficient balance" and returns a 400 Bad Request status
			if (fromAccountBalance.compareTo(amount) < 0) {
				response.setResponseMessage("Insufficient balance in the from account");
				response.setSuccess(false);
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			}

			// Creates a BankTransaction object to represent the transfer.
			BankTransaction transaction = new BankTransaction();
			transaction.setAccountNumber(fromAccountNumber);
			transaction.setAmount(amount);
			transaction.setBillAmount(toAmount); // Assuming no fees for simplicity
			transaction.setUser(customer);
			transaction.setFee(fee);
			transaction.setFromCurrency(fromCurrency);
			transaction.setToCurrency(toCurrency);
			transaction.setSenderName(customer.getName());
			transaction.setSenderAddress(customer.getAddress());
			transaction.setBeneficiaryName(beneficiaryName);
			transaction.setBeneficiaryAccountNumber(toAccountNumber);
			transaction.setType(TransactionType.ACCOUNT_TRANSFER.value());
			transaction.setStatus(BankTransactionStatus.PENDING.value());
			transaction.setTransactionRefId(TransactionIdGenerator.generateUniqueTransactionRefId());
			Date date = new Date(); // Add by Prince For Filter transaction
			transaction.setDate(formatter.format(date));// Add by Prince For Filter transaction
			bankTransactionService.addTransaction(transaction);
			// Set other transaction details like description, sender information, etc.

			// Example: Update account balances
			// fromAccount.setAccountBalance(fromAccountBalance.subtract(amount));
			// toAccount.setAccountBalance(toAccount.getAccountBalance().add(toAmount));
			// userAccountDao.save(fromAccount);
			// userAccountDao.save(toAccount);

			// Example: Save transaction
			bankTransactionService.addTransaction(transaction);

			response.setResponseMessage("Internal transfer successful");
			response.setSuccess(true);
			return new ResponseEntity<>(response, HttpStatus.OK);

		} catch (NumberFormatException e) {
			response.setResponseMessage("Invalid numeric data");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);

		} catch (Exception e) {
			response.setResponseMessage("Internal server error: " + e.getMessage());
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	public ResponseEntity<CommonApiResponse> accountTransfer(BankTransactionRequestDto request) {
		//create an object to hold response data that will be return
		CommonApiResponse response = new CommonApiResponse();
		
               //check if details are null and missing the details 
		if (request == null || request.getAmount() == null || request.getUserId() == 0
				|| request.getAccountNumber() == null || request.getBankName() == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);
                       // return the bad request
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                //check the condition if the provided userid is 0
		if (request.getUserId() == 0) {
			response.setResponseMessage("bad request, Bank user not selected");
			response.setSuccess(false);
                        //return a bad request
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                //fetch the user details from the database using userid provided in the request
		User customer = this.userService.getUserById(request.getUserId());
            //check condition if customer is null
		if (customer == null) {
			response.setResponseMessage("bad request, customer not found");
			response.setSuccess(false);
                        //returns a bad request
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		// if (customer.getAccountBalance().compareTo(request.getAmount()) < 0) {
		// response.setResponseMessage("Insufficient Balance, Failed to transfer
		// amount!!!");
		// response.setSuccess(false);
		//
		// return new ResponseEntity<CommonApiResponse>(response,
		// HttpStatus.BAD_REQUEST);
		// }
		//retriev a user account based on account number
		UserAccounts fromAccount = userAccountDao.findByAccountNumber(request.getAccountNumber());
		
		//if no matching account found after check condition returns bad request response
		if (fromAccount == null) {
			response.setResponseMessage("Invalid account(s)");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
		}
        //This code checks if the balance of the source account (fromAccountBalance) is less than the requested transfer amount; if so, it returns a response indicating "Insufficient balance in the from account" with an HTTP 400 (Bad Request) status
		BigDecimal fromAccountBalance = fromAccount.getAccountBalance();
		if (fromAccountBalance.compareTo(request.getAmount()) < 0) {
			response.setResponseMessage("Insufficient balance in the from account");
			response.setSuccess(false);
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}
		// private String beneficiaryName; // Transfer Money
		//
		// private String accountNumber; // Transfer Money
		//
		// private String swiftCode; // Transfer Money
		//
		// private String bankName; // Transfer Money
		//
		// private String bankAddress; // Transfer Money
		//
		// private String purpose; // Transfer Money
		//
             //This code retrieves fee details for debit transactions, and if no such details are found, it returns a response indicating "Fee Detail not found, Internal error!!!" with an HTTP 500 (Internal Server Error) status
		FeeDetail feeDetail = this.feeDetailService.getFeeDetailByType(FeeType.DEBIT_TRANSACTION.value());

		if (feeDetail == null) {
			response.setResponseMessage("Fee Detail not found, Internal error!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		BigDecimal totalAmount = request.getAmount();
		// BigDecimal feePer= totalAmount.multiply(feeDetail.getFee()).divide(new
		// BigDecimal("100"));
		// BigDecimal feeAmount
		// =feePer.compareTo(feeDetail.getFeeAmount())>0?feePer:feeDetail.getFeeAmount();
		// BigDecimal amountToTransfer = totalAmount.add(feeAmount);

		BankTransaction transaction = new BankTransaction();
		transaction.setAmount(request.getAmount());
		transaction.setBillAmount(request.getToAmount());
		transaction.setFee(String.valueOf(request.getFee()) + "[" + String.valueOf(feeDetail.getFee()) + "%]");
		transaction.setBeneficiaryName(request.getBeneficiaryName());
		transaction.setBeneficiaryAccountNumber(request.getToBankAccount());
		transaction.setAccountNumber(request.getAccountNumber());
		transaction.setSwiftCode(request.getToBankIfsc());
		transaction.setBankName(request.getBankName());
		transaction.setBankAddress(request.getBankAddress());
		transaction.setFromCurrency(request.getFromCurrency());
		transaction.setToCurrency(request.getToCurrency());
		// transaction.setCountry(request.getPurpose());
		transaction.setUser(customer);
		transaction.setType(TransactionType.ACCOUNT_TRANSFER.value());
		transaction.setStatus(BankTransactionStatus.PENDING.value());
		transaction.setTransactionRefId(TransactionIdGenerator.generateUniqueTransactionRefId());
		Date date = new Date(); // Add by Prince For Filter transaction
		transaction.setDate(formatter.format(date)); // Add by Prince For Filter transaction

		bankTransactionService.addTransaction(transaction);

		response.setResponseMessage("Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<BankTransactionResponse> fetchPendingTransaction() {
               //Create Response Object: Initializes a new BankTransactionResponse object to build the response that will be sent to the client
		BankTransactionResponse response = new BankTransactionResponse();

		//Fetch Pending Transactions: Calls getTransactionByStatusIn from the bankTransactionService to retrieve a list of transactions with a status of "PENDING". The Arrays.asList(BankTransactionStatus.PENDING.value()) creates a list with the status value to pass as a parameter
		List<BankTransaction> transactions = this.bankTransactionService
				.getTransactionByStatusIn(Arrays.asList(BankTransactionStatus.PENDING.value()));
                //check if the list of transactions is empty
		//If empty, sets the response message to "No Pending Transactions found!!!" and sets success to false
		if (CollectionUtils.isEmpty(transactions)) {
			response.setResponseMessage("No Pending Transactions found!!!");
			response.setSuccess(false);
                        //Returns an HTTP 200 OK response with the populated response object.
			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}
                //Populate Response: If there are pending transactions, sets these transactions in the response object.
		response.setTransactions(transactions);
		//Sets the response message to "Account Transfer Request Initiated!!!" and success to true
		response.setResponseMessage("Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
	}


	//The updateTransactionStatus method processes a transaction update request by validating the input, updating the transaction and user account based on the status, and sending an appropriate response. It handles both successful and unsuccessful transaction updates, updates account balances accordingly, and sends notifications as needed
	public ResponseEntity<CommonApiResponse> updateTransactionStatus(UserStatusUpdateRequestDto request) {
               //Creates a new CommonApiResponse object to hold response data
		CommonApiResponse response = new CommonApiResponse();
		
		//Checks if the request, userId, or status is missing or invalid.
		if (request == null || request.getUserId() == 0 || request.getStatus() == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);
                       //If Invalid: Sets the response message to "bad request, missing data" and returns an HTTP 400 (Bad Request) status.
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		//check if userId is o
		if (request.getUserId() == 0) {
			response.setResponseMessage("bad request, Bank user not selected");
			response.setSuccess(false);
                    // Sets the response message to "bad request, Bank user not selected" and returns an HTTP 400 (Bad Request) status
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		//Fetches the BankTransaction object using the userId from the bankTransactionService
		BankTransaction transaction = this.bankTransactionService.getTransactionId(request.getUserId());
		//Retrieves the associated User object from the transaction.
		User customer = transaction.getUser();
		//Prepares a variable to hold the email template code to be used later
		String Code = "";
		//If the transaction status is "SUCCESS"
		if (request.getStatus().equals(BankTransactionStatus.SUCCESS.value())) {
			//Sets the transaction status to "SUCCESS" and saves the updated transaction
			transaction.setStatus(BankTransactionStatus.SUCCESS.value());
			bankTransactionService.addTransaction(transaction);
			//If the transaction type is "DEPOSIT
			if (transaction.getType().equals(TransactionType.DEPOSIT.value())) {
				//Adds the transaction amount to the customer's account balance
				customer.setAccountBalance(customer.getAccountBalance().add(transaction.getAmount()));
				//Prepares the email template code for adding money
				Code = EmailTemplate.ADD_MONEY.value();
			}
                        //If the transaction type is "ACCOUNT_TRANSFER"
			else if (transaction.getType().equals(TransactionType.ACCOUNT_TRANSFER.value())) {
				// for Internal Transfer
				//Prepares the email template code for beneficiary transfer
				Code = EmailTemplate.BENEFICIARY_TRANSFER.value();
				
				//Retrieves the source (fromAccount) and destination (toAccount) accounts from the database
				UserAccounts fromAccount = userAccountDao.findByAccountNumber(transaction.getAccountNumber());
				UserAccounts toAccount = userAccountDao.findByAccountNumber(transaction.getBeneficiaryAccountNumber());
				// BigDecimal actualTransferAmount = transaction.getAmount();
				// String feeAmountInString = transaction.getFee().split("\\[")[0];
				// BigDecimal feeAmount = new BigDecimal(feeAmountInString);
				//
				// BigDecimal amounToDebit = actualTransferAmount.add(feeAmount);

				// customer.setAccountBalance(customer.getAccountBalance().subtract(amounToDebit));
				if (toAccount != null) {
					toAccount.setAccountBalance(toAccount.getAccountBalance().add(transaction.getBillAmount()));
					userAccountDao.save(toAccount);
				}
				fromAccount.setAccountBalance(fromAccount.getAccountBalance().subtract(transaction.getAmount()));
				userAccountDao.save(fromAccount);
			}

			userService.updateUser(customer);

			response.setResponseMessage("Transaction Approved Successful");
			response.setSuccess(true);
			sendPasswordGenerationMail(customer, Code, transaction);
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} else {
			transaction.setStatus(request.getStatus());
			bankTransactionService.addTransaction(transaction);

			response.setResponseMessage("Transaction Rejected Successful");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		}

	}

	public ResponseEntity<BankTransactionResponse> fetchSuccessTransaction() {

		BankTransactionResponse response = new BankTransactionResponse();

		List<BankTransaction> transactions = bankTransactionDao.findAll();
		// this.bankTransactionService
		// .getTransactionByStatusIn(Arrays.asList(BankTransactionStatus.SUCCESS.value()));

		if (CollectionUtils.isEmpty(transactions)) {
			response.setResponseMessage("No Pending Transactions found!!!");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}

		response.setTransactions(transactions);
		response.setResponseMessage("Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<BankTransactionResponse> fetchCustomerTransactions(int customerId) {

		BankTransactionResponse response = new BankTransactionResponse();

		if (customerId == 0) {
			response.setResponseMessage("Customer Id not found");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}

		User customer = this.userService.getUserById(customerId);

		if (customer == null) {
			response.setResponseMessage("bad request, customer not found");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.BAD_REQUEST);
		}

		List<BankTransaction> transactions = this.bankTransactionService
				.getTransactionByStatusInAndUser(Arrays.asList(BankTransactionStatus.PENDING.value(),
						BankTransactionStatus.SUCCESS.value(), BankTransactionStatus.REJECT.value()), customer);

		if (CollectionUtils.isEmpty(transactions)) {
			response.setResponseMessage("No Pending Transactions found!!!");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}

		response.setTransactions(transactions);
		response.setResponseMessage("Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<BankTransactionResponse> fetchCustomerTransactionsByTransactionRefId(String transactionRefId,
			int customerId) {

		BankTransactionResponse response = new BankTransactionResponse();

		if (customerId == 0) {
			response.setResponseMessage("Customer Id not found");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}

		User customer = this.userService.getUserById(customerId);

		if (customer == null) {
			response.setResponseMessage("bad request, customer not found");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.BAD_REQUEST);
		}

		List<BankTransaction> transactions = this.bankTransactionService
				.getTransactionByTransactionRedIdInAndUser(transactionRefId, customer);

		if (CollectionUtils.isEmpty(transactions)) {
			response.setResponseMessage("No Pending Transactions found!!!");
			response.setSuccess(false);

			return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
		}

		response.setTransactions(transactions);
		response.setResponseMessage("Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankTransactionResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> quickAccountTransfer(BankTransactionRequestDto request) {
		
              //An instance of CommonApiResponse is created to store the response message and status that will be returned to the client
		CommonApiResponse response = new CommonApiResponse();
		
                //This block checks if the request is null, if the amount field in the request is null, or if userId is 0. If any of these conditions are true, it returns a BAD_REQUEST response
		if (request == null || request.getAmount() == null || request.getUserId() == 0) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
               //Checks if the beneficiaryId is null. If it is, a BAD_REQUEST response is returned.
		if (request.getBeneficiaryId() == null) {
			response.setResponseMessage("bad request, beneficary not selected");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (request.getUserId() == 0) {
			response.setResponseMessage("bad request, user not selected");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
              // Fetches the user details using userService. If the user does not exist, a BAD_REQUEST response is returned
		User customer = this.userService.getUserById(request.getUserId());

		if (customer == null) {
			response.setResponseMessage("bad request, customer not found");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
              //  Ensures the user's account balance is sufficient for the transfer amount. If not, an OK response with an "Insufficient Balance" message is returned.
		if (customer.getAccountBalance().compareTo(request.getAmount()) < 0) {
			response.setResponseMessage("Insufficient Balance, Failed to transfer amount!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		}

		Beneficiary beneficiary = this.beneficiaryService.getById(request.getBeneficiaryId());
               //Checks if the beneficiary exists. If not, an OK response with an appropriate message is returned
		if (beneficiary == null) {
			response.setResponseMessage("bad request - beneficiart not found!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		}

		// private String beneficiaryName; // Transfer Money
		//
		// private String accountNumber; // Transfer Money
		//
		// private String swiftCode; // Transfer Money
		//
		// private String bankName; // Transfer Money
		//
		// private String bankAddress; // Transfer Money
		//
		// private String purpose; // Transfer Money
		//
                // Fetches the fee details for debit transactions. If fee details are not found, an INTERNAL_SERVER_ERROR is returned
		FeeDetail feeDetail = this.feeDetailService.getFeeDetailByType(FeeType.DEBIT_TRANSACTION.value());

		if (feeDetail == null) {
			response.setResponseMessage("Fee Detail not found, Internal error!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		BigDecimal totalAmount = request.getAmount();
		//Computes the percentage fee (feePer) by multiplying the total amount by the fee percentage and dividing by 100.
		BigDecimal feePer = totalAmount.multiply(feeDetail.getFee()).divide(new BigDecimal("100"));
		//Determines the actual fee amount to be charged (feeAmount), which is the higher of the computed percentage fee or a predefined minimum fee (feeDetail.getFeeAmount()).
		BigDecimal feeAmount = feePer.compareTo(feeDetail.getFeeAmount()) > 0 ? feePer : feeDetail.getFeeAmount();
		//Calculates the amount to be transferred after deducting the fee (amountToTransfer)
		BigDecimal amountToTransfer = totalAmount.subtract(feeAmount);
                //Creates a new BankTransaction object and populates its fields with the required details
		BankTransaction transaction = new BankTransaction();
		//Sets the fee, amount to transfer, and beneficiary details (name, account number, etc.).
		transaction.setFee(String.valueOf(feeAmount) + "[" + String.valueOf(feeDetail.getFee()) + "%]");
		transaction.setAmount(amountToTransfer);
		transaction.setBeneficiaryName(beneficiary.getBeneficiaryName());
		transaction.setAccountNumber(beneficiary.getAccountNumber());
		transaction.setSwiftCode(beneficiary.getSwiftCode());
		transaction.setBankName(beneficiary.getBankName());
		transaction.setBankAddress(beneficiary.getBankAddress());
		transaction.setCountry(beneficiary.getCountry());
		transaction.setPurpose(request.getPurpose());
		transaction.setUser(customer);
		transaction.setType(TransactionType.ACCOUNT_TRANSFER.value());
		transaction.setStatus(BankTransactionStatus.PENDING.value());
		transaction.setTransactionRefId(TransactionIdGenerator.generateUniqueTransactionRefId());
		transaction.setCurrency(request.getCurrency());
		Date date = new Date(); // Add by Prince For Filter transaction
		transaction.setDate(formatter.format(date)); // Add by Prince For Filter transaction

		bankTransactionService.addTransaction(transaction);

		response.setResponseMessage("Quick Account Transfer Request Intiated!!!");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	private void sendPasswordGenerationMail(User customer, String code, BankTransaction transaction) {
		// Fetch the email template based on the provided code
		EmailTempDetails fetchedEmailTemp = this.emailTempService.getEmailTempDetailsByCode(code);

		if (fetchedEmailTemp != null) {
			// Get the email message and replace placeholders with user information
			String msg = fetchedEmailTemp.getEmailMessage();
			msg = replaceUserPlaceholders(msg, customer, transaction);
			// Get the email subject and replace placeholders with user information
			String subject = fetchedEmailTemp.getEmailSubject();
			subject = replaceUserPlaceholders(subject, customer, transaction);
			// Construct the email body
			StringBuilder emailBody = new StringBuilder();
			emailBody.append("<html><body>");
			emailBody.append("<h3>Dear " + customer.getName() + ",</h3>");
			emailBody.append(msg);
			emailBody.append("<p>Best Regards,<br/>Bank</p>");
			emailBody.append("</body></html>");

			// Send the email
			this.emailService.sendEmail(customer.getEmail(), subject, emailBody.toString());
		}
	}

	// Helper method to replace user placeholders in a string
	private String replaceUserPlaceholders(String template, User customer, BankTransaction transaction) {
		// Replace placeholders with user information, handling null values
		template = template.replace("[first_name]", customer.getFirstName() != null ? customer.getFirstName() : "");
		template = template.replace("[last_name]", customer.getLastName() != null ? customer.getLastName() : "");
		template = template.replace("[contactNumber]",
				customer.getContactNumber() != null ? customer.getContactNumber() : "");
		template = template.replace("[gender]", customer.getGender() != null ? customer.getGender() : "");
		template = template.replace("[date_of_birth]",
				customer.getDateOfBirth() != null ? customer.getDateOfBirth() : "");
		template = template.replace("[address]", customer.getAddress() != null ? customer.getAddress() : "");
		template = template.replace("[address2]", customer.getAddress2() != null ? customer.getAddress2() : "");
		template = template.replace("[city]", customer.getCity() != null ? customer.getCity() : "");
		template = template.replace("[state]", customer.getState() != null ? customer.getState() : "");
		template = template.replace("[country]", customer.getCountry() != null ? customer.getCountry() : "");
		template = template.replace("[individual_or_corporate]",
				customer.getIndividualOrCorporate() != null ? customer.getIndividualOrCorporate() : "");
		template = template.replace("[employment_status]",
				customer.getEmploymentStatus() != null ? customer.getEmploymentStatus() : "");
		template = template.replace("[role_in_company]",
				customer.getRoleInCompany() != null ? customer.getRoleInCompany() : "");
		template = template.replace("[business_activity]",
				customer.getBusinessActivity() != null ? customer.getBusinessActivity() : "");
		template = template.replace("[enter_activity]",
				customer.getEnterActivity() != null ? customer.getEnterActivity() : "");
		template = template.replace("[company_name]",
				customer.getCompanyName() != null ? customer.getCompanyName() : "");
		template = template.replace("[company_registration_number]",
				customer.getCompanyRegistrationNumber() != null ? customer.getCompanyRegistrationNumber() : "");
		template = template.replace("[date_of_incorporation]",
				customer.getDateOfIncorporation() != null ? customer.getDateOfIncorporation() : "");
		template = template.replace("[country_of_incorporation]",
				customer.getCountryOfIncorporation() != null ? customer.getCountryOfIncorporation() : "");
		template = template.replace("[company_address]",
				customer.getCompanyAddress() != null ? customer.getCompanyAddress() : "");
		template = template.replace("[nationality]",
				customer.getNationality() != null ? customer.getNationality() : "");
		template = template.replace("[place_of_birth]",
				customer.getPlaceOfBirth() != null ? customer.getPlaceOfBirth() : "");
		template = template.replace("[id_type]", customer.getIdType() != null ? customer.getIdType() : "");
		template = template.replace("[id_number]", customer.getIdNumber() != null ? customer.getIdNumber() : "");
		template = template.replace("[id_expiry_date]",
				customer.getIdExpiryDate() != null ? customer.getIdExpiryDate() : "");
		template = template.replace("[account_number]",
				customer.getAccountNumber() != null ? customer.getAccountNumber() : "");

		// Transactions
		template = template.replace("[amount]",
				transaction.getAmount() != null ? transaction.getAmount().toString() : "");
		template = template.replace("[sender_name]",
				transaction.getSenderName() != null ? transaction.getSenderName() : "");
		template = template.replace("[sender_address]",
				transaction.getSenderAddress() != null ? transaction.getSenderAddress() : "");
		template = template.replace("[description]",
				transaction.getDescription() != null ? transaction.getDescription() : "");
		template = template.replace("[beneficiary_name]",
				transaction.getBeneficiaryName() != null ? transaction.getBeneficiaryName() : "");
		// template = template.replace("[account_number]",
		// transaction.getAccountNumber() != null ? transaction.getAccountNumber() :
		// "");
		template = template.replace("[swift_code]",
				transaction.getSwiftCode() != null ? transaction.getSwiftCode() : "");
		template = template.replace("[bank_name]", transaction.getBankName() != null ? transaction.getBankName() : "");
		template = template.replace("[bank_address]",
				transaction.getBankAddress() != null ? transaction.getBankAddress() : "");
		template = template.replace("[country]", transaction.getCountry() != null ? transaction.getCountry() : "");
		template = template.replace("[purpose]", transaction.getPurpose() != null ? transaction.getPurpose() : "");
		template = template.replace("[type]", transaction.getType() != null ? transaction.getType() : "");
		template = template.replace("[status]", transaction.getStatus() != null ? transaction.getStatus() : "");
		template = template.replace("[transaction_ref_id]",
				transaction.getTransactionRefId() != null ? transaction.getTransactionRefId() : "");
		template = template.replace("[date]", transaction.getDate() != null ? transaction.getDate() : "");
		template = template.replace("[currency]", transaction.getCurrency() != null ? transaction.getCurrency() : "");
		template = template.replace("[fee]", transaction.getFee() != null ? transaction.getFee() : "");
		template = template.replace("[total_amount]",
				transaction.getAmount().add(new BigDecimal(transaction.getFee().split("\\[")[0])) != null
						? transaction.getAmount().toString()
						: "");

		template = template.replace("\n", "<br>");
		return template;
	}
}
