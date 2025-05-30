package com.webapp.resource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.webapp.dto.AddBankAccountRequestDto;
import com.webapp.dto.BankAccountResponseDto;
import com.webapp.dto.BankAccountStatusUpdateRequestDto;
import com.webapp.dto.CommonApiResponse;
import com.webapp.entity.Bank;
import com.webapp.entity.BankAccount;
import com.webapp.entity.User;
import com.webapp.service.BankAccountService;
import com.webapp.service.BankService;
import com.webapp.service.UserService;
import com.webapp.utility.Constants.BankAccountStatus;
import com.webapp.utility.Constants.IsAccountLinked;

@Component
public class BankAccountResource {
	
	private final Logger LOG = LoggerFactory.getLogger(BankAccountResource.class);
	
	@Autowired
	private BankAccountService bankAccountService;
	
	@Autowired
	private BankService bankService;
	
	@Autowired
	private UserService userService;
	
	public ResponseEntity<CommonApiResponse> addBankAccount(AddBankAccountRequestDto request) {

		LOG.info("Received request for add bank account");
		
                //Creates a new CommonApiResponse object, which will hold the response message and status to be returned to the client.
		CommonApiResponse response = new CommonApiResponse();
		
                //If the request object is null, it sets an error message in the response and returns a 400 Bad Request status
		if (request == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		//If the userId is 0, it indicates an invalid user ID. The response is set accordingly, and the method returns a 400 Bad Request.
		if(request.getUserId() == 0) {
			response.setResponseMessage("bad request, user id is null");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		// if the bankId is 0, the request is considered invalid, and a 400 Bad Request is returned.
        if(request.getBankId() == 0) {
			response.setResponseMessage("bad request, bank id is null");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
        //Converts the AddBankAccountRequestDto request object to a BankAccount entity using a static method.
        BankAccount account = AddBankAccountRequestDto.toBankAccountEntity(request);

	//Retrieves the User object using userId and associates it with the BankAccount entity.
        User user = this.userService.getUserById(request.getUserId());
        account.setUser(user);
		
       // Retrieves the Bank object using bankId and associates it with the BankAccount entity.
        Bank bank = this.bankService.getBankById(request.getBankId());
        account.setBank(bank);
		
       // Sets the initial status of the bank account as OPEN.
        account.setStatus(BankAccountStatus.OPEN.value());
		
	//Sets the creation date to the current time in milliseconds.	
        account.setCreationDate(String.valueOf(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()));
		
	//Initializes the account balance to 0.	
        account.setBalance(BigDecimal.ZERO);
		
        //Calls the service method to add the bank account to the database.
        BankAccount addedBankAccount = this.bankAccountService.addBankAccount(account);
        //If the addedBankAccount is not null, it means the operation was successful. The User entity is updated to reflect that the account is linked. A success message is returned with an HTTP 200 OK status
        if(addedBankAccount != null) {
        	
        	user.setIsAccountLinked(IsAccountLinked.YES.value());
        	this.userService.updateUser(user);
        	
			response.setResponseMessage("Bank Account Created Successfully!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);    	 
        }
	//If the addedBankAccount is null, it indicates a failure, and an error message is returned with a 400 Bad Request status
	else {
			response.setResponseMessage("Failed to add the bank account");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
        }

	}
	
	public ResponseEntity<BankAccountResponseDto> fetchAllBankAccounts() { 
		
		LOG.info("Received request for fetching all the bank accounts");
                //A new BankAccountResponseDto object is created to encapsulate the response data that will be returned to the client. This object will hold the list of bank accounts, a message, and a success indicator
		BankAccountResponseDto response = new BankAccountResponseDto();
		
		//An empty List of type BankAccount is created. This list will eventually hold all the bank account entities fetched from the database.
		List<BankAccount> accounts = new ArrayList<>();
		
		//The method calls getAllBankAccouts (note the typo; it should likely be getAllBankAccounts) on the bankAccountService to retrieve all the bank account records from the database. The returned list is stored in the accounts variable
		accounts = this.bankAccountService.getAllBankAccouts();

		//Sets the accounts list retrieved from the database into the response object.
		response.setAccounts(accounts);
		//Sets a message indicating that the bank accounts have been successfully fetched
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		
		//Sets the success status to true, indicating the operation was successful
		response.setSuccess(true);

		//Returns a ResponseEntity object containing the BankAccountResponseDto as the body and an HTTP status code 200 OK. The ResponseEntity is a Spring class that represents the entire HTTP response, including the body, headers, and status code
		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}
	
    public ResponseEntity<BankAccountResponseDto> fetchBankAccountByBank(int bankId) { 
		
		LOG.info("Received request for fetching all the bank accounts from bank side");

		BankAccountResponseDto response = new BankAccountResponseDto();
		
		List<BankAccount> accounts = new ArrayList<>();
		
		if(bankId == 0) {
			response.setResponseMessage("bad request, bank id is missing");
			response.setSuccess(true);

			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);	
		}
		
		accounts = this.bankAccountService.getByBank(bankId);
		
		response.setAccounts(accounts);
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}
    
    public ResponseEntity<BankAccountResponseDto> fetchBankAccountById(int accountId) { 
		
		LOG.info("Received request for fetching bank by using account Id");

		BankAccountResponseDto response = new BankAccountResponseDto();
		
		List<BankAccount> accounts = new ArrayList<>();
		
		if(accountId == 0) {
			response.setResponseMessage("bad request, account id is missing");
			response.setSuccess(true);

			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);	
		}
		
		BankAccount account = this.bankAccountService.getBankAccountById(accountId);
		
		if(account == null) {
			response.setAccounts(accounts);
			response.setResponseMessage("Bank account not found with this account id");
			response.setSuccess(true);
			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);
		}
		
		accounts.add(account);

		response.setAccounts(accounts);
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}
    
    public ResponseEntity<BankAccountResponseDto> fetchBankAccountByUserId(int userId) { 
		
		LOG.info("Received request for fetching bank by using User Id");

		BankAccountResponseDto response = new BankAccountResponseDto();
		
		List<BankAccount> accounts = new ArrayList<>();
		
		if(userId == 0) {
			response.setResponseMessage("bad request, user id is missing");
			response.setSuccess(true);

			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);	
		}
		
		BankAccount account = this.bankAccountService.getBankAccountByUser(userId);
		
		if(account == null) {
			response.setResponseMessage("No Bank Account found for User");
			response.setSuccess(true);
			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);
		}
		
