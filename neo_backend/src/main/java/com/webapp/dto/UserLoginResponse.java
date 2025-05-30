//the UserLoginResponse class is used to package and return the response data for a user login request. It includes the logged-in User object and a jwtToken for authentication purposes, while also inheriting common response attributes from CommonApiResponse. This structure helps in providing a comprehensive and consistent response format to clients following a successful login

package com.webapp.dto;

import com.webapp.entity.User;

public class UserLoginResponse extends CommonApiResponse {

	private User user;

	private String jwtToken;

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getJwtToken() {
		return jwtToken;
	}

	public void setJwtToken(String jwtToken) {
		this.jwtToken = jwtToken;
	}

}
