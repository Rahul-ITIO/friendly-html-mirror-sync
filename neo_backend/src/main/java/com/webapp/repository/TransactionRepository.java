package com.webapp.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.webapp.entity.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Transaction findByTransID(Long transID);
    List<Transaction> findByReferenceContaining(String reference);
    List<Transaction> findByMerchantID(Long merchantID);
    List<Transaction> findByTransactionStatus(Short status);
    List<Transaction> findAll();
    
    List<Transaction> findAllByOrderByTransactionDateDesc(); // Sorting by tdate DESC

    List<Transaction> findByReferenceContainingOrderByTransactionDateDesc(String reference);

    List<Transaction> findByMerchantIDOrderByTransactionDateDesc(Long merchantID);

    List<Transaction> findByTransactionStatusOrderByTransactionDateDesc(Short status);
}
