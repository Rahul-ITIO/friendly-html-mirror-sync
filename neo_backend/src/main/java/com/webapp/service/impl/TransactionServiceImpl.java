package com.webapp.service.impl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;

import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.webapp.dao.TransactionAdditionalDao;
import com.webapp.dao.TransactionDao;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.dao.ConnectorDao;
import com.webapp.entity.Connector;
import com.webapp.entity.Transaction;
import com.webapp.entity.TransactionAdditional;
import com.webapp.service.TransactionService;
import com.webapp.utility.Base64Util;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Override
    public List<Transaction> getAllTransactions(Sort sort) {
        return transactionDao.findAll(sort);
    }

    @Override
    public boolean deleteTransaction(Long transID) {
        try {
            Transaction transaction = transactionDao.findByTransID(transID);
            if (transaction != null) {
                // Delete associated additional data first
                TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(transID);
                if (additional != null) {
                    transactionAdditionalDao.delete(additional);
                }
                // Then delete the main transaction
                transactionDao.delete(transaction);
                log.debug("Successfully deleted transaction with transID: {}", transID);
                return true;
            }
            log.warn("Transaction not found with transID: {}", transID);
            return false;
        } catch (Exception e) {
            log.error("Error deleting transaction with transID {}: {}", transID, e.getMessage());
            return false;
        }
    }

    private static final Logger log = LoggerFactory.getLogger(TransactionServiceImpl.class);

    @Autowired
    private TransactionDao transactionDao;
    
    @Autowired
    private TransactionAdditionalDao transactionAdditionalDao;

    @Autowired
    private ConnectorDao connectorDao;

    @Override
    public List<Map<String, Object>> getAllTransactionsWithDetails() {
        List<Transaction> transactions = transactionDao.findAllByOrderByTransactionDateDesc(); // Sorting applied

        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Transaction transaction : transactions) {
            Map<String, Object> combinedData = new HashMap<>();
            combinedData.put("transID", String.valueOf(transaction.getTransID()));
            combinedData.put("transaction", transaction);
            
            // Get additional data
            TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(transaction.getTransID());
            if (additional != null) {
                // Include decrypted card number in the response
                Map<String, Object> additionalMap = new HashMap<>();
                

                additionalMap.put("transID", String.valueOf(transaction.getTransID()));

                // Copy all properties from additional
                additionalMap.put("id", additional.getId());
                additionalMap.put("binNumber", additional.getBinNumber());
                additionalMap.put("cardNumber", maskCardNumber(additional.getCcnoDecrypted()));
                additionalMap.put("ccnoDecrypted", additional.getCcnoDecrypted()); // Add decrypted value
                
                additionalMap.put("billingPhone", additional.getBillingPhone());
                additionalMap.put("billingAddress", additional.getBillingAddress());
                additionalMap.put("billingCity", additional.getBillingCity());
                additionalMap.put("billingState", additional.getBillingState());
                additionalMap.put("billingCountry", additional.getBillingCountry());
                additionalMap.put("billingZip", additional.getBillingZip());
                additionalMap.put("productName", additional.getProductName());
               
                additionalMap.put("authUrl", additional.getAuthUrl());
                additionalMap.put("rrn", additional.getRrn());
                additionalMap.put("upa", additional.getUpa());
                additionalMap.put("descriptor", additional.getDescriptor());
                additionalMap.put("transactionResponse", additional.getTransactionResponse());
                additionalMap.put("connectorRef", additional.getConnectorRef());
                
                additionalMap.put("payloadStage1", additional.getPayloadStage1());
                additionalMap.put("connectorCredsProcessingFinal", additional.getConnectorCredsProcessingFinal());
                additionalMap.put("returnUrl", additional.getReturnUrl());
                additionalMap.put("webhookUrl", additional.getWebhookUrl());
                additionalMap.put("sourceUrl", additional.getSourceUrl());
                additionalMap.put("connectorResponseStage1", additional.getConnectorResponseStage1());
                additionalMap.put("connectorResponseStage2", additional.getConnectorResponseStage2());
                
                additionalMap.put("merchantNote", additional.getMerchantNote());
                additionalMap.put("supportNote", additional.getSupportNote());
                additionalMap.put("systemNote", additional.getSystemNote());
             
                additionalMap.put("connectorResponse", Base64Util.decodeBase64(additional.getConnectorResponse()));

                additionalMap.put("authData", Base64Util.decodeBase64(additional.getAuthData()));
               
                
                
                combinedData.put("additional", additionalMap);
            } else {
                combinedData.put("additional", new HashMap<>());
            }
            
            result.add(combinedData);
        }
        
        return result;
    }

    @Override
    public String addTransaction(Transaction transaction) {
        transactionDao.save(transaction);
        return "Transaction added successfully";
    }

    @Override
    public Transaction saveTransaction(Transaction transaction, TransactionAdditional additional) {
        Transaction savedTransaction = transactionDao.save(transaction);
        additional.setTransIDAd(savedTransaction.getTransID());
        transactionAdditionalDao.save(additional);
        return savedTransaction;
    }

    @Override
    public Transaction updateTransaction(String transID, Transaction transaction, TransactionAdditional additional) {
        try {
            Long transactionId = Long.parseLong(transID);
            
            // Get existing transaction
            Transaction existingTransaction = transactionDao.findByTransID(transactionId);
            if (existingTransaction == null) {
                log.error("Transaction not found with ID: {}", transID);
                return null;
            }

            // Update transaction fields
            if (transaction.getTransactionStatus() != null) {
                existingTransaction.setTransactionStatus(transaction.getTransactionStatus());
            }
            

            // Save transaction updates
            Transaction updatedTransaction = transactionDao.save(existingTransaction);
            log.info("Transaction updated successfully: {}", transID);

            // Handle additional data if provided
            if (additional != null) {
                TransactionAdditional existingAdditional = transactionAdditionalDao.findByTransIDAd(transactionId);
                if (existingAdditional == null) {
                    additional.setTransIDAd(transactionId);
                    transactionAdditionalDao.save(additional);
                    log.info("Created new additional data for transaction: {}", transID);
                } else {
                    // Update existing additional fields
                    if (additional.getSupportNote() != null) {
                        existingAdditional.setSupportNote(additional.getSupportNote());
                    }
                    if (additional.getMerchantNote() != null) {
                        existingAdditional.setMerchantNote(additional.getMerchantNote());
                    }
                    if (additional.getSystemNote() != null) {
                        existingAdditional.setSystemNote(additional.getSystemNote());
                    }
                    transactionAdditionalDao.save(existingAdditional);
                    log.info("Updated additional data for transaction: {}", transID);
                }
            }

            return updatedTransaction;
        } catch (Exception e) {
            log.error("Error updating transaction: {}", transID, e);
            return null;
        }
    }

    @Override
    public Transaction getTransactionByTransID(Long transID) {
        return transactionDao.findByTransID(transID);
    }

    @Override
    public List<Map<String, Object>> searchTransactions(String reference, Long merchantID, Short status) {
        try {
            log.debug("Searching transactions with reference: {}, merchantID: {}, status: {}", 
                     reference, merchantID, status);
            
            // Get transactions based on search criteria
            List<Transaction> transactions = transactionDao.searchTransactions(reference, merchantID, status);
            if (transactions == null || transactions.isEmpty()) {
                log.debug("No transactions found matching criteria");
                return new ArrayList<>();
            }

            // Get all additional details
            List<TransactionAdditional> additionalDetails = transactionAdditionalDao.findAll();
            
            // Create map for faster lookups
            Map<Long, TransactionAdditional> additionalMap = new HashMap<>();
            for (TransactionAdditional additional : additionalDetails) {
                if (additional != null && additional.getTransIDAd() != null) {
                    try {
                        Long transId = Long.valueOf(additional.getTransIDAd());
                        additionalMap.put(transId, additional);
                    } catch (NumberFormatException e) {
                        log.warn("Invalid transaction ID format in additional data: {}", additional.getTransIDAd());
                    }
                }
            }
            
            // Combine transaction and additional data
            List<Map<String, Object>> combinedData = new ArrayList<>();
            for (Transaction transaction : transactions) {
                if (transaction != null && transaction.getTransID() != null) {
                    Map<String, Object> data = new HashMap<>();
                    data.put("transaction", transaction);
                    data.put("additional", additionalMap.get(transaction.getTransID()));
                    combinedData.add(data);
                }
            }
            
            log.debug("Found {} matching transactions", combinedData.size());
            return combinedData;

        } catch (Exception e) {
            log.error("Error searching transactions: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search transactions: " + e.getMessage(), e);
        }
    }

    public Transaction saves2sTrans(Transaction transaction) {
        return transactionDao.save(transaction);
    }

    public TransactionAdditional saves2sTransAdditional(TransactionAdditional transactionAdditional) {
        return transactionAdditionalDao.save(transactionAdditional);
    }
    
    
    // This method fetches transaction details based on transID
    // and returns a map with the details.
    public ResponseEntity<Map<String, Object>> updateTransStatus(String transID, HttpServletRequest request, Boolean isWebhookBoolean, Boolean isRefundBoolean) {
        log.debug("Fetching transaction details for transID: {}", transID);
        
        // Treat isRefundBoolean as false if it is null
        boolean isRefund = (isRefundBoolean != null) ? isRefundBoolean : false;

        String connector_payin_file = "Status_";
        if(isRefund) {
            connector_payin_file = "Refund_";
        } 

        // Initialize response map
		Map<String, Object> response = new HashMap<>();

        // Declare and initialize 
        boolean updateDb = false;	
        boolean adminRes = false; 
        
        Integer  tr_status = 0;
        Integer  status_code_set = 0;

        String  orderStatus = "", 
                connector_status_code = "", 
                connector_response_msg = "", 
                feeId = "", 
                connector_payin = "", 
                merID = "", 
                webhook_url = "", 
                return_url = "";

        // Format the date to include microseconds
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS");

        // currentDateTime for formatting like YYYY-MM-DD HH:MM:SS
        String currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);
        String existingSystemNote = "";
        boolean systemNoteUpdateDb = false;
        String existingSupportNote = "";
        //boolean existingSupportNoteUpdateDb = false;

        Map<String, Object> connectorData = new HashMap<>();
        Map<String, Object> credentials = new HashMap<>();
        Map<String, Object> getPost = new HashMap<>();

		try {

           // For POST/PUT: extract form parameters
	        if ("POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod())) {
	            Map<String, String[]> parameterMap = request.getParameterMap();
	            for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
	                String key = entry.getKey();
	                String[] values = entry.getValue();
	                if (values != null && values.length > 0) {
	                    getPost.put(key, values[0]);
	                }
	            }
	        }
	        // For GET: extract query parameters
	        else if ("GET".equalsIgnoreCase(request.getMethod())) {
	            String queryString = request.getQueryString();
	            if (queryString != null) {
	                String[] pairs = queryString.split("&");
	                for (String pair : pairs) {
	                    String[] keyValue = pair.split("=");
	                    if (keyValue.length == 2) {
	                        String key = null;
                            try {
                                key = java.net.URLDecoder.decode(keyValue[0], "UTF-8");
                            } catch (UnsupportedEncodingException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                            }
	                        String value = java.net.URLDecoder.decode(keyValue[1], "UTF-8");
	                        getPost.put(key, value);
	                    }
	                }
	            }
	        } 

            System.out.println("\r== updateTransStatus :: Status getPost => "+getPost);

            String referer = request.getHeader("Referer");
            System.out.println("\r Referer URL: " + referer);

            System.out.println("\r Request URL: " + request.getRequestURL());

            String requestURI = request.getRequestURI(); // Only path, no domain or port
            if (requestURI.contains("/status/s2s/admin")) {
                adminRes = true; 
                System.out.println("\r Request path contains /status/s2s/admin");
            }

	        // Extract and log authorization header
	        String authHeader = request.getHeader("Authorization");
	        System.out.println("Auth header: " + (authHeader != null ? "Present" : "Missing"));


			Long transIDLong = Long.parseLong(transID); // Convert String to Long

			// Fetch Transaction Data
			Optional<Transaction> transactionOpt = Optional
					.ofNullable(transactionDao.findByTransID(transIDLong));
			

			// Fetch TransactionAdditional Data
			Optional<TransactionAdditional> additionalOpt = Optional
					.ofNullable(transactionAdditionalDao.findByTransIDAd(transIDLong));

                   

			if (transactionOpt.isPresent()) {
				Transaction transaction = transactionOpt.get();
				TransactionAdditional additional = additionalOpt.get();

                existingSystemNote = additional.getSystemNote() != null ? additional.getSystemNote() : "";
                existingSupportNote = additional.getSupportNote() != null ? additional.getSupportNote() : "";

                connectorData.put("transID", transaction.getTransID() ==  null ? "" : transaction.getTransID().toString());
                connectorData.put("billAmount", transaction.getBillAmount() ==  null ? "" : transaction.getBillAmount().toString());
                connectorData.put("billCurrency", transaction.getBillCurrency() ==  null ? "" : transaction.getBillCurrency().toString());


                Double bankProcessingAmount = 0.0;
                String bankProcessingCurrency = "";
            
                if(transaction.getBankProcessingAmount() != null)
                    bankProcessingAmount = Double.parseDouble(transaction.getBankProcessingAmount().toString());
                else if(transaction.getTransactionAmount() != null)
                    bankProcessingAmount = Double.parseDouble(transaction.getTransactionAmount().toString());
                else if(transaction.getBillAmount() != null)
                    bankProcessingAmount = Double.parseDouble(transaction.getBillAmount().toString());

                connectorData.put("bankProcessingAmount", bankProcessingAmount);

                if(transaction.getBankProcessingCurrency() != null)
                    bankProcessingCurrency = transaction.getBankProcessingCurrency().toString();
                else if(transaction.getTransactionCurrency() != null)
                    bankProcessingCurrency = transaction.getTransactionCurrency().toString();
                else if(transaction.getBillCurrency() != null)
                    bankProcessingCurrency = transaction.getBillCurrency().toString();

                connectorData.put("bankProcessingCurrency", bankProcessingCurrency);


                orderStatus = transaction.getTransactionStatus() == null ? "0"
						: transaction.getTransactionStatus().toString(); // Default to Pending
                tr_status = orderStatus.equals("0") ? 0 : Integer.parseInt(orderStatus);

                
                connector_response_msg = (additional.getTransactionResponse() == null) ? "Payment is pending" : additional.getTransactionResponse();
                webhook_url = additional.getWebhookUrl().toString();

                // Set status_code_set based on conditions for 3ds test card from otp
                if(getPost.containsKey("test_auth") && "approved".equals(getPost.get("test_auth")) && tr_status == 27) {
                    status_code_set = 25;
                    connector_response_msg = "3DS test card approved";
                }
                else if(getPost.containsKey("test_auth") && "declined".equals(getPost.get("test_auth")) && tr_status == 27) {
                    status_code_set = 26;
                    connector_response_msg = "3DS test card declined";
                }

                System.out.println("\r status_code_set => "+status_code_set);
                System.out.println("\r connector_response_msg => "+connector_response_msg);



                merID = transaction.getMerchantID().toString();
                feeId = transaction.getFeeId() !=null ? transaction.getFeeId().toString() : "";
                connectorData.put("merID", merID);
                connectorData.put("feeId", feeId);

                connectorData.put("connectorRef", additional.getConnectorRef() ==  null ? "" : additional.getConnectorRef());

                //Extract credentials as a jsondecode 
                String getCredentials = (additional.getConnectorCredsProcessingFinal() !=null) ? additional.getConnectorCredsProcessingFinal() : "";

                if(getCredentials !=null) credentials = jsonde(getCredentials);
                
                //for Comment 
                //response.put("apc_get", credentials);

                //== Fetch Connector Data for retrieves the transaction details and updates the status accordingly from provider conenector api based ==
                String getConnector = (transaction.getConnector() != null) ? transaction.getConnector().toString() : "";
 
                if (getConnector != null) {
                    Connector connector = connectorDao.findByConnectorNumber(getConnector);
                    if (connector != null) {

                        //for Comment 
                        //response.put("connector", connector);
                        connectorData.put("connector", connector);

                        String connectorBaseUrl = connector.getConnectorBaseUrl();
                        String connectorStatusUrl = connector.getConnectorStatusUrl();
                        String defaultConnector = connector.getDefaultConnector();
                        String connectorStatus = connector.getConnectorStatus();
                        String connectorRefundUrl = connector.getConnectorRefundUrl();

                        connectorData.put("connectorStatusUrl", connectorStatusUrl);
                        connectorData.put("connectorBaseUrl", connectorBaseUrl);
                        connectorData.put("connectorStatus", connectorStatus);
                        connectorData.put("connectorRefundUrl", connectorRefundUrl);
                        
                        connector_payin = defaultConnector;
                    }
                }

                
                //=== Fetch Connector Data for retrieves the transaction details and updates the status accordingly from provider conenector api based ===
                //=== START status connector class ===
                //S100 include connector payin for connector class
                if(connector_payin != null && connectorData !=null && credentials !=null ) 
                { 
                    try {
                        // Get the connector class dynamically

                        String connectorClassName = "com.webapp.controller.payin.pay_" + connector_payin + "." + connector_payin_file + connector_payin;
                        Class<?> connectorClass = Class.forName(connectorClassName);
                        
                        // Create an instance of the connector
                        Object connectorInstance = connectorClass.getDeclaredConstructor().newInstance();
                        
                        // Get the mapPayload method
                        Method mapPayloadMethod = connectorClass.getMethod("mapPayload", Object.class);
                        
                        // Create the payload object
                        Map<String, Object> payload = new HashMap<>();
                        payload.putAll(connectorData);
                       // payload.put("request", request);  // Add the request parameter to the payload
                        // Add both to payload
                        payload.put("apc_get", credentials);  // Parsed JSON object as live or test from connectorProcessingCredsJson
                        

                        //100 Call the mapPayload method dynamically file wise and passing payload for connector and request ####100########
                        Object mappedPayload = mapPayloadMethod.invoke(connectorInstance, payload);

                        // Use the mapped payload
                        System.out.println("\rMapped payload: " + mappedPayload);
                        
                        // Store the mapped payload for further processing
                        request.setAttribute("mappedPayload", mappedPayload);  // Using request instead of ser
                        
                        
                        // After getting mappedPayload

                        // Prepare the respone form payload as per connector retrun
                        @SuppressWarnings("unchecked")
                        Map<String, Object> mappedResponseMap = (Map<String, Object>) mappedPayload;

                        if (mappedResponseMap.containsKey("connector_response_msg") && mappedResponseMap.get("connector_response_msg").toString() != null && mappedResponseMap.get("connector_response_msg").toString() != "Unknown") {
                            // Extracting connector_response_ref
                            connector_response_msg = mappedResponseMap.get("connector_response_msg").toString();

                        }

                        //overwrite orderStatus from connector_status_code
                        Boolean isStatusCode = false;
                        if (mappedResponseMap.containsKey("connector_status_code") || (status_code_set != null && status_code_set != 0)) {
                            // Extracting connector_status_code
                            connector_status_code = mappedResponseMap.get("connector_status_code") != null ? mappedResponseMap.get("connector_status_code").toString() : status_code_set.toString();

                            Integer csc_int = Integer.parseInt(connector_status_code);
                            
                            if( (tr_status == 0 || tr_status == 22 || tr_status == 23) && (csc_int == 1 || csc_int == 2 || csc_int == 22 || csc_int == 23) && (connector_status_code != null && !connector_status_code.isEmpty())) {
                                isStatusCode = true;
                            }
                            else if( (tr_status == 27) && (status_code_set == 25 || status_code_set == 26) && (connector_status_code != null && !connector_status_code.isEmpty())) {
                                isStatusCode = true;
                            } 
                            
                            // Only update if status has changed
                            if (isStatusCode) {
                                updateDb = true;
                                orderStatus = connector_status_code;	
                                transaction.setTransactionStatus(Short.parseShort(connector_status_code));
                                transactionDao.save(transaction); // Save the updated transaction
                                log.debug("Transaction status updated from {} to {}", orderStatus, connector_status_code);

                                

                                //systemNote update for status
                                systemNoteUpdateDb = true;
                                currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);
                                if(existingSystemNote != null && existingSystemNote.length() > 0) {
                                    existingSystemNote += "\n";
                                }
                                existingSystemNote += currentDateTime + " | " + connector_payin_file + " " + getStatusDes(orderStatus) + " - " + connector_status_code;
                                if (connector_response_msg != null && !connector_response_msg.isEmpty()) {
                                    existingSystemNote += " - " + connector_response_msg;
                                }

                                //existingSupportNote update for status
                                if(existingSupportNote != null && existingSupportNote.length() > 0) {
                                    existingSupportNote += "\n";
                                }
                                existingSupportNote += currentDateTime + " | " + connector_payin_file + " " + getStatusDes(orderStatus);
                                additional.setSupportNote(existingSupportNote);
                                transactionAdditionalDao.save(additional); // Save the updated additional data

                                
                            }
                            
                            orderStatus = connector_status_code;
                            response.put("connector_status_code", connector_status_code);
                        }
                        
                        if (connector_response_msg != null && !connector_response_msg.isEmpty()) {
                            if(updateDb){
                                additional.setTransactionResponse(connector_response_msg);
                                transactionAdditionalDao.save(additional); // Save the updated additional data
                            }
                            if(adminRes)
                            response.put("connector_response_msg", connector_response_msg);
                        }
                        

                        // Assuming parsedResponse is already defined
                        if (mappedResponseMap.containsKey("gateway_response")) {
                            // Extracting gateway_response
                            @SuppressWarnings("unchecked")
                            String connector_response = Base64Util.encodeBase64(jsonen((Map<String, Object>) mappedResponseMap.get("gateway_response")));
                            //transactionAdditional.setConnectorResponse(connector_response);
                            if(adminRes)
                            response.put("gateway_response", mappedResponseMap.get("gateway_response")); 
                        }
                        

                       
                        
                    } catch (ClassNotFoundException e) {
                        // Log the error instead of exiting
                        System.err.println(connector_payin_file + " connector class not found: " + e.getMessage());
                        e.printStackTrace();
                        
                        
                    } catch (Exception e) {
                        // Log the error instead of exiting
                        System.err.println("Error processing " + connector_payin_file + " connector: " + e.getMessage());
                        e.printStackTrace();
                        
                        
                    }
                }	
                //=== END status connector class ===
               



				String decryptedCCNO = additional.getCcnoDecrypted(); // Decrypt ccno
				
				String statusDescription = getStatusDes(orderStatus); // Convert code to text

				response.put("transID", transaction.getTransID().toString());
				response.put("order_status", orderStatus);
				response.put("status", statusDescription);
				response.put("bill_amt", transaction.getBillAmount().toString());

                String formattedDate = dateFormat.format(transaction.getTransactionDate());
				response.put("tdate", formattedDate);

				response.put("bill_currency", transaction.getBillCurrency());
                
				response.put("response", connector_response_msg);
				response.put("reference", transaction.getReference());
				response.put("mop", transaction.getMethodOfPayment());
				//response.put("authstatus", "http://localhost:9003/api/authstatus/" + transID);

				// Fetch Additional Details
				if (additionalOpt.isPresent()) {

					response.put("descriptor", additional.getDescriptor());
					response.put("upa", additional.getUpa());
					response.put("rrn", additional.getRrn());
					
					if(decryptedCCNO != null) {
						response.put("ccno", maskCardNumber(decryptedCCNO)); // Mask after decryption
					}
					if(orderStatus.equals("0")) {
                        response.put("authurl", additional.getAuthUrl());
                        response.put("authdata", additional.getAuthData());
                    }
				} else {
					response.put("descriptor", null);
					response.put("upa", null);
					response.put("rrn", null);
					response.put("ccno", null);
				}

                //=== Notify push to webhook_url  && updateDb ===
                if (webhook_url != null && !webhook_url.isEmpty() && updateDb) {
                    // Set current date and time with microseconds
                    Instant now = Instant.now();
                    Timestamp notifyTime = Timestamp.from(now);
                    String formattedNotifyTime = dateFormat.format(notifyTime);
                    response.put("webhook_notify_time", formattedNotifyTime);
                    sendWebhookNotification(webhook_url, response);

                    

                    //systemNote update for webhook
                    systemNoteUpdateDb = true;
                    currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);
                    if(existingSystemNote != null && existingSystemNote.length() > 0) {
                        existingSystemNote += "\n";
                    }
                    existingSystemNote += currentDateTime + " | " + connector_payin_file + statusDescription  + " - Webhook notification sent to " + webhook_url ; 

                   
                    log.debug("Webhook notification sent to {} at {} with response is {}", webhook_url, formattedNotifyTime, response);

                }

                //systemNote update
                if(systemNoteUpdateDb && existingSystemNote != null && existingSystemNote.length() > 0) {
                    additional.setSystemNote(existingSystemNote);
                    transactionAdditionalDao.save(additional); // Save the updated additional data
                }

                //=== Check if request is from browser and handle return URL ===
                return_url = additional.getReturnUrl();
                
                if (return_url != null && !return_url.isEmpty() && !isWebhookBoolean) {
                    try {
                        // Convert response parameters to Map<String, String>
                        Map<String, String> params = new HashMap<>();
                        response.forEach((key, value) -> {
                            if (value != null) {
                                params.put(key, String.valueOf(value));
                            }
                        });

                        // Remove any null or empty values
                        params.values().removeIf(value -> value == null || value.isEmpty());

                        // Use normalizeAndBuildUrl with processed parameters
                        return_url = normalizeAndBuildUrl(return_url, params);
                        log.debug("Final redirect URL: {}", return_url);

                        // Return redirect response
                        Map<String, Object> redirectResponse = new HashMap<>();
                        redirectResponse.put("redirect_url", return_url);
                        return ResponseEntity.status(302)
                                .header("Location", return_url)
                                .body(redirectResponse);

                    } catch (Exception e) {
                        log.error("Error building redirect URL: {}", e.getMessage());
                        response.put("error", "Failed to build redirect URL");
                        return ResponseEntity.ok(response);
                    }
                }

                //s2s wise as curl or postman for non-browser/API requests, return JSON response
                return ResponseEntity.ok(response);

			}
		} catch (NumberFormatException e) {
			response.put("error_number", "400");
			response.put("error_message", "Invalid transID format. Expected numeric value.");
			response.put("status", "Error");
            return ResponseEntity.ok(response);
		} catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return ResponseEntity.ok(response);
    }
   
    
    // This method fetches transaction details based on transID
    // and returns a map with the details.
    public Map<String, Object> getTransactionDetails(String transID) {
		Map<String, Object> response = new HashMap<>();
		try {

			Long transIDLong = Long.parseLong(transID); // Convert String to Long

			// Fetch Transaction Data
			Optional<Transaction> transactionOpt = Optional
					.ofNullable(transactionDao.findByTransID(transIDLong));
			

			// Fetch TransactionAdditional Data
			Optional<TransactionAdditional> additionalOpt = Optional
					.ofNullable(transactionAdditionalDao.findByTransIDAd(transIDLong));

			if (transactionOpt.isPresent()) {
				Transaction transaction = transactionOpt.get();
				TransactionAdditional additional = additionalOpt.get();

				String decryptedCCNO = additional.getCcnoDecrypted(); // Decrypt ccno
				
				

				String orderStatus = transaction.getTransactionStatus() == null ? "0"
						: transaction.getTransactionStatus().toString(); // Default to Pending

				String statusDescription = getStatusDes(orderStatus); // Convert code to text

                if (orderStatus.equals("8")) {
                    statusDescription = "Request Processed";
                }

				response.put("transID", transaction.getTransID().toString());
				response.put("order_status", orderStatus);
				response.put("status", statusDescription);
				response.put("bill_amt", transaction.getBillAmount().toString());

				
                // Format the date to include microseconds
		        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS");
                String formattedDate = dateFormat.format(transaction.getTransactionDate());
				response.put("tdate", formattedDate);

				response.put("bill_currency", transaction.getBillCurrency());
				response.put("response", additional.getTransactionResponse() == null ? "Payment is pending"
						: additional.getTransactionResponse());
				response.put("reference", transaction.getReference());
				response.put("mop", transaction.getMethodOfPayment());
				//response.put("authstatus", "http://localhost:9003/api/authstatus/" + transID);

				// Fetch Additional Details
				if (additionalOpt.isPresent()) {

					response.put("descriptor", additional.getDescriptor());
					response.put("upa", additional.getUpa());
					response.put("rrn", additional.getRrn());
					
					if(decryptedCCNO != null) {
						response.put("ccno", maskCardNumber(decryptedCCNO)); // Mask after decryption
					}
					if(orderStatus.equals("0") || orderStatus.equals("27")) 
                    {
                        response.put("authurl", additional.getAuthUrl());
                        response.put("authdata", additional.getAuthData());
                    }
				} else {
					response.put("descriptor", null);
					response.put("upa", null);
					response.put("rrn", null);
					response.put("ccno", null);
				}

				return response;
			}
		} catch (NumberFormatException e) {
			response.put("error_number", "400");
			response.put("error_message", "Invalid transID format. Expected numeric value.");
			response.put("status", "Error");
			return response;
		}
		return response;
    }

    private String getStatusDes(String statusCode) {
	        switch (statusCode) {
	        case "0": return "Pending";
	        case "1": return "Approved";
	        case "2": return "Declined";
	        case "3": return "Refunded";
	        case "5": return "Chargeback";
	        case "7": return "Reversed";
	        case "8": return "Refund Pending";
	        case "9": return "Test";
	        case "10": return "Blocked";

            case "11": return "Predispute";
            case "12": return "Partial Refund";
            case "13": return "Withdraw Requested";
            case "14": return "Withdraw Rolling";
            case "20": return "Frozen Balance";
            case "21": return "Frozen Rolling";
            case "22": return "Expired";
            case "23": return "Cancelled";
            case "24": return "Failed";
            case "25": return "Test Approved";
            case "26": return "Test Declined";
            case "27": return "Test 3DS Authentication";

	        default: return "Pending";
	    }
	}
	
	private String maskCardNumber(String ccno) {
	    if (ccno == null || ccno.length() < 10) {
	        return "Invalid Card";
	    }
	    return ccno.substring(0, 6) + "XXXXXX" + ccno.substring(ccno.length() - 4);
	}
	
	@Override
    public List<Transaction> findAllByOrderByTransactionDateDesc() {
        return transactionDao.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    @Override
    public void updateTransactionID(Integer id, Long transID) {
        Transaction transaction = transactionDao.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
        transaction.setTransID(transID);
        transactionDao.save(transaction);
    }



    /**
	 * Encodes a Map into a JSON string, handling multiple arrays or nested structures.
	 * @param data The Map containing data to encode
	 * @return A JSON string representation of the Map, or an empty string if encoding fails
	 */
	public static String jsonen(Map<String, Object> data) {
	    if (data == null || data.isEmpty()) {
	        return "";
	    }

	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        return objectMapper.writeValueAsString(data);
	    } catch (Exception e) {
	        System.err.println("Error encoding JSON: " + e.getMessage());
	        return "";
	    }
	}

	/** 
	 * Decode JSON string into a Map and handle nested JSON structures
	 * @param jsonString The JSON string to decode from multiple JSON strings
	 * @return A Map representation of the JSON, or empty Map if parsing fails
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> jsonde(String jsonString) {
	    if (jsonString == null || jsonString.isEmpty()) {
	        return new HashMap<>();
	    }
	    
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        Map<String, Object> decodedMap = objectMapper.readValue(jsonString, Map.class);
	        Map<String, Object> resultMap = new HashMap<>();

	        // Iterate through the entries of the decoded JSON
	        for (Map.Entry<String, Object> entry : decodedMap.entrySet()) {
	            String key = entry.getKey();
	            Object value = entry.getValue();

	            // Check if the value is a nested JSON structure
	            if (value instanceof Map) {
	                @SuppressWarnings("unchecked")
	                Map<String, Object> nestedMap = (Map<String, Object>) value;

	                // Iterate through the nested map
	                for (Map.Entry<String, Object> nestedEntry : nestedMap.entrySet()) {
	                    String nestedKey = nestedEntry.getKey();
	                    Object nestedValue = nestedEntry.getValue();

	                    // Add the nested key-value pair to the result map
	                    resultMap.put(key + "." + nestedKey, nestedValue);
	                }
	            } else {
	                // Add the key-value pair to the result map
	                resultMap.put(key, value);
	            }
	        }

	        return resultMap;
	    } catch (Exception e) {
	        System.err.println("Error parsing JSON: " + e.getMessage());
	        return new HashMap<>();
	    }
	}

	/**
	 * Decodes a JSON string into a Map
	 * @param jsonString The JSON string to decode
	 * @return A Map representation of the JSON, or empty Map if parsing fails
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> jsondecode(String jsonString) {
	    if (jsonString == null || jsonString.isEmpty()) {
	        return new HashMap<>();
	    }
	    
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        return objectMapper.readValue(jsonString, Map.class);
	    } catch (Exception e) {
	        System.err.println("Error parsing JSON: " + e.getMessage());
	        return new HashMap<>();
	    }
	}

    // Add this new method at the end of the class
    private void sendWebhookNotification(String webhookUrl, Map<String, Object> data) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(data);
            
            java.net.URL url = new java.net.URL(webhookUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            log.debug("Webhook notification sent to {} with response code {}", webhookUrl, responseCode);
            
        } catch (Exception e) {
            log.error("Error sending webhook notification: {}", e.getMessage());
        }
    }

    // Add these helper methods at the end of the class
    private boolean isBrowserRequest(String userAgent) {
        if (userAgent == null) return false;
        String ua = userAgent.toLowerCase();
        // More comprehensive browser detection
        return ua.contains("mozilla") || 
               ua.contains("chrome") || 
               ua.contains("safari") || 
               ua.contains("firefox") ||
               ua.contains("edge") || 
               ua.contains("opera") ||
               ua.contains("webkit") ||
               ua.contains("msie");
    }

    private String buildRedirectUrl(String urlStr, Map<String, Object> response) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);

        // Build POST data string
        StringBuilder postData = new StringBuilder();
        for (Entry<String, Object> entry : response.entrySet()) {
            if (postData.length() != 0) postData.append('&');
            postData.append(entry.getKey()).append('=').append(entry.getValue());
        }

        // Send data
        try (OutputStream os = conn.getOutputStream()) {
            os.write(postData.toString().getBytes());
        }

        // Handle HTTP response codes
        int responseCode = conn.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new IOException("Server returned HTTP response code: " + responseCode + " for URL: " + urlStr);
        }

        // Read response
        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String responseLine;
            StringBuilder responseBuilder = new StringBuilder();
            while ((responseLine = in.readLine()) != null) {
                responseBuilder.append(responseLine);
            }
            return responseBuilder.toString();
        }
    }

    private String buildRedirectUrl2(String baseUrl, Map<String, Object> params) {
        try {
            // Ensure baseUrl is properly formatted
            baseUrl = baseUrl.trim();
            if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
                baseUrl = "https://" + baseUrl;
            }

            StringBuilder urlBuilder = new StringBuilder(baseUrl);
            if (!baseUrl.contains("?")) {
                urlBuilder.append("?");
            } else if (!baseUrl.endsWith("&")) {
                urlBuilder.append("&");
            }

            // Add required parameters
            urlBuilder.append("transID=").append(java.net.URLEncoder.encode(String.valueOf(params.get("transID")), "UTF-8"))
                     .append("&status=").append(java.net.URLEncoder.encode(String.valueOf(params.get("order_status")), "UTF-8"))
                     .append("&response=").append(java.net.URLEncoder.encode(String.valueOf(params.get("response")), "UTF-8"))
                     .append("&urlactionjava=success");

            String finalUrl = urlBuilder.toString();
            log.debug("Final redirect URL: {}", finalUrl);
            return finalUrl;

        } catch (Exception e) {
            log.error("Error building redirect URL: {}", e.getMessage());
            return baseUrl;
        }
    }

    private String normalizeAndBuildUrl(String baseUrl, Map<String, String> params) throws IOException {
        // Normalize base URL
        baseUrl = baseUrl.trim();
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = "https://" + baseUrl;
        }

        // Initialize URL builder
        StringBuilder urlBuilder = new StringBuilder(baseUrl);
        if (!baseUrl.contains("?")) {
            urlBuilder.append("?");
        } else if (!baseUrl.endsWith("&")) {
            urlBuilder.append("&");
        }

        // Build query string with encoded parameters
        boolean first = !baseUrl.contains("?");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                urlBuilder.append("&");
            }
            urlBuilder.append(java.net.URLEncoder.encode(entry.getKey(), "UTF-8"))
                     .append("=")
                     .append(java.net.URLEncoder.encode(entry.getValue(), "UTF-8"));
            first = false;
        }

        return urlBuilder.toString();
    }

    @Override
    public List<Map<String, Object>> getAllTransactionsByMerchantID(Long merchantID) {
        List<Transaction> transactions = transactionDao.findByMerchantIDOrderByTransactionDateDesc(merchantID);
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Transaction transaction : transactions) {
            Map<String, Object> combinedData = new HashMap<>();
            combinedData.put("transID", String.valueOf(transaction.getTransID()));
            combinedData.put("transaction", transaction);
            
            // Get additional data
            TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(transaction.getTransID());
            if (additional != null) {
                // Include decrypted card number in the response
                Map<String, Object> additionalMap = new HashMap<>();
                
                additionalMap.put("transID", String.valueOf(transaction.getTransID()));
                additionalMap.put("id", additional.getId());
                additionalMap.put("binNumber", additional.getBinNumber());
                additionalMap.put("cardNumber", maskCardNumber(additional.getCcnoDecrypted()));
                additionalMap.put("billingPhone", additional.getBillingPhone());
                additionalMap.put("billingAddress", additional.getBillingAddress());
                additionalMap.put("billingCity", additional.getBillingCity());
                additionalMap.put("billingState", additional.getBillingState());
                additionalMap.put("billingCountry", additional.getBillingCountry());
                additionalMap.put("billingZip", additional.getBillingZip());
                additionalMap.put("productName", additional.getProductName());
                additionalMap.put("authUrl", additional.getAuthUrl());
                additionalMap.put("rrn", additional.getRrn());
                additionalMap.put("upa", additional.getUpa());
                additionalMap.put("descriptor", additional.getDescriptor());
                additionalMap.put("transactionResponse", additional.getTransactionResponse());
                additionalMap.put("connectorRef", additional.getConnectorRef());
                additionalMap.put("connectorResponse", Base64Util.decodeBase64(additional.getConnectorResponse()));
                additionalMap.put("authData", Base64Util.decodeBase64(additional.getAuthData()));
                
                combinedData.put("additional", additionalMap);
            } else {
                combinedData.put("additional", new HashMap<>());
            }
            
            result.add(combinedData);
        }
        
        return result;
    }

    @Override
    public List<Map<String, Object>> findLatest10ApprovedByTransactionDateDesc(Short status, Long merchantID, int page, int size) {
        List<Transaction> transactions = new ArrayList<>();
        // Fetch latest 10 approved transactions ordered by transactionDate descending
        // and filter by merchantID
        if (merchantID != null) {
             transactions = transactionDao.findLatest10ApprovedByStatusAndMerchantId(status, merchantID, PageRequest.of(page, size));
        }
        else {
             transactions = transactionDao.findLatest10ApprovedByTransactionDateDesc(status, PageRequest.of(page, size));
        }
        //List<Transaction> transactions = transactionDao.findLatest10ApprovedByTransactionDateDesc(status, PageRequest.of(0, 10));
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        List<Map<String, Object>> result = new ArrayList<>();
        for (Transaction transaction : transactions) {
            Map<String, Object> combinedData = new HashMap<>();
            combinedData.put("transID", String.valueOf(transaction.getTransID()));
            String formattedDate = dateFormat.format(transaction.getTransactionDate());
            combinedData.put("transactionDate", formattedDate);
            combinedData.put("transaction", transaction);
            TransactionAdditional additional = transactionAdditionalDao.findByTransIDAd(transaction.getTransID());
            if (additional != null) {
                Map<String, Object> additionalMap = new HashMap<>();
                additionalMap.put("transID", String.valueOf(transaction.getTransID()));
                additionalMap.put("id", additional.getId());
                additionalMap.put("binNumber", additional.getBinNumber());
                additionalMap.put("cardNumber", maskCardNumber(additional.getCcnoDecrypted()));
                additionalMap.put("billingPhone", additional.getBillingPhone());
                additionalMap.put("billingAddress", additional.getBillingAddress());
                additionalMap.put("billingCity", additional.getBillingCity());
                additionalMap.put("billingState", additional.getBillingState());
                additionalMap.put("billingCountry", additional.getBillingCountry());
                additionalMap.put("billingZip", additional.getBillingZip());
                additionalMap.put("productName", additional.getProductName());
                additionalMap.put("authUrl", additional.getAuthUrl());
                additionalMap.put("rrn", additional.getRrn());
                additionalMap.put("upa", additional.getUpa());
                additionalMap.put("descriptor", additional.getDescriptor());
                additionalMap.put("transactionResponse", additional.getTransactionResponse());
                additionalMap.put("connectorRef", additional.getConnectorRef());
                additionalMap.put("connectorResponse", Base64Util.decodeBase64(additional.getConnectorResponse()));
                //additionalMap.put("authData", Base64Util.decodeBase64(additional.getAuthData()));

                combinedData.put("cardNumber", maskCardNumber(additional.getCcnoDecrypted()));

                combinedData.put("additional", additionalMap);
            } else {
                combinedData.put("additional", new HashMap<>());
            }
            result.add(combinedData);
        }
        return result;
    }

    @Override
    public long countByTransactionStatus(short status) {
        return transactionDao.countByTransactionStatus(status);
    }

    @Override
    public Long countByTransactionStatusAndMerchantID(Short status, Long merchantID) {
        return transactionDao.countByTransactionStatusAndMerchantID(status, merchantID);
    }
    

    @Override
    public Double sumBillAmountByStatuses(Short statuses) {
        return transactionDao.sumBillAmountByStatuses(statuses);
    }
    @Override
    public Double sumBillAmountByStatusesAndMerchantID(Short status, Long merchantID) {
        return transactionDao.sumBillAmountByStatusesAndMerchantID(status, merchantID);
    }

}