		accounts.add(account);

		response.setAccounts(accounts);
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}
    
    public ResponseEntity<BankAccountResponseDto> searchBankAccounts(String accountNumber, int bankId) { 
		
		LOG.info("Received request for searching the Bank account from Bank side");

		BankAccountResponseDto response = new BankAccountResponseDto();
		
		List<BankAccount> accounts = new ArrayList<>();
		
		if(bankId == 0 || accountNumber == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);	
		}
		
		accounts = this.bankAccountService.getByNumberContainingIgnoreCaseAndBank(accountNumber, bankId);

		response.setAccounts(accounts);
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}

	public ResponseEntity<CommonApiResponse> updateBankAccountStatus(BankAccountStatusUpdateRequestDto request) { 
		
		LOG.info("Received request for updating the Bank Account");

		CommonApiResponse response = new CommonApiResponse();
		
		if(request == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		if(request.getAccountId() == 0) {
			response.setResponseMessage("bad request, account id is missing");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		
		
		BankAccount account = null;
		account = this.bankAccountService.getBankAccountById(request.getAccountId());
		
        account.setStatus(request.getStatus());
        
        BankAccount updateBankAccount = this.bankAccountService.updateBankAccount(account);
		
        if(updateBankAccount != null) {
        	response.setResponseMessage("Bank Account "+request.getStatus()+" Successfully!!!");
    		response.setSuccess(true);
    		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
        } else {
        	response.setResponseMessage("Failed to "+request.getStatus() +" the account");
    		response.setSuccess(true);
    		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
	}

	public ResponseEntity<BankAccountResponseDto> searchBankAccounts(String accountNumber) { 
		
		LOG.info("Received request for searching the Bank account from Admin side");

		BankAccountResponseDto response = new BankAccountResponseDto();
		
		List<BankAccount> accounts = new ArrayList<>();
		
		if(accountNumber == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.BAD_REQUEST);	
		}
		
		accounts = this.bankAccountService.getByNumberContainingIgnoreCase(accountNumber);

		response.setAccounts(accounts);
		response.setResponseMessage("Bank Accounts Fetch Successfully!!!");
		response.setSuccess(true);

		return new ResponseEntity<BankAccountResponseDto>(response, HttpStatus.OK);    	 
   
	}

}
