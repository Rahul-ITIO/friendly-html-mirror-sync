//The BankService interface defines the operations that can be performed on Bank entities, such as retrieving, adding, and updating bank records. It provides a clear and consistent API for these operations, which is implemented by classes like BankServiceImpl. This abstraction ensures that the business logic for managing banks is handled in a centralized manner, separate from the data access and presentation layers
package com.webapp.service;

import java.util.List;

import com.webapp.entity.Bank;

public interface BankService {
	
	Bank getBankById(int bankId);
	Bank addBank(Bank bank);
	Bank updateBank(Bank bank);
	List<Bank> getAllBank();

}
