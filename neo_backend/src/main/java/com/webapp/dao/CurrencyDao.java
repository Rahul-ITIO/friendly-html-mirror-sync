//The CurrencyDao interface is used for managing Currency entities in the database. It inherits CRUD operations from JpaRepository, which allows it to perform standard database operations such as create, read, update, and delete
package com.webapp.dao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.Currency;

@Repository
public interface CurrencyDao extends JpaRepository <Currency, Long> {
	
	Currency findByCode(String code);
 
}
