package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.webapp.entity.TransactionAdditional;

import org.springframework.stereotype.Repository;

@Repository
public interface TransactionAdditionalDao extends JpaRepository<TransactionAdditional, Integer> {
    TransactionAdditional findByTransIDAd(Long transIDAd);
}
