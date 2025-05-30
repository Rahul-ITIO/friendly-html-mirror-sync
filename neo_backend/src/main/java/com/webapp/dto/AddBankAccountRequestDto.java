//AddBankAccountRequestDto is used to transfer data related to adding a bank account. It provides a structured way to pass data from the client to the server and includes functionality to convert itself into a BankAccount entity for persistence

package com.webapp.dto;

import org.springframework.beans.BeanUtils;

import com.webapp.entity.BankAccount;

public class AddBankAccountRequestDto {

	private String number;

	private String ifscCode;

	private String type; // saving or current

	private int bankId;

	private int userId; // bank customer id

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getIfscCode() {
		return ifscCode;
	}

	public void setIfscCode(String ifscCode) {
		this.ifscCode = ifscCode;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getBankId() {
		return bankId;
	}

	public void setBankId(int bankId) {
		this.bankId = bankId;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public static BankAccount toBankAccountEntity(AddBankAccountRequestDto addBankAccountRequestDto) {
		BankAccount bankAccount = new BankAccount();
		BeanUtils.copyProperties(addBankAccountRequestDto, bankAccount, "bankId", "userId");
		return bankAccount;
	}

}
