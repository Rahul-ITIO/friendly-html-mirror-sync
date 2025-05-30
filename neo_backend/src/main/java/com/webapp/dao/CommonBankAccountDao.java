//The CommonBankAccountDao interface extends JpaRepository, which provides it with CRUD operations and allows defining custom queries for CommonBankAccount entities.
package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.CommonBankAccount;

@Repository
public interface CommonBankAccountDao extends JpaRepository<CommonBankAccount, Long> {
    
    // Find a CommonBankAccount entity by its IBAN (International Bank Account Number)
    CommonBankAccount findByIban(String iban);

     // Delete a CommonBankAccount entity by its IBAN (International Bank Account Number)
    CommonBankAccount deleteByIban(String iban);

}
