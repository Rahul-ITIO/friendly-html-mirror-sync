//The CustomUserDetailsService class is essential for integrating custom user data with Spring Security’s authentication mechanism. It retrieves user information from the UserService, converts it into a CustomUserDetails object, and returns it. This class ensures that Spring Security has access to user credentials and authorities, enabling proper authentication and authorization in the application
package com.webapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.webapp.entity.User;
import com.webapp.service.UserService;

@Component
public class CustomUserDetailsService implements UserDetailsService {

	@Autowired
	private UserService userService;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

		User user = this.userService.getUserByEmail(email);
		if (user == null) {
			user = this.userService.getUserByUsername(email);
		}

		CustomUserDetails customUserDetails = new CustomUserDetails(user);

		return customUserDetails;

	}
}
