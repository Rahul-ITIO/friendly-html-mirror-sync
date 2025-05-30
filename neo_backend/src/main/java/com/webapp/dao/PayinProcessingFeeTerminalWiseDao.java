package com.webapp.dao;

import com.webapp.entity.PayinProcessingFeeTerminalWise;

import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PayinProcessingFeeTerminalWiseDao extends JpaRepository<PayinProcessingFeeTerminalWise, Integer> {
	
	List<PayinProcessingFeeTerminalWise> findAll(Specification<PayinProcessingFeeTerminalWise> spec);

    List<PayinProcessingFeeTerminalWise> findAllByOrderById();

    List<PayinProcessingFeeTerminalWise> findByMeridOrderById(Integer merid); // Changed from String to Integer
}
