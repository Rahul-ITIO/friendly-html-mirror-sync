 //the UserStatusUpdateRequestDto class is used to transfer information about updating a user's status. It provides a structured way to pass the user ID and the new status from one part of the application to another, typically from the client to the server, facilitating the update operation.
package com.webapp.dto;

public class UserStatusUpdateRequestDto {

	private int userId;

	private String status;

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
