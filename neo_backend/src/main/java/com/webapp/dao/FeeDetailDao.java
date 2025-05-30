//The FeeDetailDao interface provides a mechanism to perform CRUD operations on FeeDetail entities. By extending JpaRepository, it inherits a variety of standard database operations such as saving, finding, updating, and deleting entities
package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.FeeDetail;

@Repository
public interface FeeDetailDao extends JpaRepository<FeeDetail, Integer>{
	
	FeeDetail findByType(String type);

}
