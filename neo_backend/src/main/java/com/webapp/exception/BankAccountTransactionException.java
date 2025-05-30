//The BankAccountTransactionException class is a custom runtime exception used in the application to indicate errors related to bank account transactions. By using the @ResponseStatus annotation, it ensures that when this exception is thrown, the server responds with a 500 Internal Server Error status code. This helps in providing meaningful error responses to clients and in managing error handling effectively within the application.//
package com.webapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class BankAccountTransactionException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public BankAccountTransactionException(String message) {
		super(message);
	}
	
}
