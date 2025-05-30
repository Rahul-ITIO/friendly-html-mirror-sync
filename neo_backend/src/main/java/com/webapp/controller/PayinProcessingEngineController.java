package com.webapp.controller;

import java.io.BufferedReader;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.dao.ConnectorDao;
import com.webapp.dao.TerminalDao;
import com.webapp.entity.BlackList;
import com.webapp.entity.CardValidatorUtils;
import com.webapp.entity.Connector;
import com.webapp.entity.Terminal;
import com.webapp.entity.Transaction;
import com.webapp.entity.TransactionAdditional;
import com.webapp.service.BlackListService;
import com.webapp.service.CurrencyExchangeApiService;
import com.webapp.service.impl.TransactionServiceImpl;
import com.webapp.utility.Base64Util;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class PayinProcessingEngineController {
	
	@Autowired
    private TransactionServiceImpl transactionService;
	
	@Autowired
	private ConnectorDao connectorDao;

	@Autowired
	private TerminalDao terminalDao; // Add this field to resolve terminalDao

	@Autowired
	private CurrencyExchangeApiService currencyExchangeApiService;

	 @Autowired
    private BlackListService blackListService;

	// Add a public static field for connector_id
	public static String connector_id = "";
	public static String auth_3ds = "";


	//@SuppressWarnings("unchecked")
	//@PostMapping("/s2s")
	@RequestMapping(
		value = "/s2s",
		method = {RequestMethod.POST, RequestMethod.GET, RequestMethod.PUT}
	)
	public ResponseEntity<Map<String, Object>> adds2s(HttpServletRequest ser) {
		Map<String, Object> request = new HashMap<>();
		
		try {
			// Handle CORS for checkout integration
			if (ser.getHeader("Origin") != null && ser.getHeader("Origin").contains("localhost:3000")) {
				ser.setAttribute("Access-Control-Allow-Origin", "http://localhost:3000");
				ser.setAttribute("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
				ser.setAttribute("Access-Control-Allow-Headers", "Content-Type");
			}

			String contentType = ser.getContentType();
			
			if (contentType != null && contentType.contains("application/json")) {
				// JSON case
				StringBuilder jsonBuilder = new StringBuilder();
				BufferedReader reader = ser.getReader();
				String line;
				while ((line = reader.readLine()) != null) {
					jsonBuilder.append(line);
				}
				String jsonString = jsonBuilder.toString();
				if (!jsonString.isEmpty()) {
					ObjectMapper objectMapper = new ObjectMapper();
					@SuppressWarnings("unchecked")
					Map<String, Object> jsonBody = objectMapper.readValue(jsonString, Map.class);
					request.putAll(jsonBody);
				}
			} else if (contentType != null && contentType.contains("multipart/form-data")) {
				// Multipart form-data case (example if needed)
				Map<String, String[]> parameterMap = ser.getParameterMap();
				for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
					String key = entry.getKey();
					String[] values = entry.getValue();
					if (values != null && values.length > 0) {
						request.put(key, values[0].trim());
					}
				}
			} else {
				// Other cases (like x-www-form-urlencoded or GET query)
				Map<String, String[]> parameterMap = ser.getParameterMap();
				for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
					String key = entry.getKey();
					String[] values = entry.getValue();
					if (values != null && values.length > 0) {
						request.put(key, values[0].trim());
					}
				}
			}

			// Also handle GET parameters
			if (ser.getMethod().equalsIgnoreCase("GET")) {
				String queryString = ser.getQueryString();
				if (queryString != null) {
					String[] pairs = queryString.split("&");
					for (String pair : pairs) {
						String[] keyValue = pair.split("=");
						if (keyValue.length == 2) {
							String key = java.net.URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
							String value = java.net.URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
							// Special handling for public_key to restore + and =
							if ("public_key".equals(key)) {
								// Replace spaces with +
								value = value.replace(' ', '+');
								// If original pair ends with =, add it back
								if (pair.endsWith("=")) {
									value = value + "=";
								}
							}
							request.put(key, value.trim());
						}
					}
				}
			}
			
			/* 
			// Special handling for checkout integration type
			if (request.containsKey("integration-type") && "checkout".equals(request.get("integration-type"))) {
				// Set default values for checkout integration
				if (!request.containsKey("return_url")) {
					request.put("return_url", "http://localhost:3000/payment/status");
				}
				if (!request.containsKey("webhook_url")) {
					request.put("webhook_url", "http://localhost:3000/api/webhook");
				}
				if (!request.containsKey("source_url")) {
					request.put("source_url", "http://localhost:3000/checkout");
				}
			}
			*/

			Integer jqp = 0;

			if (request.containsKey("jqp") && request.get("jqp") != null) {
				jqp = Integer.parseInt(request.get("jqp").toString());
				if (jqp > 0) {
					System.out.println("JQP: " + jqp);
				}
			}
			if (jqp > 0) {
				System.out.println("\r == adds2s === Request: " + request);
			}



			

	        Transaction transaction = new Transaction();
			TransactionAdditional transactionAdditional = new TransactionAdditional();
	        
	        // Set current date and time with microseconds
	        Instant now = Instant.now();
	        Timestamp transactionDate = Timestamp.from(now); // Preserves microsecond precision
	        transaction.setTransactionDate(transactionDate);
	        
	        transaction.setTransactionStatus((short) 0);
			transaction.setTransactionType(11);

			String currentDateTime = java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19);
			String supportNote = currentDateTime + " | " + "Pending transaction created by " + ser.getServerName() + " (From IP Address: " + ser.getRemoteAddr()+")";

			//systemNote and supportNot update 
			String systemNote = currentDateTime + " | " + " Transaction created by " + ser.getServerName() + " (From IP Address: " + ser.getRemoteAddr()+")" + " - " + request.get("integration-type");
			if (request.containsKey("integration_type")) {
				systemNote += currentDateTime + " - "+ request.get("integration_type");
			}
			else if (request.containsKey("integration-type")) {
				systemNote += currentDateTime + " - "+ request.get("integration-type");
			}
	        
	        String bill_currency = "";
	        String orderCurrency = "";
	        String total_payment_str = "";
	        Double total_payment = null;
			
	        // Check if bill_amt is provided
	        if (!request.containsKey("bill_amt")) {
	            return ResponseEntity.badRequest().body(createErrorResponse("1111", "Error: bill_amt is required."));
	        }
			total_payment_str = request.get("bill_amt").toString();
			total_payment = Double.parseDouble(request.get("bill_amt").toString());
			if (total_payment <= 0) {
				return ResponseEntity.badRequest().body(createErrorResponse("1112", "Error: bill_amt not less than 0."));
			}
	        transaction.setBillAmount(total_payment);

	        
	        // Set the bill currency from request if provided
	        if (request.containsKey("bill_currency") && request.get("bill_currency") != null && !request.get("bill_currency").toString().isEmpty()) {
				bill_currency = request.get("bill_currency").toString();
	            transaction.setBillCurrency(bill_currency);
				orderCurrency = bill_currency;
	        }

	        if (request.containsKey("reference")) {
	            transaction.setReference(request.get("reference").toString());
	        }
	        
	        if (request.containsKey("bill_email")) {
	            transaction.setBillEmail(request.get("bill_email").toString());
	        }
	        
	        if (request.containsKey("bill_ip")) {
	            transaction.setBillIP(request.get("bill_ip").toString());
	        }

	        if (request.containsKey("fullname")) {
	            transaction.setFullName(request.get("fullname").toString());
	        }

	        if (request.containsKey("mop")) {
	            transaction.setMethodOfPayment(request.get("mop").toString());
	        }

	        if (request.containsKey("terNO")) {
	            transaction.setTerminalNumber(Long.parseLong(request.get("terNO").toString()));
	        }
	        
	        if (request.containsKey("integration_type")) {
	            transaction.setIntegrationType(request.get("integration_type").toString());
	        }
	        
	        if (request.containsKey("integration-type")) {
	            transaction.setIntegrationType(request.get("integration-type").toString());
	        }
	        


			//=== START for termial and connector :: STEP_2 ===

			// Declare and initialize 	
			String connector_id = "";
			Long transID = null;	
			String feeId = "";
			String connector_payin = "";
			String merID = "";
			String ccno = "";
			Map<String, Object> connectorkey = null; 

			Map<String, Object> connectorData = new HashMap<>();
			Map<String, Object> credentials = new HashMap<>();


			Boolean isSaveAuthData = false;
	        String payaddress = "";
			Map<String, Object> authdata = new HashMap<>();
			

			


			// Fetch list form Terminal.publicKey for acquirerids and ternoJsonValue 
			if (request.containsKey("public_key")) {
				try {
					// Extract public_key as String
					String public_key = request.get("public_key").toString();
					Terminal terminal = terminalDao.findByPublicKey(public_key);

					if (terminal == null) {
						return ResponseEntity.status(HttpStatus.SC_NOT_FOUND)
								.body(Map.of("error", "Terminal not found"));
					}


					Map<String, Object> res_ter = new HashMap<>();
					
					if(terminal.getConnectorids() != null) {
						// Extract connector_id from terminal
						connector_id = terminal.getConnectorids();
					}

					if(terminal.getTernoJsonValue() != null && connector_id != null) {
						// Extract ternoJsonValue via connector_id 
						String ternoJsonValue = terminal.getTernoJsonValue();
						Map<String, Object> apc_json_ter_de = jsondecode(ternoJsonValue);
						
						@SuppressWarnings("unchecked")
						Map<String, Object> apc_json_ter = apc_json_ter_de.get(connector_id) != null 
						    ? (Map<String, Object>) apc_json_ter_de.get(connector_id) 
						    : new HashMap<>();

						if (apc_json_ter.containsKey("feeId")) {
							feeId = apc_json_ter.get("feeId").toString();
							transaction.setFeeId(Integer.parseInt(feeId));
							res_ter.put("feeId", feeId);
						}

						if (terminal.getMerid() != null) {
							merID = terminal.getMerid().toString();
							transaction.setMerchantID(Long.parseLong(merID));
							res_ter.put("merID", merID);
						}

						// Handle connectorkey inside apc_json_ter
						if (apc_json_ter.containsKey("connectorkey")) {
							Object connectorkeyObj = apc_json_ter.get("connectorkey");
							if (connectorkeyObj instanceof Map) {
								connectorkey = (Map<String, Object>) connectorkeyObj;
							} else {
								connectorkey = new HashMap<>();
							}
						    
							res_ter.put("connectorkey", connectorkey);
						}

						if (request.containsKey("jqp")) 
						{	
							System.out.println("Connectorkey: " + connectorkey);
							System.out.println("Fetch apc_json_ter_de : " + apc_json_ter_de);
							System.out.println("Fetch apc_json_ter : " + apc_json_ter); 
						}
						
						//1 jqp
						//return ResponseEntity.ok().body(connectorkey);

					}


					// Build response map with all required fields
					res_ter.put("connectorids", connector_id);
					res_ter.put("merid", terminal.getMerid());
					res_ter.put("public_key", terminal.getPublicKey());
					res_ter.put("bussinessUrl", terminal.getBussinessUrl());
					res_ter.put("terName", terminal.getTerName());
					res_ter.put("dbaBrandName", terminal.getDbaBrandName());
					res_ter.put("ternoJsonValue", terminal.getTernoJsonValue());

					res_ter.put("selectMcc", terminal.getSelectMcc());
					res_ter.put("webhookUrl", terminal.getWebhookUrl());
					res_ter.put("returnUrl", terminal.getReturnUrl());
					res_ter.put("transID", transID);

					res_ter.put("status", "success");
					res_ter.put("message", "Terminal data fetched successfully");
					res_ter.put("response", "Terminal data fetched successfully");

					if (request.containsKey("jqp")) 
					{
						System.out.println("Fetch from terminal : " + res_ter);
					}

					//2 jqp
					//return ResponseEntity.ok().body(res_ter);
				} 
				catch (Exception e) {
					System.err.println("Error terminal : " + e.getMessage());
					e.printStackTrace();
					
					// Return an error response
					return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(Map.of(
						"status", "error",
						"message", "Error Invalid public_key format",
						"error", e.getMessage()
					));
				}
			}

			
			
	        // Check if "connector_id" for table of connectors 
	        if (request.containsKey("connector_id") || connector_id != null) {
	            try 
				{

	                // Extract connector_id as String
	                String getConnectorId = "";
					if(connector_id != null) {
						getConnectorId = connector_id;
					}else {
						getConnectorId = request.get("connector_id").toString();
					}

					String connectorId = getConnectorId;
					if (request.containsKey("connector_id")) {
						connectorId=request.get("connector_id").toString();
						
					}
					
					transaction.setConnector(Long.parseLong(connectorId.toString()));

					// Generate a unique numeric transID
					 transID = generateUniqueTransID(connectorId, 0);
					transaction.setTransID(transID);

					Connector connector = connectorDao.findByConnectorNumber(getConnectorId);

	                if (connector != null) {
	                	
						// Build response map with all required fields from connector table
						
						
						connectorData.put("defaultConnector", connector.getDefaultConnector());
						connectorData.put("connectorProcessingCredsJson", connector.getConnectorProcessingCredsJson());
						connectorData.put("connectorNumber", connector.getConnectorNumber());
						connectorData.put("connectorName", connector.getConnectorName());
						connectorData.put("channelType", connector.getChannelType());
						connectorData.put("connectorStatus", connector.getConnectorStatus());
						connectorData.put("connectorBaseUrl", connector.getConnectorBaseUrl());
						connectorData.put("connectorLoginCreds", connector.getConnectorLoginCreds());
						connectorData.put("connectorProcessingCurrency", connector.getConnectorProcessingCurrency());
						connectorData.put("connectionMethod", connector.getConnectionMethod());
						connectorData.put("connectorProdUrl", connector.getConnectorProdUrl());
						connectorData.put("connectorUatUrl", connector.getConnectorUatUrl());
						connectorData.put("connectorStatusUrl", connector.getConnectorStatusUrl());
						connectorData.put("connectorDevApiUrl", connector.getConnectorDevApiUrl());
						connectorData.put("connectorWlDomain", connector.getConnectorWlDomain());
						connectorData.put("processingCurrencyMarkup", connector.getProcessingCurrencyMarkup());
						connectorData.put("techCommentsText", connector.getTechCommentsText());
						connectorData.put("connectorRefundPolicy", connector.getConnectorRefundPolicy());
						connectorData.put("connectorRefundUrl", connector.getConnectorRefundUrl());
						connectorData.put("mccCode", connector.getMccCode());
						connectorData.put("connectorProdMode", connector.getConnectorProdMode());
						connectorData.put("connectorDescriptor", connector.getConnectorDescriptor());
						connectorData.put("transAutoExpired", connector.getTransAutoExpired());
						connectorData.put("transAutoRefund", connector.getTransAutoRefund());
						connectorData.put("connectorWlIp", connector.getConnectorWlIp());
						connectorData.put("mopWeb", connector.getMopWeb());
						connectorData.put("mopMobile", connector.getMopMobile());
						connectorData.put("hardCodePaymentUrl", connector.getHardCodePaymentUrl());
						connectorData.put("hardCodeStatusUrl", connector.getHardCodeStatusUrl());
						connectorData.put("hardCodeRefundUrl", connector.getHardCodeRefundUrl());
						connectorData.put("skipCheckoutValidation", connector.getSkipCheckoutValidation());
						connectorData.put("redirectPopupMsgWeb", connector.getRedirectPopupMsgWeb());
						connectorData.put("redirectPopupMsgMobile", connector.getRedirectPopupMsgMobile());
						connectorData.put("checkoutLabelNameWeb", connector.getCheckoutLabelNameWeb());
						connectorData.put("checkoutLabelNameMobile", connector.getCheckoutLabelNameMobile());
						connectorData.put("checkoutSubLabelNameWeb", connector.getCheckoutSubLabelNameWeb());
						connectorData.put("checkoutSubLabelNameMobile", connector.getCheckoutSubLabelNameMobile());
						connectorData.put("ecommerceCruisesJson", connector.getEcommerceCruisesJson());
						connectorData.put("merSettingJson", connector.getMerSettingJson());
						connectorData.put("connectorLabelJson", connector.getConnectorLabelJson());
						connectorData.put("processingCountriesJson", connector.getProcessingCountriesJson());
						connectorData.put("blockCountriesJson", connector.getBlockCountriesJson());
						connectorData.put("notificationEmail", connector.getNotificationEmail());
						connectorData.put("notificationCount", connector.getNotificationCount());
						connectorData.put("autoStatusFetch", connector.getAutoStatusFetch());
						connectorData.put("autoStatusStartTime", connector.getAutoStatusStartTime());
						connectorData.put("autoStatusIntervalTime", connector.getAutoStatusIntervalTime());
						connectorData.put("cronBankStatusResponse", connector.getCronBankStatusResponse());
						

						// Currency Converter 
						Boolean currConverter = false;
						String connectorProcessingCurrency = connector.getConnectorProcessingCurrency();
						if (connectorProcessingCurrency != null) {
							transaction.setBankProcessingCurrency(connectorProcessingCurrency);
							currConverter = true;
						}


						if (connectorProcessingCurrency != null && currConverter && bill_currency != null && !bill_currency.isEmpty() && !bill_currency.equals(connectorProcessingCurrency) && total_payment != null && total_payment > 0) 
						{
						    
						    // First set all the request parameters
						    request.put("start_currency", bill_currency);
						    request.put("start_on_total_payment", total_payment);
						    request.put("bank_processing_currency", connectorProcessingCurrency);
							orderCurrency = connectorProcessingCurrency;
						   

						    // Wrap the currency conversion in a try-catch block for better error handling
						    try {
						        Map<String, Object> conversionResult = CurrencyExchangeApiController.commonDbCurrencyConverter(
						            currencyExchangeApiService, bill_currency, connectorProcessingCurrency, total_payment_str, "tr", "false");

						        if (conversionResult.get("error") != null) {
						            System.out.println("Currency conversion error: " + conversionResult.get("error"));
						            return ResponseEntity.badRequest().body(createErrorResponse("5003", "Error in currency converter: " + conversionResult.get("error")));
						        }

						        String convertedAmount = conversionResult.get("convertedAmount").toString();
						        String conversionRates = conversionResult.get("conversion_rates").toString();

						        transaction.setBankProcessingAmount(Double.parseDouble(convertedAmount));

						        request.put("bank_processing_amount", convertedAmount);
						        request.put("conversion_rates", conversionRates);

						        total_payment = Double.parseDouble(convertedAmount);
						        total_payment_str = convertedAmount;
						    } catch (Exception e) {
						        System.out.println("Exception in currency conversion: " + e.getMessage());
						        e.printStackTrace();
						        return ResponseEntity.badRequest().body(Map.of("error", "Error in conversion result: " + e.getMessage()));
						    }
						}


						//Json decode as a array
						String apc_get = connector.getConnectorProcessingCredsJson();
						Map<String, Object> apc_json = jsondecode(apc_get);
						
						String connectorProdMode = connector.getConnectorProdMode();

						//=== Get credentials based on mode and merge with connectorKey =====
						credentials = jsoncredentials(apc_json, connectorProdMode,connectorkey);


						//Get Defualt Connector for map 
						String defaultConnector = connector.getDefaultConnector();
						
						if (defaultConnector != null) {
							connector_payin = defaultConnector;
							connectorData.put("defaultConnector", defaultConnector);
						}	
	                	
	                	//move to connector class here 
	                	
						
						//return ResponseEntity.ok(connectorData);
						//return ResponseEntity.ok(Map.of("connector_number", connector.getConnectorName()));
	                } else {
	                    return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Connector not found"));
	                }
	            } catch (Exception e) {
	                return ResponseEntity.badRequest().body(Map.of("error", "Invalid connector_id format"));
	            }
	        }

			//=== END for termial and connector :: STEP_2 ===



			// === START for Blacklist check ===
			 
			Boolean isTestCardCheck = true;
			String isTestEnrollmentType = "";
			Boolean isBlackListCheck = true;
			String blacklistPrintMessage = "";
			String blacklistTerm = "";
			String blacklistTermType = "";

			// Check if the request contains "blacklist" for quick processing validate 
			// -connector_id , -10 , merID connector terno
			if(connector_id != null && !connector_id.isEmpty() && merID != null && !merID.isEmpty()) {
					
				try {

					String clientIdsAndConnectorids = "-10,-" + connector_id + "," + merID; 

					ResponseEntity<List<BlackList>> blackListResult = BlackListController.getBlacklistsInClientId(blackListService,clientIdsAndConnectorids,true);

					List<BlackList> blackList = blackListResult.getBody();

					if (blackList != null && !blackList.isEmpty()) {
						StringBuilder message = new StringBuilder();
						boolean allowed = BlacklistValidationService.isBlacklisted(blackList, request, message);
						if (!allowed) 
						{
							isBlackListCheck = false;
							blacklistPrintMessage = message.toString();
							//blacklistPrintMessage = blacklistPrintMessage.replaceAll("Blacklisted: ", "Blocked: ");
							System.out.println("Blocked: " + blacklistPrintMessage);
						}
					}
					
					
					if (isBlackListCheck) {
						// If not blacklisted, proceed with the transaction
						System.out.println("Transaction is not blacklisted");
					} else {
						// If blacklisted, set the blacklist message
						System.out.println("Transaction is blacklisted: " + blacklistTermType + " " + blacklistTerm + " :: " + blacklistPrintMessage);
					}
				} catch (Exception e) {
					isBlackListCheck = true;
					System.err.println("Error parsing blacklist: " + e.getMessage());
					e.printStackTrace();
					return ResponseEntity.badRequest().body(Map.of("error", "Error parsing blacklist: " + e.getMessage()));
					
				}
				
				// Set the transaction status based on blacklist check
				if(!isBlackListCheck && blacklistPrintMessage != null && !blacklistPrintMessage.isEmpty()) {
					request.put(blacklistTermType, blacklistTerm);
					request.put("blacklist_message", blacklistPrintMessage);
					transaction.setTransactionStatus((short) 10);
					transactionAdditional.setTransactionResponse(blacklistPrintMessage.toString());
					supportNote = currentDateTime + " | " + "Transaction " + blacklistPrintMessage;
				} 
			}
			// === END for Blacklist check ===


			if (request.containsKey("ccno") && isBlackListCheck) {
				ccno = request.get("ccno").toString();
				// Remove spaces and dashes
				ccno = ccno.replaceAll("[\\s-]", "");

	        	transactionAdditional.setCcno(ccno);
	        	
				Integer binNumber = Integer.parseInt(ccno.substring(0, 6));
				transactionAdditional.setBinNumber(binNumber);

				//luhn 
				// Check if the card number is valid using Luhn algorithm and test cards
				if(ccno != null && ccno.length() > 0) {

					isSaveAuthData = true;
					
					Map<String, Object> cardValidate = CardValidatorUtils.validateAllCard(ccno);

					if(cardValidate != null) {
						String cardType = (String) cardValidate.get("cardType");
						if(cardType != null) {
							transaction.setMethodOfPayment(cardType);
						}

						String cardNumber = (String) cardValidate.get("cardNumber");
						String enrollmentType = (String) cardValidate.get("enrollmentType");
						String message = (String) cardValidate.get("message");
						Boolean validLuhn = (Boolean) cardValidate.get("validLuhn");
						Boolean valid = (Boolean) cardValidate.get("valid");

						//for test card
						// 3DS -> Test for 3DS
						// 9 -> Test for 3DS
						// 25 -> Test Approved
						// 26 -> Test Declined
						if(valid != null && valid && enrollmentType != null &&  (enrollmentType.equals("3DS") || enrollmentType.equals("25") || enrollmentType.equals("26") || enrollmentType.equals("9") )) {
							isTestCardCheck = false;
							
							if(enrollmentType.equals("3DS")){
								transaction.setTransactionStatus((short) 27);
								isTestEnrollmentType = "3DS";
							}else{
								transaction.setTransactionStatus(Short.parseShort(enrollmentType));
							}

							String testCardMessage = "Test Transaction "+message.toString()+", we do not charge any fees for testing transaction";
							supportNote = currentDateTime + " | " + testCardMessage;
							transactionAdditional.setTransactionResponse(testCardMessage);

						}
						//for live card is LIVE and luhn is not validate for  
						else if(!validLuhn && !valid && enrollmentType != null &&  (enrollmentType.equals("LIVE"))) {
							return ResponseEntity.badRequest().body(createErrorResponse("1113", "We are unable to validate the accuracy of your card. Would you like to try with another card or check the current card number please?"));
						}
						
						System.out.println("cardValidate : " + cardValidate);

						if(jqp == 6) {
							return ResponseEntity.ok(Map.of(
								"status", "success",
								"message", cardValidate
							));
						}
					}
					
				}

	        }


	        //SAVE transaction to db 1st table ====
	        Transaction savedTransaction = transactionService.saves2sTrans(transaction);

			// Regenerate a unique numeric transID with savedTransaction ID for reupdate in transid of 1st table
	        transID = generateUniqueTransID(connector_id, savedTransaction.getId());
	        
	        //savedTransaction.setTransID(transID);
	        //transactionService.saves2sTrans(savedTransaction);

			// Update the transID using a dedicated update method instead of reusing saves2sTrans
			savedTransaction.setTransID(transID);
			transactionService.updateTransactionID(savedTransaction.getId(), transID);

	        	
	        //Fetch transID from transaction table 
	        transID = savedTransaction.getTransID();


	       // Prepare additional transaction data
	        transactionAdditional.setTransIDAd(transID);
	        transactionAdditional.setId(savedTransaction.getId());
	        
	        

			//encrypt month 
			if (request.containsKey("month")) {
	        	transactionAdditional.setExMonth(request.get("month").toString());
			}

			//encrypt year
			if (request.containsKey("year")) {
	        	transactionAdditional.setExYear(request.get("year").toString());
			}

			//credentials set fron json encode
	        if (credentials != null) {
	        	transactionAdditional.setConnectorCredsProcessingFinal(jsonen(credentials));
	        }

			// payload_stage1 set from request for new requestSet and remove key for ccno, ccvv, month, year
			if (request != null) {
	        	Map<String, Object> requestSet = (Map<String, Object>) request;
				if (request.containsKey("ccno")) requestSet.remove("ccno");
				if (request.containsKey("ccvv")) requestSet.remove("ccvv");
				if (request.containsKey("month")) requestSet.remove("month");
				if (request.containsKey("year")) requestSet.remove("year");
	        	transactionAdditional.setPayloadStage1(jsonen(requestSet));
	        }

		
	        
			

	        if (request.containsKey("bill_address")) {
	        	transactionAdditional.setBillingAddress(request.get("bill_address").toString());
	        }

	        if (request.containsKey("bill_city")) {
	        	transactionAdditional.setBillingCity(request.get("bill_city").toString());
	        }

	        if (request.containsKey("bill_state")) {
	        	transactionAdditional.setBillingState(request.get("bill_state").toString());
	        }

	        if (request.containsKey("bill_zip")) {
	        	transactionAdditional.setBillingZip(request.get("bill_zip").toString());
	        }

	        if (request.containsKey("bill_country")) {
	        	transactionAdditional.setBillingCountry(request.get("bill_country").toString());
	        }

	        if (request.containsKey("bill_phone")) {
	        	transactionAdditional.setBillingPhone(request.get("bill_phone").toString());
	        }

	        if (request.containsKey("product_name")) {
	        	transactionAdditional.setProductName(request.get("product_name").toString());
	        }

	        if (request.containsKey("source_url")) {
	        	transactionAdditional.setSourceUrl(request.get("source_url").toString());
	        }

	        if (request.containsKey("return_url")) {
	        	transactionAdditional.setReturnUrl(request.get("return_url").toString());
	        }

	        if (request.containsKey("webhook_url")) {
	        	transactionAdditional.setWebhookUrl(request.get("webhook_url").toString());
	        }


	        // Generate dynamic auth URL
	        String baseUrl = ser.getScheme() + "://" + ser.getServerName();
	        if (ser.getServerPort() != 80 && ser.getServerPort() != 443) {
	            baseUrl += ":" + ser.getServerPort();
	        }
	        baseUrl += "/api/";

	        String authurl = baseUrl + "authurl/" + savedTransaction.getTransID();
	        String test3dsecureauthentication = baseUrl + "authurl/test3dsecureauthentication/" + savedTransaction.getTransID();

	        transactionAdditional.setAuthUrl(authurl);

			if(!isTestCardCheck && isTestEnrollmentType.equals("3DS"))
			{
				payaddress = test3dsecureauthentication;
			}



			
			transactionAdditional.setSystemNote(systemNote);
			transactionAdditional.setSupportNote(supportNote);
			



			//SAVE transactionAdditional db 2nd table
	        TransactionAdditional savedTransAdditional = transactionService.saves2sTransAdditional(transactionAdditional);
	        
	        //url list 
			 auth_3ds = baseUrl + "authurl/auth_3ds/" + savedTransaction.getTransID();


			 request.put("total_payment", total_payment);
			 request.put("total_payment_str", total_payment_str);
			 request.put("orderCurrency", orderCurrency);
 
			 connectorData.put("total_payment", total_payment);
			 connectorData.put("total_payment_str", total_payment_str);
			 connectorData.put("orderCurrency", orderCurrency);
 

			// retrun response for black list check
			if(!isBlackListCheck && blacklistPrintMessage != null && !blacklistPrintMessage.isEmpty()) {
				// Print the blacklist message
				// Return an error response if blacklisted
				return ResponseEntity.status(HttpStatus.SC_FORBIDDEN).body(Map.of(
					"status", "error",
					"transID", transID,
					"message", "Transaction is Blocked",
					"blacklist_message", blacklistPrintMessage
				));
			} 

			//100 include connector payin for connector class ============
			if(connector_payin != null && connectorData !=null && credentials !=null && isBlackListCheck && isTestCardCheck ) {
							
					
				//########100	PAYIN FILE PATH example : neo_backend/src/main/java/com/webapp/controller/payin/pay_100/Connector_100.java	//#############
				try {
					// Get the connector class dynamically
					String connectorClassName = "com.webapp.controller.payin.pay_" + connector_payin + ".Connector_" + connector_payin;
					Class<?> connectorClass = Class.forName(connectorClassName);
					
					// Create an instance of the connector
					Object connectorInstance = connectorClass.getDeclaredConstructor().newInstance();
					
					// Get the mapPayload method
					Method mapPayloadMethod = connectorClass.getMethod("mapPayload", Object.class);
					
					// Create the payload object
					Map<String, Object> payload = new HashMap<>();
					payload.putAll(connectorData);
					payload.put("transID", transID);
					payload.put("request", request);  // Add the request parameter to the payload
					// Add both to payload
					payload.put("apc_get", credentials);  // Parsed JSON object as live or test from connectorProcessingCredsJson
					




					//100 Call the mapPayload method dynamically file wise and passing payload for connector and request ####100########
					Object mappedPayload = mapPayloadMethod.invoke(connectorInstance, payload);





					
					// Use the mapped payload
					System.out.println("Mapped payload: " + mappedPayload);
					
					// Store the mapped payload for further processing
					ser.setAttribute("mappedPayload", mappedPayload);  // Using request instead of ser
					







					// After getting mappedPayload

					// Prepare the respone form payload as per connector retrun
					Map<String, Object> authMap = new HashMap<>();
					@SuppressWarnings("unchecked")
					Map<String, Object> mappedResponseMap = (Map<String, Object>) mappedPayload;

					authMap.put("connector_authurl", auth_3ds); // set auth_3ds URL
					
					if (mappedResponseMap.containsKey("connector_ref")) {
						// Extracting connector_ref
						String connector_ref = mappedResponseMap.get("connector_ref").toString();
						transactionAdditional.setConnectorRef(connector_ref);
						authMap.put("connector_ref", connector_ref); 
					}
					

					// Assuming parsedResponse is already defined
					if (mappedResponseMap.containsKey("gateway_response")) {
						// Extracting gateway_response
						@SuppressWarnings("unchecked")
						String connector_response = Base64Util.encodeBase64(jsonen((Map<String, Object>) mappedResponseMap.get("gateway_response")));
						transactionAdditional.setConnectorResponse(connector_response);
						authMap.put("gateway_response", mappedResponseMap.get("gateway_response")); 
					}
					
					
					/* 
					// Prepare authDataMap for updating
					Map<String, Object> authDataMap = new HashMap<>();

					authDataMap.put("transID", transID);
					authDataMap.put("action", "redirect");
					authDataMap.put("payamt", Double.parseDouble(request.get("bill_amt").toString()));
					authDataMap.put("paycurrency", request.get("bill_currency").toString());
					authDataMap.put("paytitle", request.get("product_name").toString()); // from dba
					if (mappedResponseMap.containsKey("connector_payaddress")) {
						authDataMap.put("payaddress", mappedResponseMap.get("connector_payaddress")); //Extracting payaddress
					}
					if (mappedResponseMap.containsKey("connector_authdata")) {
						authDataMap.put("authdata", mappedResponseMap.get("connector_authdata")); //Extracting connector_authdata
					}
					
					authMap.put("connector_authdata", authDataMap); // set authDataMap

					transactionAdditional.setAuthUrl(auth_3ds);
					String authdata64 = Base64Util.encodeBase64(jsonen(authDataMap));
					transactionAdditional.setAuthData(authdata64);
					
					transactionService.saves2sTransAdditional(transactionAdditional);
					*/

					isSaveAuthData = true;
					if (mappedResponseMap.containsKey("connector_payaddress")) {
						payaddress = mappedResponseMap.get("connector_payaddress").toString(); //Extracting connector_payaddress
					}
					if (mappedResponseMap.containsKey("connector_authdata")) {
						authdata = (Map<String, Object>) mappedResponseMap.get("connector_authdata"); //Extracting connector_authdata
					}
					

					// Check if the request contains "qp" for quick processing response enbale
					if (jqp == 1) {
						// Return success or continue processing
						return ResponseEntity.ok().body(Map.of(
							"status", "success",
							"message", "Connector processed successfully",
							"transID", transID,
							//"auth_res", authMap,
							"payload_res", mappedPayload
						));
					}
					
				} catch (ClassNotFoundException e) {
					// Log the error instead of exiting
					System.err.println("Connector class not found: " + e.getMessage());
					e.printStackTrace();
					
					// Return an error response
					return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of(
						"status", "error",
						"message", "Connector not found: " + connector_payin,
						"error", e.getMessage()
					));
					
				} catch (Exception e) {
					// Log the error instead of exiting
					System.err.println("Error processing connector: " + e.getMessage());
					e.printStackTrace();
					
					// Return an error response
					return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(Map.of(
						"status", "error",
						"message", "Error processing connector",
						"error", e.getMessage()
					));
				}
			}	
			
			// save authdata for 3ds
			if(isSaveAuthData) {
				// Prepare authDataMap for updating
				Map<String, Object> authDataMap = new HashMap<>();

				authDataMap.put("transID", savedTransaction.getTransID());
				authDataMap.put("action", "redirect");
				authDataMap.put("payamt", Double.parseDouble(request.get("bill_amt").toString()));
				authDataMap.put("paycurrency", request.get("bill_currency").toString());
				authDataMap.put("paytitle", request.get("product_name").toString()); // from dba
				if (payaddress != null) {
					authDataMap.put("payaddress", payaddress); //Extracting payaddress
				}
				if (authdata != null) {
					authDataMap.put("authdata", authdata); //Extracting connector_authdata
				}
				
				//authMap.put("connector_authdata", authDataMap); // set authDataMap

				transactionAdditional.setAuthUrl(auth_3ds);
				String authdata64 = Base64Util.encodeBase64(jsonen(authDataMap));
				transactionAdditional.setAuthData(authdata64);
				
				transactionService.saves2sTransAdditional(transactionAdditional);
			}
			

	        // Generate response map ===
	       Map<String, Object> response = createSuccessResponse(savedTransaction, savedTransAdditional, baseUrl);
			//Map<String, Object> response = transactionService.getTransactionDetails(transID.toString());
	        return ResponseEntity.ok(response);

	    } catch (Exception e) {
	        return ResponseEntity.badRequest().body(createErrorResponse("500", "Internal Server Error: " + e.getMessage()));
	    }
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

    // Method to create a success response map
	// It includes transaction details, status, and other relevant information.
    private Map<String, Object> createSuccessResponse(Transaction savedTransaction, TransactionAdditional transactionAdditional, String baseUrl) {
    	
    	String orderStatus = savedTransaction.getTransactionStatus() == null ? "0" : savedTransaction.getTransactionStatus().toString(); // Default to Pending
    	

    	String statusDescription = getStatusDes(orderStatus); // Convert code to text
    	
    	// Build response
    	Map<String, Object> response = new HashMap<>();
    	response.put("transID", savedTransaction.getTransID().toString());
    	response.put("order_status", orderStatus);
    	response.put("status", statusDescription);
    	response.put("bill_amt", savedTransaction.getBillAmount() == null ? "0.00" : savedTransaction.getBillAmount().toString());

		if(transactionAdditional.getDescriptor() != null) {
    		response.put("descriptor", transactionAdditional.getDescriptor());
		}

    	 // Format the date to include microseconds
		 SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS");
		 //dateFormat.setTimeZone(TimeZone.getTimeZone("UTC")); // Set timezone to UTC
		 // Format the date to include microseconds
		 String formattedDate = dateFormat.format(savedTransaction.getTransactionDate());
    	response.put("tdate", formattedDate);

    	response.put("bill_currency", savedTransaction.getBillCurrency());
		response.put("response", transactionAdditional.getTransactionResponse() == null ? "Payment is pending" : transactionAdditional.getTransactionResponse());

    	response.put("reference", savedTransaction.getReference());
    	response.put("mop", savedTransaction.getMethodOfPayment());
    	
    	String decryptedCCNO = transactionAdditional.getCcnoDecrypted(); // Decrypt ccno
    	if(decryptedCCNO != null) {
    		response.put("ccno", maskCardNumber(decryptedCCNO)); // Mask after decryption
    	}
    	
    	response.put("rrn", transactionAdditional.getRrn());
    	response.put("upa", transactionAdditional.getUpa() == null ? "null" : transactionAdditional.getUpa());

    	response.put("authstatus", baseUrl + "authurl/s2s/" + savedTransaction.getTransID());
    	response.put("authurl", baseUrl + "authurl/" + savedTransaction.getTransID());
		response.put("authdata", transactionAdditional.getAuthData() == null ? "null" : transactionAdditional.getAuthData());
    	//return ResponseEntity.ok(response);


        return response;
    }
    
	// Method to create an error response map
	// It includes error number, message, and status.
	// This method is used to generate a consistent error response format.
    private Map<String, Object> createErrorResponse(String errorNumber, String errorMessage) {
        Map<String, Object> response = new HashMap<>();
        response.put("error_number", errorNumber);
        response.put("error_message", errorMessage);
        response.put("status", "Error");
        return response;
    }


	// Method to decode JSON string into a Map
	// It uses ObjectMapper to convert JSON string to a Map object.
	// This method is used to parse JSON data received from various sources.
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
	        case "10": return "Scrubbed";
	        case "11": return "Predispute";
	        case "12": return "Partial Refund";
	        case "13": return "Withdraw Requested";
	        case "14": return "Withdraw Rolling";
	        case "20": return "Frozen Balance";
	        case "21": return "Frozen Rolling";
	        case "22": return "Expired";
	        case "23": return "Cancelled";
	        case "24": return "Failed";
	        default: return "Pending";
	    }
	}
	
	// Method to decode JSON string into a Map
	// It uses ObjectMapper to convert JSON string to a Map object.
	// This method is used to parse JSON data received from various sources.
	private String maskCardNumber(String ccno) {
        if (ccno == null || ccno.length() < 10) {
            return "Invalid Card";
        }
        return ccno.substring(0, 6) + "XXXXXX" + ccno.substring(ccno.length() - 4);
    }
	
	
	
	/**
	 * Extracts credentials from JSON configuration based on mode
	 * @param jsonConfig The JSON configuration containing credentials
	 * @param mode The mode ("1" for live, "0" for test)
	 * @return A Map containing the credentials for the specified mode
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> jsoncredentials(Map<String, Object> jsonConfig, String mode,Map<String, Object> connectorkey) {
	    Map<String, Object> credentials = new HashMap<>();
	    
	    if (jsonConfig == null) {
	        System.err.println("JSON config is null");
	        return credentials;
	    }
	    
	    // Check if mode is "1" (live mode)
	    if ("1".equals(mode)) {
	        // Get live credentials
	        if (jsonConfig.containsKey("live")) {
	            credentials = (Map<String, Object>) jsonConfig.get("live");
	            System.out.println("Using LIVE credentials");
	        } else {
	            System.err.println("Live credentials not found in connector config");
	        }
	    } 
	    // Check if mode is "0" (test mode)
	    else if ("0".equals(mode)) {
	        // Get test credentials
	        if (jsonConfig.containsKey("test")) {
	            credentials = (Map<String, Object>) jsonConfig.get("test");
	            System.out.println("Using TEST credentials");
	        } else {
	            System.err.println("Test credentials not found in connector config");
	        }
	    } else {
	        System.err.println("Invalid connector mode: " + mode);
	    }
	    
		
		//Modify the connectorkey merge as a overwright with credentials. Credentials is previous key for check if paramater name is match then replace value from paramater of connectorkey or new paramater then add in credentials
		if (connectorkey != null && !connectorkey.isEmpty()) {
			for (Map.Entry<String, Object> entry : connectorkey.entrySet()) {
				String key = entry.getKey();
				Object value = entry.getValue();
				// Check if the key already exists in credentials
				if (credentials.containsKey(key)) {
					// If it exists, replace the value with the new value from connectorkey
					credentials.put(key, value);
				} else {
					// If it doesn't exist, add the new key-value pair
					credentials.put(key, value);
				}
			}
		}	

	    return credentials;
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
	

	//Exchange rate API to be used for currency conversion from php code conver in java
	
   
}
