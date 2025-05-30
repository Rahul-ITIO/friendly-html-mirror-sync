//The UserAccountDao interface is used to manage UserAccounts entities in the database with Spring Data JPA. By extending JpaRepository, it provides basic CRUD operations and allows for the creation of custom query methods
package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.UserAccounts;

@Repository
public interface UserAccountDao extends JpaRepository<UserAccounts, Integer> {
    
    // Find a list of UserAccounts by the user ID
    List<UserAccounts> findByUserId(String userId);
    
    // Find a list of UserAccounts by their status
    List<UserAccounts> findByStatus(String Status);
    
     // Find a UserAccount by its account number
    UserAccounts findByAccountNumber(String Acno);
    
    // Find a UserAccount by its ID (Note: 'Acno' seems to be used as an integer ID here)
    UserAccounts findById(int Acno);

}
