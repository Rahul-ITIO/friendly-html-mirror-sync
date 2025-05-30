//The Constants class in your code defines various enumerations (enum) used throughout an online banking system. Each enumeration represents a specific set of constants that categorize or describe different aspects of the system's functionality, such as user roles, account statuses, transaction types, and email templates.
package com.webapp.utility;

public class Constants {

	// Enum to define different user roles in the system
	public enum UserRole {
		ROLE_CUSTOMER("CUSTOMER"), ROLE_ADMIN("ADMIN"), ROLE_BANK("BANK");

		private String role;

		private UserRole(String role) {
			this.role = role;
		}

		public String value() {
			return this.role;
		}
	}
	
       // Enum to represent various statuses of a user account
	public enum UserStatus {
		ACTIVE("Active"), PENDING("Pending"), DEACTIVATED("Deactivated"), REJECT("Reject");

		private String status;

		private UserStatus(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
	
       // Enum to indicate whether an account is linked or not
	public enum IsAccountLinked {
		YES("Yes"), NO("No");

		private String status;

		private IsAccountLinked(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
	
         // Enum to define possible statuses of a bank account
	public enum BankAccountStatus {
		OPEN("Open"), DELETED("Deleted"), LOCK("Lock");

		private String status;

		private BankAccountStatus(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
         // Enum to represent different types of bank accounts
	public enum BankAccountType {
		SAVING("Saving"), CURRENT("Current");

		private String type;

		private BankAccountType(String type) {
			this.type = type;
		}

		public String value() {
			return this.type;
		}
	}
        // Enum to categorize various types of transactions
	public enum TransactionType {
		WITHDRAW("Withdraw"), DEPOSIT("Deposit"), BALANCE_FETCH("Balance Fetch"), ACCOUNT_TRANSFER("Account Transfer");

		private String type;

		private TransactionType(String type) {
			this.type = type;
		}

		public String value() {
			return this.type;
		}
	}
	
        // Enum to describe transaction narrations
	public enum TransactionNarration {
		BANK_WITHDRAW("Bank Cash Withdraw"), BANK_DEPOSIT("Bank Cash Deposit");

		private String narration;

		private TransactionNarration(String narration) {
			this.narration = narration;
		}

		public String value() {
			return this.narration;
		}
	}
         // Enum to define possible statuses of a bank transaction
	public enum BankTransactionStatus {
		SUCCESS("Success"), PENDING("Pending"), REJECT("Reject"), APPROVE("Approve");

		private String status;

		private BankTransactionStatus(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
	// Enum to represent different statuses of a beneficiary
	public enum BeneficiaryStatus {
		ACTIVE("Active"), DEACTIVATED("Deactivated");

		private String status;

		private BeneficiaryStatus(String status) {
			this.status = status;
		}

		public String value() {
			return this.status;
		}
	}
	// Enum to categorize different types of fees
	public enum FeeType {
		DEBIT_TRANSACTION("Debit Transaction"),
		CREDIT_TRANSACTION("Credit Transaction"),
		SET_UP_FEE("Set Up Fee"),
		MONTHLY_FEE("Monthly Fee"),
		YEARLY_FEE("Yearly Fee");

		private String type;

		private FeeType(String type) {
			this.type = type;
		}

		public String value() {
			return this.type;
		}
	}
	// Enum to define various email templates used in the system
	public enum EmailTemplate  {
		OTP("OTP"), ADD_MONEY("Deposit"), BENEFICIARY_TRANSFER("Account transfer"), RESET_PASSWORD("Reset Password"),RESET_PASSWORD_REQUEST("Reset Password Request"),SIGN_UP_APPROVAL("Sign up Approval");

		private String type;

		private EmailTemplate(String type) {
			this.type = type;
		}

		public String value() {
			return this.type;
		}
	}

}
