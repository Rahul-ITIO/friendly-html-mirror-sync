package com.webapp.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.dao.TransactionAdditionalDao;
import com.webapp.entity.Transaction;
import com.webapp.entity.TransactionAdditional;
import com.webapp.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private TransactionAdditionalDao transactionAdditionalDao;
    
    @Autowired
    private ObjectMapper objectMapper;  // Add this line
    
    
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllTransactions() {
        List<Map<String, Object>> combinedData = transactionService.getAllTransactionsWithDetails();
        return ResponseEntity.ok(combinedData);
    }

    @GetMapping("/all/{merchantID}")
    public ResponseEntity<List<Map<String, Object>>> getAllTransactionsByMerchantID(@PathVariable Long merchantID) {
        List<Map<String, Object>> combinedData = transactionService.getAllTransactionsByMerchantID(merchantID);
        return ResponseEntity.ok(combinedData);
    }
    

    /*
    public ResponseEntity<List<Map<String, Object>>> getAllTransactions() {
        List<Map<String, Object>> combinedData = transactionService.getAllTransactionsWithDetails();
        return ResponseEntity.ok(combinedData);
    }
    */
    /*
    public ResponseEntity<List<Transaction>> getAllTransactions(
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("asc") ? 
            Sort.by(sortBy).ascending() : 
            Sort.by(sortBy).descending();
        
        List<Transaction> transactions = transactionService.getAllTransactions(sort);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
    
    */
    
    /* 
    // commented on date: 2025-04-05 for not using via postman
    @PostMapping("/add")
    public ResponseEntity<String> addTransaction(@RequestBody Transaction transaction) {
        String response = transactionService.addTransaction(transaction);
        return ResponseEntity.ok(response);
    }
   
    
    @PostMapping("/save")
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        try {
            // Create a default TransactionAdditional object
            TransactionAdditional transactionAdditional = new TransactionAdditional();
            // Set any default values if needed
            
            Transaction savedTransaction = transactionService.saveTransaction(transaction, transactionAdditional);
            return ResponseEntity.ok(savedTransaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    */
    
    /*
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        try {
            // Create a default TransactionAdditional object
            TransactionAdditional transactionAdditional = new TransactionAdditional();
            // Set any default values if needed
            
            Transaction savedTransaction = transactionService.saveTransaction(transaction, transactionAdditional);
            return ResponseEntity.ok(savedTransaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }*/

    // refund-request make and update transaction and getting post method for transID,refundAmount,refundReason and update transactionStatus is 8 transactionResponse from refundReason
    @PostMapping("/refund-request")
    public ResponseEntity<?> handleRefundRequest(@RequestBody Map<String, Object> refundData, HttpServletRequest serverRequest) {
        try {
            log.info("=== handleRefundRequest === Starting refund request processing");
            log.info("Received refund request data: {}", refundData);

            Boolean retrunResponse = false;
            String statusMsg = "Transaction is already in Refund Request Processed";

            String transID = refundData.get("transID").toString();
            // Get existing transactionGet
            Transaction transactionGet = transactionService.getTransactionByTransID(Long.parseLong(transID));
            if (transactionGet == null) {
                log.error("Transaction not found for ID: {}", transID);
                return ResponseEntity.notFound().build();
            }
            else if (!refundData.containsKey("transID") || !refundData.containsKey("refundAmount") ) {
                log.error("Missing required fields in refund request");
                return ResponseEntity.badRequest().body("Missing required fields: transID, refundAmount");
            }
            else if(transactionGet.getTransactionStatus().equals((short) 8) || transactionGet.getTransactionStatus().equals((short) 7)) {
                log.error("Transaction is already in Refund Processed Generated");
                retrunResponse = true;
            }
            else if(transactionGet.getTransactionStatus() != (short) 1 ) {
                statusMsg = "Not authorized to process because this is not successfull transaction";
                log.error(statusMsg);
                retrunResponse = true;
            }

            if(retrunResponse)
            {
                Map<String, Object> transResponse = transactionService.getTransactionDetails(transID.toString());

                transResponse.put("message", statusMsg);

	            return ResponseEntity.ok(transResponse);
            }

           
            // Format refund amount to 2 decimal places
            Double refundAmount = Math.round(Double.parseDouble(refundData.get("refundAmount").toString()) * 100.0) / 100.0;

            //Double originalAmount = Double.parseDouble(refundData.get("originalAmount").toString());
            String refundReason = "";
            Double originalAmount = 0.0;
            
            if(transactionGet.getBankProcessingAmount() != null)
                originalAmount = Double.parseDouble(transactionGet.getBankProcessingAmount().toString());
            else if(transactionGet.getTransactionAmount() != null)
                originalAmount = Double.parseDouble(transactionGet.getTransactionAmount().toString());
            else if(transactionGet.getBillAmount() != null)
                originalAmount = Double.parseDouble(transactionGet.getBillAmount().toString());

            //session base login user     
            String loginUser = "";
            // Check if loginUser is null or empty
            if (refundData.containsKey("loginUser ") && refundData.get("loginUser ") != null && !refundData.get("loginUser ").toString().isEmpty()) {
                loginUser  = " by " + refundData.get("loginUser ").toString() + ", ";
            } 
            if (refundData.containsKey("refundReason") && refundData.get("refundReason") != null) {
                refundReason = refundData.get("refundReason").toString();
            } 

            // Fix log formatting syntax
            log.info("Processing refund - TransID: {}, Amount: {}, Reason: {}", 
                    transID, 
                    String.format("%.2f", refundAmount), 
                    refundReason);

            // Validate refund amount
            if (refundAmount <= 0 || refundAmount > originalAmount) {
                log.error("Invalid refund amount: {} (Original amount: {})", 
                        String.format("%.2f", refundAmount),
                        String.format("%.2f", originalAmount));
                return ResponseEntity.badRequest().body("Invalid refund amount. Must be greater than 0 and less than or equal to original amount");
            }

            

            log.info("Found transactionGet for ID: {}", transID);

            // Get additional data
            TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(Long.parseLong(transID));
            if (additional == null) {
                log.info("Creating new TransactionAdditional for ID: {}", transID);
                additional = new TransactionAdditional();
                additional.setTransIDAd(Long.parseLong(transID));
            }

            

            // Update transactionGet status to Refund Pending (8)
            transactionGet.setTransactionStatus((short) 8);
            
            // currentDateTime for formatting like YYYY-MM-DD HH:MM:SS
            String currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);


           

            // Prepare message string
            // Check if the refund amount is different from the original amount
            String messageString = "";
            if (refundAmount != null && originalAmount != null && !refundAmount.equals(originalAmount))
            {
                messageString = "Partial Refund Request Processed " + loginUser + "from ip " + serverRequest.getRemoteAddr() + ": Amount " + refundAmount ;
            }
            else
            {
                messageString = "Request Processed" + loginUser + " from ip " + serverRequest.getRemoteAddr();    
            }

            // Update additional information
            String existingNotes = additional.getSupportNote() != null ? additional.getSupportNote() + "\n" : "";
            additional.setSupportNote(existingNotes + currentDateTime + " | " + messageString + " - " + refundReason);

            additional.setTransactionResponse(messageString);
            
            // Save updates
            log.info("Saving transactionGet updates - New status: {}", transactionGet.getTransactionStatus());
            Transaction updatedTransaction = transactionService.updateTransaction(transID, transactionGet, additional);
            
            if (updatedTransaction == null) {
                log.error("Failed to update transactionGet - " + transID);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update transactionGet - " + transID);
            }

            log.info("Successfully processed refund request for TransID: {}", transID);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("transactionGet", updatedTransaction);
            response.put("additional", additional);
            response.put("message", transID + " :: Refund request submitted successfully");

            Map<String, Object> transResponse = transactionService.getTransactionDetails(transID.toString());
	        return ResponseEntity.ok(transResponse);


        } catch (NumberFormatException e) {
            log.error("Invalid number format in refund request: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid number format in request");
        } catch (Exception e) {
            log.error("Error processing refund request: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error processing refund request: " + e.getMessage());
        }
    }

    // refund-accept make a create same duplicate method as a new transactionGet and save it in the database with transactionStatus is 3 - refunded 
    // and update transactionGet and getting post method for transID,refundAmount,refundReason and update transactionStatus is 7 transactionResponse from refundReason
    @PostMapping("/refund-accept")
    public ResponseEntity<?> handleRefundAccept(@RequestBody Map<String, Object> refundData, HttpServletRequest serverRequest) {
        try {
            log.info("=== handleRefundAccept === Starting refund request processing");
            log.info("Received refund accept data: {}", refundData);

            if (!refundData.containsKey("transID") || !refundData.containsKey("refundAmount") || !refundData.containsKey("refundReason")) {
                log.error("Missing required fields in refund request");
                return ResponseEntity.badRequest().body("Missing required fields: transID, refundAmount, refundReason");
            }

            String transID = refundData.get("transID").toString();
            Double refundAmount = Math.round(Double.parseDouble(refundData.get("refundAmount").toString()) * 100.0) / 100.0;
            String refundReason = refundData.get("refundReason").toString();
            Double originalAmount = Double.parseDouble(refundData.get("originalAmount").toString());
            String currency = refundData.get("currency").toString();

            log.info("Processing refund - TransID: {}, Amount: {}{}, Reason: {}", 
                    transID, 
                    String.format("%.2f", refundAmount), 
                    currency, 
                    refundReason);

            if (refundAmount <= 0 || refundAmount > originalAmount) {
                log.error("Invalid refund amount: {} (Original amount: {})", 
                        String.format("%.2f", refundAmount),
                        String.format("%.2f", originalAmount));
                return ResponseEntity.badRequest().body("Invalid refund amount. Must be greater than 0 and less than or equal to original amount");
            }

            // Get existing transactionGet
            Transaction transactionGet = transactionService.getTransactionByTransID(Long.parseLong(transID));
            if (transactionGet == null) {
                log.error("Transaction not found for ID: {}", transID);
                return ResponseEntity.notFound().build();
            }

            log.info("Found transactionGet for ID: {}", transID);

            if(transactionGet.getTransactionStatus().equals((short) 7)) {
                log.error("Transaction is already in Refund Approved status for transID : "+transID);
                return ResponseEntity.badRequest().body("Transaction is already in Refund Approved status for transID : "+transID);
            }

            // Get additional data
            TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(Long.parseLong(transID));
            if (additional == null) {
                log.info("Creating new TransactionAdditional for ID: {}", transID);
                additional = new TransactionAdditional();
                additional.setTransIDAd(Long.parseLong(transID));
            }

            // Update additional information for original transactionGet
            String existingNotes = additional.getSupportNote() != null ? additional.getSupportNote() + "\n" : "";
             // currentDateTime for formatting like YYYY-MM-DD HH:MM:SS
             String currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);

             String loginUser = "";
             // Check if loginUser is null or empty
             if(refundData.containsKey("loginUser") && refundData.get("loginUser") == null || loginUser.isEmpty()) {
                 log.error("Login user is null or empty");
                 loginUser = "by " + refundData.get("loginUser").toString() + ", ";
             }

             
            
            String systemNote = "Refund proccess manually approved by " + loginUser + " from ip " + serverRequest.getRemoteAddr() + ": Amount " + refundAmount + " " + currency + " - ";
            // refund api call  
            // transactionGet.setTransactionResponse("Refund Approved");
			try
            {    
                ResponseEntity<Map<String, Object>> serviceResponse = transactionService.updateTransStatus(transID, serverRequest, Boolean.TRUE, Boolean.TRUE);
			   
                if (serviceResponse.getStatusCode() != HttpStatus.OK) {
                    log.error("Refund API call failed: {}", serviceResponse.getBody());
                    System.out.println("Refund API call failed: " + serviceResponse.getBody());
                }

                System.out.println("Refund API call successful: " + serviceResponse.getBody());

                Map<String, Object> response = serviceResponse.getBody();
                if (response != null && !response.isEmpty()) {
                    // Process the response data as needed 
                    String refundStatus = (String) response.get("status");
                    String refundResponse = (String) response.get("connector_response_msg");
                    systemNote = "Refund API call successful: " + refundStatus + " - " + refundResponse;

                    additional.setTransactionResponse(refundResponse);

                } else {
                    log.error("Empty response from refund API call");
                    System.out.println("Empty response from refund API call");
                    //systemNote = "Refund API call returned empty response";
                }
                // Extract the response data
            }
            catch (Exception e)
            {
                log.error("Error in refund api call: ", e);
                System.out.println("Error in refund api call: " + e.getMessage());
            }

            

            // Update transactionGet status to Reversed (7)
            transactionGet.setTransactionStatus((short) 7);
            transactionGet.setRemarkStatus((short) 2); // Set remark status to 2 for refund approved in merchant dashboard
            //transactionGet.setBankProcessingAmount(Double.parseDouble("-" + refundAmount));



            // Generate a new transID for the refund transactionGet
            Long transID_2 = generateUniqueTransID(transactionGet.getConnector().toString(), 0); // Generate a new transID

            // Create duplicate refund transactionGet ===
            Transaction transaction = new Transaction();
			TransactionAdditional transactionAdditional = new TransactionAdditional();
            
            // Copy relevant fields from original transactionGet
            transaction.setTransactionStatus((short) 3); // Refunded status
            transaction.setBillAmount( Double.parseDouble("-" + transactionGet.getBillAmount()));
            transaction.setBillCurrency(transactionGet.getBillCurrency());
            transaction.setBankProcessingAmount(Double.parseDouble("-" + refundAmount));
            transaction.setBankProcessingCurrency(transactionGet.getBankProcessingCurrency());
            transaction.setTransactionDate(new java.util.Date()); // Fixed: Use java.util.Date instead of LocalDateTime
            transaction.setMerchantID(transactionGet.getMerchantID());
            transaction.setReference(transactionGet.getReference());
            transaction.setBearerToken(transactionGet.getBearerToken());
            transaction.setChannelType(transactionGet.getChannelType());
            transaction.setConnector(transactionGet.getConnector());
            transaction.setFeeId(transactionGet.getFeeId());
            transaction.setFullName(transactionGet.getFullName());
            transaction.setBillEmail(transactionGet.getBillEmail());
            transaction.setBillIP(transactionGet.getBillIP());
            transaction.setTerminalNumber(transactionGet.getTerminalNumber());
            transaction.setMethodOfPayment(transactionGet.getMethodOfPayment());
            transaction.setChannelType(transactionGet.getChannelType());
            transaction.setIntegrationType(transactionGet.getIntegrationType());
            transaction.setTransactionType(transactionGet.getTransactionType());
            transaction.setSettlementDelay(transactionGet.getSettlementDelay());
            transaction.setRollingDate(transactionGet.getRollingDate());
            transaction.setRollingDelay(transactionGet.getRollingDelay());
            transaction.setRiskRatio(transactionGet.getRiskRatio());
            transaction.setTransactionPeriod(transactionGet.getTransactionPeriod());

            if(transactionGet.getBuyMdrAmount() != null) {
                transaction.setBuyMdrAmount(Double.parseDouble("-" + transactionGet.getBuyMdrAmount()));
            }
            if(transactionGet.getSellMdrAmount() != null) {
                transaction.setSellMdrAmount(Double.parseDouble("-" + transactionGet.getSellMdrAmount()));
            }
            if(transactionGet.getBuyTxnFeeAmount() != null) {
                transaction.setSellMdrAmount(Double.parseDouble("-" + transactionGet.getSellMdrAmount()));
            }
            if(transactionGet.getSellTxnFeeAmount() != null) {
                transaction.setSellTxnFeeAmount(Double.parseDouble("-" + transactionGet.getSellTxnFeeAmount()));
            }
            if(transactionGet.getGstAmount() != null) {
                transaction.setGstAmount(Double.parseDouble("-" + transactionGet.getGstAmount()));
            }
            if(transactionGet.getRollingAmount() != null) {
                transaction.setRollingAmount(Double.parseDouble("-" + transactionGet.getRollingAmount()));
            }
            if(transactionGet.getMdrCashbackAmount() != null) {
                transaction.setMdrCashbackAmount(Double.parseDouble("-" + transactionGet.getMdrCashbackAmount()));
            }
            if(transactionGet.getPayableTransactionAmount() != null) {
                transaction.setPayableTransactionAmount(Double.parseDouble("-" + transactionGet.getPayableTransactionAmount()));
            }
            if(transactionGet.getMdrRefundFeeAmount() != null) {
                transaction.setMdrRefundFeeAmount(Double.parseDouble("-" + transactionGet.getMdrRefundFeeAmount()));
            }
            if(transactionGet.getAvailableRolling() != null) {
                transaction.setAvailableRolling(Double.parseDouble("-" + transactionGet.getAvailableRolling()));
            }
            if(transactionGet.getAvailableBalance() != null) {
               // transaction.setAvailableBalance(Double.parseDouble("-" + transactionGet.getAvailableBalance()));
            }
            if(transactionGet.getMatureRollingFundAmount() != null) {
                transaction.setMatureRollingFundAmount(Double.parseDouble("-" + transactionGet.getMatureRollingFundAmount()));
            }
            if(transactionGet.getImmatureRollingFundAmount() != null) {
                transaction.setImmatureRollingFundAmount(Double.parseDouble("-" + transactionGet.getImmatureRollingFundAmount()));
            }
            
            


            transaction.setTransID(transID_2);
            
            // additional data
            transactionAdditional.setAuthUrl(additional.getAuthUrl());
            transactionAdditional.setAuthData(additional.getAuthData());
            transactionAdditional.setSourceUrl(additional.getSourceUrl());
            transactionAdditional.setWebhookUrl(additional.getWebhookUrl());
            transactionAdditional.setReturnUrl(additional.getReturnUrl());
            transactionAdditional.setUpa(additional.getUpa());
            transactionAdditional.setRrn(additional.getRrn());
            transactionAdditional.setConnectorRef(additional.getConnectorRef());
            transactionAdditional.setConnectorResponse(additional.getConnectorResponse());
            transactionAdditional.setDescriptor(additional.getDescriptor());
            transactionAdditional.setJsonValue(additional.getJsonValue());
            transactionAdditional.setConnectorJson(additional.getConnectorJson());
            transactionAdditional.setPayloadStage1(additional.getPayloadStage1());
            transactionAdditional.setConnectorCredsProcessingFinal(additional.getConnectorCredsProcessingFinal());
            transactionAdditional.setConnectorResponseStage1(additional.getConnectorResponseStage1());
            transactionAdditional.setConnectorResponseStage2(additional.getConnectorResponseStage2());
            transactionAdditional.setBinNumber(additional.getBinNumber());
            transactionAdditional.setCardNumber(additional.getCardNumber());
            transactionAdditional.setExpiryMonth(additional.getExpiryMonth());
            transactionAdditional.setExpiryYear(additional.getExpiryYear());
            transactionAdditional.setTransactionResponse(additional.getTransactionResponse());

            transactionAdditional.setBillingPhone(additional.getBillingPhone());
            transactionAdditional.setBillingAddress(additional.getBillingAddress());
            transactionAdditional.setBillingCity(additional.getBillingCity());
            transactionAdditional.setBillingState(additional.getBillingState());
            transactionAdditional.setBillingCountry(additional.getBillingCountry());
            transactionAdditional.setBillingZip(additional.getBillingZip());
            transactionAdditional.setProductName(additional.getProductName());

            String messageString = "";
            if (refundAmount != null && originalAmount != null && !refundAmount.equals(originalAmount)) {
                messageString = "Partial Refund Approved :- Transation has been Refunded " + loginUser + "from ip " + serverRequest.getRemoteAddr() + ": Amount " + refundAmount + " " + currency + " with your previous transID: " + transID + " - ";    
            } else {
                messageString = "Refund Approved :- Transation has been Refunded " + loginUser + " from ip " + serverRequest.getRemoteAddr() + " with your previous transID: " + transID + " - ";   
            }

            
            transactionAdditional.setSupportNote(existingNotes + currentDateTime  + " | " + messageString + refundReason);


            // Prepare additional transactionGet data
	        //transactionAdditional.setTransIDAd(transID_2);
	        //transactionAdditional.setId(savedTransaction.getId());
            
            // Save refund transactionGet and its additional data
            //Transaction savedRefundTransaction = transactionService.saveTransaction(transaction, transactionAdditional);

             //SAVE transaction to db 1st table ====
	        Transaction savedTransaction = transactionService.saves2sTrans(transaction);

			// Regenerate a unique numeric transID with savedTransaction ID for reupdate in transid of 1st table
	        transID_2 = generateUniqueTransID(transactionGet.getConnector().toString(), savedTransaction.getId());
	        
	        savedTransaction.setTransID(transID_2);
	        transactionService.saves2sTrans(savedTransaction);

			// Update the transID using a dedicated update method instead of reusing saves2sTrans
			//savedTransaction.setTransID(transID);
			//transactionService.updateTransactionID(savedTransaction.getId(), transID);

	        	
	        //Fetch transID from transaction table 
	        transID_2 = savedTransaction.getTransID();


	       // Prepare additional transaction data
	        transactionAdditional.setTransIDAd(transID_2);
	        transactionAdditional.setId(savedTransaction.getId());


            log.info("Created refund transaction with new ID: {}", transID_2);

            //SAVE transactionAdditional db 2nd table ===
	        TransactionAdditional savedTransAdditional = transactionService.saves2sTransAdditional(transactionAdditional);
	        

            // Update the additional
            // Prepare message string for original transactionGet
            if (refundAmount != null && originalAmount != null && !refundAmount.equals(originalAmount)) {
                messageString = "Partial Refund Approved :- Transation has been Refunded " + loginUser + "from ip " + serverRequest.getRemoteAddr() + ": Amount " + refundAmount + " " + currency + " with your new transID: R" + transID_2 + " - ";    
            } else {
                messageString = "Refund Approved :- Transation has been Refunded " + loginUser + " from ip " + serverRequest.getRemoteAddr() + " with your new transID: R" + transID_2 + " - ";   
            }

            
            additional.setSupportNote(existingNotes + currentDateTime  + " | " + messageString + refundReason);

            String existingsystemNote = additional.getSystemNote() != null ? additional.getSystemNote() + "\n" : "";
            additional.setSystemNote(existingsystemNote + currentDateTime + " | " + systemNote);
            
            // Save updates to original transactionGet
            log.info("Saving transactionGet updates - New status: {}", transactionGet.getTransactionStatus());
            Transaction updatedTransaction = transactionService.updateTransaction(transID, transactionGet, additional);
            
            if (updatedTransaction == null) {
                log.error("Failed to update transactionGet");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update transactionGet");
            }

            log.info("Successfully processed refund approved for TransID: {}", transID);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("transactionGet", updatedTransaction);
            response.put("additional", additional);
            response.put("transaction", transaction);
            response.put("message", transID + " :: Refund approved submitted successfully");

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            log.error("Invalid number format in refund request: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid number format in request");
        } catch (Exception e) {
            log.error("Error processing refund request: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error processing refund request: " + e.getMessage());
        }
    }

    @PutMapping("/update/{transID}")
    public ResponseEntity<?> updateTransaction(@PathVariable String transID, @RequestBody Map<String, Object> requestData) {
        try {
            if (transID == null || transID.isEmpty()) {
                return ResponseEntity.badRequest().body("Transaction ID cannot be null or empty");
            }

            log.debug("Updating transaction {}", transID);
            log.debug("Request data: {}", requestData);

            // Convert request data
            Transaction transaction = objectMapper.convertValue(requestData.get("transaction"), Transaction.class);
            TransactionAdditional additional = objectMapper.convertValue(requestData.get("additional"), TransactionAdditional.class);
            
            if (transaction == null) {
                return ResponseEntity.badRequest().body("Invalid transaction data");
            }

            // Update 
            Transaction updated = transactionService.updateTransaction(transID, transaction, additional);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }

            // Get latest additional data
            Long transIDLong = Long.parseLong(transID);
            TransactionAdditional updatedAdditional = transactionAdditionalDao.findByTransIDAd(transIDLong);

            Map<String, Object> response = new HashMap<>();
            response.put("transaction", updated);
            response.put("additional", updatedAdditional); 
            response.put("message", "Transaction updated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating transaction: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                               .body("Error updating transaction: " + e.getMessage());
        }
    }




    /*
    public Transaction updateTransaction(@PathVariable Long transID, @RequestBody Transaction transaction, @RequestBody TransactionAdditional transactionAdditional) {
        return transactionService.updateTransaction(transID, transaction, transactionAdditional);
    }*/
    
    @GetMapping("/{transID}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long transID) {
        Transaction transaction = transactionService.getTransactionByTransID(transID);
        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }
        
        TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(transID);
        
        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("additional", additional);
        
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchTransactions(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) Long merchantID,
            @RequestParam(required = false) Short status) {
        
        List<Map<String, Object>> results = transactionService.searchTransactions(reference, merchantID, status);
        return ResponseEntity.ok(results);
    }
    
    // Method to generate a unique transID based on connector ID and saved transaction ID
	// It uses the current date and time to create a unique identifier.
    private Long generateUniqueTransID(String connectorId, Integer savedTransactionId) {
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");
			String datePart = dateFormat.format(new Date());
			long currentTimeMillis = System.currentTimeMillis();
			String microTimePart = String.format("%06d", currentTimeMillis % 1000000);
			String transIDStr = connectorId + savedTransactionId + datePart + microTimePart;
			if (transIDStr.length() > 18) {
				transIDStr = transIDStr.substring(0, 18); // Ensure it fits within Long range
			}
			return Long.parseLong(transIDStr);
    }


    // Fetches latest 10 approved (status) transactions ordered by transactionDate descending
    @GetMapping("/fetch/{status}")
    @Operation(summary = "Fetch latest 10 approved transactions (status) by date desc")
    public ResponseEntity<List<Map<String, Object>>> fetchLatest10ApprovedTransactions(@PathVariable Short status) throws Exception {
        Short status_id = Short.parseShort(status.toString());
        List<Map<String, Object>> transactions = transactionService.findLatest10ApprovedByTransactionDateDesc(status_id, null, 0, 10);
        return ResponseEntity.ok(transactions);
    }

   
    // Fetch total count of transactions by status
    @GetMapping("/countsw/{status}")
    @Operation(summary = "Fetch total count of transactions by status")
    public ResponseEntity<Long> getTransactionCountByStatus(@PathVariable short status) {
        long count = transactionService.countByTransactionStatus(status);
        return ResponseEntity.ok(count);
    }
    
    // Fetch total count for multiple statuses
    @GetMapping("/scount/all")
    @Operation(summary = "Fetch total count of transactions for multiple statuses")
    public ResponseEntity<Map<Short, Long>> getTransactionCountsForStatuses() {
        short[] statuses = {1, 3, 5, 2};
        Map<Short, Long> counts = new HashMap<>();
        for (short status : statuses) {
            counts.put(status, transactionService.countByTransactionStatus(status));
        }
        return ResponseEntity.ok(counts);
    }

    // Fetch sum of billAmount for multiple transactionStatus
    @GetMapping("/sbasum/all")
    @Operation(summary = "Fetch sum of billAmount for multiple transactionStatus")
    public ResponseEntity<Map<Short, Double>> getTransactionSumForStatuses() {
        short[] statuses = {1, 3, 5, 2};
        Map<Short, Double> sums = new HashMap<>();
        for (short status : statuses) {
            double rawValue = transactionService.sumBillAmountByStatuses(status);
            double roundedValue = BigDecimal.valueOf(rawValue)
                                    .setScale(2, RoundingMode.HALF_UP)
                                    .doubleValue();
            sums.put(status, roundedValue);
        }
        return ResponseEntity.ok(sums);
    }


    // merchantID wise

    // Fetches latest 10 (status) transactions ordered by transactionDate descending
    @GetMapping("/statuswise/merchant/{merchantID}/{status}")
    @Operation(summary = "Fetch latest 10 approved transactions (status) by date desc")
    public ResponseEntity<List<Map<String, Object>>> fetchLatest10ApprovedTransactionsByMerchant(@PathVariable Short status, @PathVariable Long merchantID) throws Exception {
        Short status_id = Short.parseShort(status.toString());
        List<Map<String, Object>> transactions = transactionService.findLatest10ApprovedByTransactionDateDesc(status_id, merchantID, 0, 10);
        return ResponseEntity.ok(transactions);
    }

    // Fetch total count for multiple statuses and merchantID wise
    @GetMapping("/statuscount/merchant/{merchantID}")
    @Operation(summary = "Fetch total count of transactions for multiple statuses and merchantID wise")
    public ResponseEntity<Map<Short, Long>> getTransactionCountsForStatusesByMerchant(@PathVariable Long merchantID) {
        short[] statuses = {1, 3, 5, 2};
        Map<Short, Long> counts = new HashMap<>();
        for (short status : statuses) {
            counts.put(status, transactionService.countByTransactionStatusAndMerchantID(status, merchantID));
        }
        return ResponseEntity.ok(counts);
    }

    // Fetch sum of billAmount for multiple transactionStatus and merchantID wise
    @GetMapping("/billamtsum/merchant/{merchantID}")
    @Operation(summary = "Fetch sum of billAmount for multiple transactionStatus and merchantID wise")
    public ResponseEntity<Map<Short, Double>> getTransactionSumForStatusesByMerchant(@PathVariable Long merchantID) {
        short[] statuses = {1, 3, 5, 2};
        Map<Short, Double> sums = new HashMap<>();

        for (short status : statuses) {
            Double rawValue = transactionService.sumBillAmountByStatusesAndMerchantID(status, merchantID);
            double safeValue = rawValue != null ? rawValue : 0.0;

            double roundedValue = BigDecimal.valueOf(safeValue)
                                    .setScale(2, RoundingMode.HALF_UP)
                                    .doubleValue();

            sums.put(status, roundedValue);
        }

        return ResponseEntity.ok(sums);
    }


    

   
}
