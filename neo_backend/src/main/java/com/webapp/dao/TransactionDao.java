package com.webapp.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import com.webapp.entity.Transaction;

@Repository
public interface TransactionDao extends JpaRepository<Transaction, Integer> {
    @NonNull
    List<Transaction> findAll();
    
    List<Transaction> findAllByOrderByTransactionDateDesc();
    List<Transaction> findByMerchantIDOrderByTransactionDateDesc(Long merchantID);
    
    Transaction findByTransID(Long transID);

    // Count transactions by status
    long countByTransactionStatus(short status);

    Long countByTransactionStatusAndMerchantID(Short transactionStatus, Long merchantID);
    


    @Query("SELECT t FROM Transaction t WHERE " +
           "(:reference IS NULL OR t.reference = :reference) AND " +
           "(:merchantID IS NULL OR t.merchantID = :merchantID) AND " +
           "(:status IS NULL OR t.transactionStatus = :status)")
    List<Transaction> searchTransactions(
        @Param("reference") String reference, 
        @Param("merchantID") Long merchantID, 
        @Param("status") Short status
    );

    
    // With merchantID filter for fetch latest 10 approved transactions ordered by transactionDate 
    @Query("SELECT t FROM Transaction t WHERE t.transactionStatus = :status AND t.merchantID = :merchantID ORDER BY t.transactionDate DESC")
    List<Transaction> findLatest10ApprovedByStatusAndMerchantId(
        @Param("status") Short status,
        @Param("merchantID") Long merchantID,
        org.springframework.data.domain.Pageable pageable);
    
    // Fetch latest 10 approved transactions ordered by transactionDate descending
    @Query("SELECT t FROM Transaction t WHERE (t.transactionStatus = :status) ORDER BY t.transactionDate DESC")
    List<Transaction> findLatest10ApprovedByTransactionDateDesc(@Param("status") Short status, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT SUM(t.billAmount) FROM Transaction t WHERE t.transactionStatus IN :statuses")
    Double sumBillAmountByStatuses(@Param("statuses") Short statuses);

    //@Query("SELECT SUM(t.billAmount) FROM Transaction t WHERE t.transactionStatus IN :status AND t.merchantID = :merchantID")
    @Query("SELECT COALESCE(SUM(t.billAmount), 0) FROM Transaction t WHERE t.transactionStatus = :status AND t.merchantID = :merchantID")
    Double sumBillAmountByStatusesAndMerchantID(@Param("status") Short status, @Param("merchantID") Long merchantID);
}
