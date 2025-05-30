//The BankTransactionService interface defines the contract for the service layer managing BankTransaction entities in the online banking system. Its purpose is to outline the methods that any implementing service class (like BankTransactionServiceImpl) should provide for handling bank transactions
package com.webapp.service;

import java.util.List;

import com.webapp.entity.BankTransaction;
import com.webapp.entity.User;

public interface BankTransactionService {

	BankTransaction addTransaction(BankTransaction bankTransaction);

	BankTransaction updateTransaction(BankTransaction bankTransaction);

	BankTransaction getTransactionId(int transactionId);

	List<BankTransaction> getTransactionByStatusIn(List<String> status);

	List<BankTransaction> getTransactionByStatusInAndUser(List<String> status, User user);
	
	List<BankTransaction> getTransactionByTransactionRedIdInAndUser(String transactionRefId, User user);

}
