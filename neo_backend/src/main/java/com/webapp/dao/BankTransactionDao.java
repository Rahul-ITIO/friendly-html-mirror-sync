//The BankTransactionDao interface extends JpaRepository, providing CRUD operations and custom query methods for managing BankTransaction entities
package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.BankTransaction;
import com.webapp.entity.User;

@Repository
public interface BankTransactionDao extends JpaRepository<BankTransaction, Integer> {
         // Find all bank transactions with a status that matches any value in the provided list of statuses
	List<BankTransaction> findByStatusIn(List<String> status);

	 // Find all bank transactions with a status that matches any value in the provided list of statuses and associated with a specific user
	List<BankTransaction> findByStatusInAndUser(List<String> status, User user);

	 // Find all bank transactions where the transaction reference ID contains the specified string (case-insensitive) and associated with a specific user
	List<BankTransaction> findByTransactionRefIdContainingIgnoreCaseAndUser(String transactionRefId, User user);

}
