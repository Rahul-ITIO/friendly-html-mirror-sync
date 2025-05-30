//This file, UserService.java, is an interface in a Java application that defines various methods for operations related to users in an online banking system

package com.webapp.service;

import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;  // Changed from javax to jakarta
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

import com.webapp.entity.Transaction;
import com.webapp.entity.TransactionAdditional;


public interface TransactionService {
    String addTransaction(Transaction transaction);
    
    Transaction saveTransaction(Transaction transaction, TransactionAdditional transactionAdditional);
    
    Transaction saves2sTrans(Transaction transaction);
    
    TransactionAdditional saves2sTransAdditional(TransactionAdditional transactionAdditional);
    
    Map<String, Object> getTransactionDetails(String transID);
    
    Transaction getTransactionByTransID(Long transID);
    
    Transaction updateTransaction(String transID, Transaction transaction, TransactionAdditional additional);
    
    List<Transaction> getAllTransactions(Sort sort);
    
    List<Map<String, Object>> getAllTransactionsWithDetails();
    
    boolean deleteTransaction(Long transID);
    
    List<Map<String, Object>> searchTransactions(String reference, Long merchantID, Short status);
    
    List<Transaction> findAllByOrderByTransactionDateDesc();
    
    ResponseEntity<Map<String, Object>> updateTransStatus(String transID, HttpServletRequest request, Boolean isWebhookBoolean, Boolean isRefundBoolean);

    public void updateTransactionID(Integer id, Long transID);

    List<Map<String, Object>> getAllTransactionsByMerchantID(Long merchantID);

    // Fetch latest 10 approved transactions ordered by transactionDate descending
    List<Map<String, Object>> findLatest10ApprovedByTransactionDateDesc(Short status_id, Long merchantID, int page, int size);

    // Count transactions by status
    long countByTransactionStatus(short status);
    
    Long countByTransactionStatusAndMerchantID(Short status, Long merchantID);

    Double sumBillAmountByStatuses(Short statuses);

    Double sumBillAmountByStatusesAndMerchantID(Short status, Long merchantID);
}
