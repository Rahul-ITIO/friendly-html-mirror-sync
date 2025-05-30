//The BankAccountTransactionDao interface extends JpaRepository, providing CRUD (Create, Read, Update, Delete) operations and custom query methods for the BankAccountTransaction entity.
package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.BankAccountTransaction;

@Repository
public interface BankAccountTransactionDao extends JpaRepository<BankAccountTransaction, Integer>{

	// Find all transactions associated with a specific bank account ID
	List<BankAccountTransaction> findByBankAccount_id(int accountId);

	 // Find a transaction by its unique transaction ID
	BankAccountTransaction findByTransactionId(String transactionId);

	 // Find all transactions between a date range for a specific bank account, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByTransactionTimeBetweenAndBankAccount_IdOrderByIdDesc(String startDate, String endDate, int accountId);

	 // Find all transactions between a date range for a specific bank, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByTransactionTimeBetweenAndBank_idOrderByIdDesc(String startDate, String endDate, int bankId);
	
	// Find all transactions between a date range, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByTransactionTimeBetweenOrderByIdDesc(String startDate, String endDate);
	
        // Find all transactions between a date range, ordered by transaction ID in descending order
	List<BankAccountTransaction> findAllByOrderByIdDesc();
	
	// Find all transactions associated with a specific user ID, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByUser_idOrderByIdDesc(int userId);

	// Find all transactions associated with a specific bank ID, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByBank_idOrderByIdDesc(int userId);

	// Find all transactions for a specific user between a date range, ordered by transaction ID in descending order
	List<BankAccountTransaction> findByUser_idAndTransactionTimeBetweenOrderByIdDesc(int userId, String startDate, String endDate);
	
}
