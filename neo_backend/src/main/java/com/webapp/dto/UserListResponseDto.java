//the UserListResponseDto class is used to encapsulate a response containing a list of users. It extends CommonApiResponse to maintain consistency with other responses and includes a List<User> to hold the user data being returned. This DTO is typically used in scenarios where multiple user records need to be returned to the client, such as in user management or querying operations
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.User;

public class UserListResponseDto extends CommonApiResponse {

	private List<User> users = new ArrayList<>();

	public List<User> getUsers() {
		return users;
	}

	public void setUsers(List<User> users) {
		this.users = users;
	}

}
