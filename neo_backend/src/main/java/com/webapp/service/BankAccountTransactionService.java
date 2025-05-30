//The BankAccountTransactionServiceImpl class is designed to handle various operations related to bank account transactions, such as adding new transactions, retrieving transactions by different criteria, and querying transactions based on user and date range. It leverages the BankAccountTransactionDao to perform database interactions, encapsulating the business logic for transaction management in a service layer
package com.webapp.service;

import java.util.List;

import com.webapp.entity.BankAccountTransaction;

public interface BankAccountTransactionService {

	BankAccountTransaction addBankTransaction(BankAccountTransaction transaction);

	BankAccountTransaction getTransactionById(int id);

	BankAccountTransaction getTransactionByTransactionId(String transactionId);

	List<BankAccountTransaction> getAllTransactions();

	List<BankAccountTransaction> getAllTransactionsByTransactionTime(String startDate, String endDate);

	List<BankAccountTransaction> getAllTransactionsByTransactionTimeAndBankId(String startDate, String endDate,
			int bankId);

	List<BankAccountTransaction> getAllTransactionsByTransactionTimeAndBankAccoountId(String startDate, String endDate,
			int accountId);

	List<BankAccountTransaction> getTransactionsByUserId(int userId);

	List<BankAccountTransaction> findByBankOrderByIdDesc(int bankId);

	List<BankAccountTransaction> getByUserAndTransactionTimeBetweenOrderByIdDesc(int userId, String startDate,
			String endDate);

}
