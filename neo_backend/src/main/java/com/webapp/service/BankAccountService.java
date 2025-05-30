//The BankAccountService interface outlines the methods needed for managing and querying bank accounts in the system. It provides a contract for the implementation classes to follow, ensuring consistency and separation of business logic from data access concerns
package com.webapp.service;

import java.util.List;

import com.webapp.entity.BankAccount;

public interface BankAccountService {
	
	BankAccount addBankAccount(BankAccount bankAccount);
	BankAccount updateBankAccount(BankAccount bankAccount);
	BankAccount getBankAccountById(int bankAccountId);
	List<BankAccount> getAllBankAccouts();
	BankAccount findByUserAndStatus(int userId, String status);
	BankAccount findByAccountId(int accountId);
	List<BankAccount> getByBank(int bankId);
	List<BankAccount> getByBankAndStatus(int bankId, String status);
	List<BankAccount> getByStatus(String status);
	BankAccount findByNumberAndIfscCodeAndBankAndStatus(String accNumber, String ifscCode, int bankId, String Status);
	List<BankAccount> getByNumberContainingIgnoreCaseAndBank(String accountNumber, int bankId);
	BankAccount getBankAccountByUser(int userId);
	BankAccount findByNumberAndIfscCodeAndStatus(String accNumber, String ifscCode, String Status);
	List<BankAccount> getByNumberContainingIgnoreCase(String accountNumber);

}
