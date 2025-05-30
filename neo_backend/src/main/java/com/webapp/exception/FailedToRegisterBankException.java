//The FailedToRegisterBankException class is a custom runtime exception that indicates an error occurred during the process of bank registration. By using the @ResponseStatus annotation, it ensures that the server responds with an HTTP 500 status code when this exception is thrown. This helps in managing error responses effectively and provides meaningful feedback to clients about server-side issues during the bank registration process
package com.webapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FailedToRegisterBankException extends RuntimeException {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public FailedToRegisterBankException(String message) {
		super(message);
	}

}
