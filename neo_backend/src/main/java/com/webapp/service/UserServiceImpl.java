/*Service Implementation: The UserServiceImpl class implements the UserService interface, providing concrete logic for each method

Dependency Injection: The UserDao is injected using the @Autowired annotation to handle data access operations.
*/

package com.webapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.UserDao;
import com.webapp.entity.Bank;
import com.webapp.entity.User;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserDao userDao;

	@Override
	// Registers a new user
	public User registerUser(User user) {
		// @return the registered user
		return userDao.save(user);
	}

	/*
	 * The updateUser method is responsible for updating an existing user in the
	 * database. It takes a User object as input and uses the userDao.save(user)
	 * method to save the updated user information. The save method in Spring Data
	 * JPA checks if the user already exists (based on the ID). If it does, it
	 * updates the existing user; if not, it creates a new user. The updated user
	 * object is then returned as the result of the method
	 */
	@Override
	public User updateUser(User user) {
		return userDao.save(user);
	}

	// Retrieves a user by their ID
	@Override
	public User getUserById(int userId) {
		// @return the user with the specified ID
		return userDao.findById(userId).get();
	}

	// Retrieves a user by their email and password.
	@Override
	public User getUserByEmailAndPassword(String email, String password) {

		// @return the user with the specified email and password
		return userDao.findByEmailAndPassword(email, password);
	}

	// Retrieves a user by their username and password
	public User getUserByUserNameAndPassword(String userName, String password) {

		// @return the user with the specified username and password
		return userDao.findByUserNameAndPassword(userName, password);
	}

	// Retrieves a user by their email, password, and role
	@Override
	public User getUserByEmailAndPasswordAndRoles(String email, String password, String role) {

		// @return the user with the specified email, password, and role
		return userDao.findByEmailAndPasswordAndRoles(email, password, role);
	}

	// Retrieves a user by their email.
	@Override
	public User getUserByEmail(String email) {

		// @return the user with the specified email
		return userDao.findByEmail(email);
	}

	// Retrieves a user by their username.
	@Override
	public User getUserByUsername(String email) {

		// @return the user with the specified username
		return userDao.findByUserName(email);
	}

	// Retrieves users by their roles and status
	@Override
	public List<User> getUsersByRolesAndStatus(String role, String status) {

		// @return a list of users with the specified roles and status
		return userDao.findByRolesAndStatus(role, status);
	}

	// Retrieves a user by their email and role
	@Override
	public User getUserByEmailAndRoles(String email, String role) {
		// @return the user with the specified email and role

		return userDao.findByEmailAndRoles(email, role);
	}

	/*
	 * @Override
	 * public List<User> getUsersByRolesAndStatusAndBank(String role, String status,
	 * int bankId) {
	 * return userDao.findByRolesAndStatusAndBank_Id(role, status, bankId);
	 * }
	 */

	// Retrieves users by their roles
	@Override
	public List<User> getUserByRoles(String role) {

		// @return a list of users with the specified role
		return userDao.findByRoles(role);
	}

	/*
	 * @Override
	 * public List<User> getUsersByRolesAndStatusAndBankIsNull(String role, String
	 * status) {
	 * return userDao.findByRolesAndStatusAndBankIsNull(role, status);
	 * }
	 * 
	 * @Override
	 * public List<User> getUserByRolesAndBank(String role, int bankid) {
	 * TODO Auto-generated method stub
	 * return userDao.findByRolesAndBank_Id(role, bankid);
	 * }
	 * 
	 * @Override
	 * public List<User> searchBankCustomerByNameAndRole(String customerName, int
	 * bankId, String role) {
	 * TODO Auto-generated method stub
	 * return userDao.findByNameContainingIgnoreCaseAndBank_IdAndRoles(customerName,
	 * bankId, role);
	 * }
	 */

	// Searches for bank customers by their name and role.
	@Override
	public List<User> searchBankCustomerByNameAndRole(String customerName, String role) {
		// TODO Auto-generated method stub
		return userDao.findByNameContainingIgnoreCaseAndRoles(customerName, role);
	}

}
