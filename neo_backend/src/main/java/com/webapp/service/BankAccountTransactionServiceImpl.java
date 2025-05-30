//The BankAccountTransactionServiceImpl class is designed to handle various operations related to bank account transactions, such as adding new transactions, retrieving transactions by different criteria, and querying transactions based on user and date range. It leverages the BankAccountTransactionDao to perform database interactions, encapsulating the business logic for transaction management in a service layer
package com.webapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.BankAccountTransactionDao;
import com.webapp.entity.BankAccountTransaction;

@Service
public class BankAccountTransactionServiceImpl implements BankAccountTransactionService {

	@Autowired
	private BankAccountTransactionDao bankAccountTransactionDao;

	@Override
	public BankAccountTransaction addBankTransaction(BankAccountTransaction transaction) {
		return bankAccountTransactionDao.save(transaction);
	}

	@Override
	public BankAccountTransaction getTransactionById(int id) {
		return bankAccountTransactionDao.findById(id).get();
	}

	@Override
	public BankAccountTransaction getTransactionByTransactionId(String transactionId) {
		return bankAccountTransactionDao.findByTransactionId(transactionId);
	}

	@Override
	public List<BankAccountTransaction> getAllTransactions() {
		return bankAccountTransactionDao.findAllByOrderByIdDesc();
	}

	@Override
	public List<BankAccountTransaction> getAllTransactionsByTransactionTime(String startDate, String endDate) {
		return bankAccountTransactionDao.findByTransactionTimeBetweenOrderByIdDesc(startDate, endDate);
	}

	@Override
	public List<BankAccountTransaction> getAllTransactionsByTransactionTimeAndBankId(String startDate, String endDate,
			int bankId) {
		return bankAccountTransactionDao.findByTransactionTimeBetweenAndBank_idOrderByIdDesc(startDate, endDate,
				bankId);
	}

	@Override
	public List<BankAccountTransaction> getAllTransactionsByTransactionTimeAndBankAccoountId(String startDate,
			String endDate, int accountId) {
		return bankAccountTransactionDao.findByTransactionTimeBetweenAndBankAccount_IdOrderByIdDesc(startDate, endDate,
				accountId);
	}

	@Override
	public List<BankAccountTransaction> getTransactionsByUserId(int userId) {
		return bankAccountTransactionDao.findByUser_idOrderByIdDesc(userId);
	}

	@Override
	public List<BankAccountTransaction> findByBankOrderByIdDesc(int bankId) {
		return bankAccountTransactionDao.findByBank_idOrderByIdDesc(bankId);
	}

	@Override
	public List<BankAccountTransaction> getByUserAndTransactionTimeBetweenOrderByIdDesc(int userId, String startDate,
			String endDate) {
		return bankAccountTransactionDao.findByUser_idAndTransactionTimeBetweenOrderByIdDesc(userId, startDate,
				endDate);
	}

}
