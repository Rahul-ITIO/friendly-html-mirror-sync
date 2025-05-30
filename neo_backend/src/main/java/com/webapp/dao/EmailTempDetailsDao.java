//The EmailTempDetailsDao interface is used for managing EmailTempDetails entities in the database. It inherits standard CRUD operations from JpaRepository, which allows it to perform typical database operations like create, read, update, and delete.
package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.EmailTempDetails;

@Repository
public interface EmailTempDetailsDao  extends JpaRepository<EmailTempDetails, Integer>{
	
	EmailTempDetails findByCode(String type);

}
