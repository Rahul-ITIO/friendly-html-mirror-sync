//The class leverages the BankDao repository for data access and ensures that business logic related to Bank entities is handled in a consistent and encapsulated manner. It is annotated with @Service, marking it as a Spring service component and allowing it to be managed by the Spring container

package com.webapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.BankDao;
import com.webapp.entity.Bank;

@Service
public class BankServiceImpl implements BankService {
	
	@Autowired
	private BankDao bankDao;

	@Override
	public Bank getBankById(int bankId) {
		return this.bankDao.findById(bankId).get();
	}

	@Override
	public Bank addBank(Bank bank) {
		return this.bankDao.save(bank);
	}

	@Override
	public Bank updateBank(Bank bank) {
		return this.bankDao.save(bank);
	}

	@Override
	public List<Bank> getAllBank() {
		return this.bankDao.findAll();
	}

}
