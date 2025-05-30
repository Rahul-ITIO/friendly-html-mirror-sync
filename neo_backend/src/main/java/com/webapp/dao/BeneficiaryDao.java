//The BeneficiaryDao interface extends JpaRepository, allowing it to perform CRUD operations and define custom queries for Beneficiary entities
package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.Beneficiary;
import com.webapp.entity.User;

@Repository
public interface BeneficiaryDao extends JpaRepository<Beneficiary, Integer> {

	List<Beneficiary> findByUserAndStatus(User user, String status);

}
