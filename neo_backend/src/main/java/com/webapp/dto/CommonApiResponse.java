//The CommonApiResponse class is designed to provide a uniform way of representing API responses, including a message and a success status. This consistency helps in handling responses effectively on the client side and in debugging or logging operations. By using this class, you ensure that all API responses follow a common structure, making it easier to manage and interpret the results of various API operations
package com.webapp.dto;

public class CommonApiResponse {

	private String responseMessage;

	private boolean isSuccess;

	public String getResponseMessage() {
		return responseMessage;
	}

	public void setResponseMessage(String responseMessage) {
		this.responseMessage = responseMessage;
	}

	public boolean isSuccess() {
		return isSuccess;
	}

	public void setSuccess(boolean isSuccess) {
		this.isSuccess = isSuccess;
	}



}
