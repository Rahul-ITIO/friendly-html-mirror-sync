//This code defines a UserDao interface for managing User entities using Spring Data JPA. It extends JpaRepository, which provides standard CRUD (Create, Read, Update, Delete) operations

package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.User;

@Repository
public interface UserDao extends JpaRepository<User, Integer> {

	// Find a User by their email and password

	User findByEmailAndPassword(String emailId, String password);
         // Find a User by their username and password
	
	User findByUserNameAndPassword(String userName, String password);
	
         // Find a User by their email, password, and role
	User findByEmailAndPasswordAndRoles(String emailId, String password, String role);
	
         // Find a User by their email and role
	User findByEmailAndRoles(String emailId, String role);
	
        // Find a User by their email
	User findByEmail(String emailId);
	
       // Find a User by their username
	User findByUserName(String userName);
	
        // Find a list of Users by their role and status
	List<User> findByRolesAndStatus(String role, String status);

	// List<User> findByRolesAndStatusAndBank_Id(String role, String status, int
	// bankId);
	// List<User> findByRolesAndStatusAndBankIsNull(String role, String status);
	
	// Find a list of Users by their role
	List<User> findByRoles(String role);

	// List<User> findByRolesAndBank_Id(String role, int bankId);
	// List<User> findByNameContainingIgnoreCaseAndBank_IdAndRoles(String
	// customerName, int bankId, String role);
	
	// Find a list of Users by a case-insensitive name and role
	List<User> findByNameContainingIgnoreCaseAndRoles(String customerName, String role);

}
