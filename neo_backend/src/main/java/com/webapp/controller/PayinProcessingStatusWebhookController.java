package com.webapp.controller;

import java.io.BufferedReader;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.service.impl.TransactionServiceImpl;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/status")
@CrossOrigin
public class PayinProcessingStatusWebhookController {
	
	@Autowired
    private TransactionServiceImpl transactionService;
	
	
	
	// Helper method to recieve the response in JSON format from webhook
	// This method is used recieve from body and fetch transID from body and send response as a updateTransStatus
	@RequestMapping(
		value = "/webhook/{defaultConnector}",
		method = {RequestMethod.POST, RequestMethod.GET, RequestMethod.PUT}
	)
	public ResponseEntity<?> webhookReceviedAndUpdateTransStatus(@PathVariable String defaultConnector, HttpServletRequest httpRequest) {
		Map<String, Object> request = new HashMap<>();
		try {
			
			String contentType = httpRequest.getContentType();
			
			if (contentType != null && contentType.contains("application/json")) {
				// JSON case
				StringBuilder jsonBuilder = new StringBuilder();
				BufferedReader reader = httpRequest.getReader();
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
				Map<String, String[]> parameterMap = httpRequest.getParameterMap();
				for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
					String key = entry.getKey();
					String[] values = entry.getValue();
					if (values != null && values.length > 0) {
						request.put(key, values[0].trim());
					}
				}
			} else {
				// Other cases (like x-www-form-urlencoded or GET query)
				Map<String, String[]> parameterMap = httpRequest.getParameterMap();
				for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
					String key = entry.getKey();
					String[] values = entry.getValue();
					if (values != null && values.length > 0) {
						request.put(key, values[0].trim());
					}
				}
			}

			// Also handle GET parameters
			if (httpRequest.getMethod().equalsIgnoreCase("GET")) {
				String queryString = httpRequest.getQueryString();
				if (queryString != null) {
					String[] pairs = queryString.split("&");
					for (String pair : pairs) {
						String[] keyValue = pair.split("=");
						if (keyValue.length == 2) {
							String key = java.net.URLDecoder.decode(keyValue[0], StandardCharsets.UTF_8);
							String value = java.net.URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
							request.put(key, value.trim());
						}
					}
				}
			}

			Integer jqp = 0;

			if (request.containsKey("jqp") && request.get("jqp") != null) {
				jqp = Integer.parseInt(request.get("jqp").toString());
				if (jqp > 0) {
					System.out.println("JQP: " + jqp);
				}
			}
			if (jqp > 0) 
			{
				//System.out.println("\r == webhookReceviedAndUpdateTransStatus === Request: " + request);
			}

			System.out.println("Webhhok Request: " + request);

			String transID = "";
			// Check if the request body contains "transID"
			/* 
			if (request.containsKey("cyberId")) {
				transID = request.get("cyberId").toString();
			} 
			else if (request.containsKey("transID")) {
				// Extract transID from the request body
				transID = request.get("transID").toString();
			} 
			*/

			//START for connector class ==
			String connector_payin = defaultConnector;
			//100 include webhook connector in payin status for connector class
			if(connector_payin != null ) 
			{ 
				try {
					// Get the connector class dynamically
					String connectorClassName = "com.webapp.controller.payin.pay_" + connector_payin + ".Webhook_" + connector_payin;
					Class<?> connectorClass = Class.forName(connectorClassName);
					
					// Create an instance of the connector
					Object connectorInstance = connectorClass.getDeclaredConstructor().newInstance();
					
					// Get the mapPayload method
					Method mapPayloadMethod = connectorClass.getMethod("mapPayload", Object.class);
					
					// Create the payload object
					Map<String, Object> payload = new HashMap<>();
					payload.putAll(request);
				   
					//W100 Call the mapPayload method dynamically file wise and passing payload for connector and request ####W100########
					Object mappedPayload = mapPayloadMethod.invoke(connectorInstance, payload);

					
					// Use the mapped payload
					System.out.println("Mapped webhook payload: " + mappedPayload);
					
					// Store the mapped payload for further processing
					httpRequest.setAttribute("mappedPayload", mappedPayload);  // Using request instead of ser
					

					// After getting mappedPayload
					@SuppressWarnings("unchecked")
					Map<String, Object> mappedResponseMap = (Map<String, Object>) mappedPayload;

				   
					//overwrite orderStatus from connector_status_code
					if (mappedResponseMap.containsKey("transID")) {
						// Extracting transID
						transID = mappedResponseMap.get("transID").toString();
					}
					
				   
					
				} catch (ClassNotFoundException e) {
					// Log the error instead of exiting
					System.err.println("Webhook default connector class not found: " + e.getMessage());
					e.printStackTrace();
					
					
				} catch (Exception e) {
					// Log the error instead of exiting
					System.err.println("Error processing in webhook default connector: " + e.getMessage());
					e.printStackTrace();
					
					
				}
			}	
			//END for connector class ==
			
		   

			if (transID == null || transID.isEmpty()) {
				return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Webhook transID not found"));
			}

			//Response as per transID
			// Call the updateTransStatus method to update the transaction status
			ResponseEntity<Map<String, Object>> serviceResponse = transactionService.updateTransStatus(transID, httpRequest, Boolean.TRUE, Boolean.FALSE);
			Map<String, Object> response = serviceResponse.getBody();
			
			if (response == null || response.isEmpty()) {
				return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Webhook response not found"));
			}
			// Return regular JSON response if no redirect
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body(Map.of("error", "Internal server error in webhook", 
						   "message", e.getMessage()));
		}
	}
	
	// GET endpoint for fetching S2S status (more RESTful approach)
	@GetMapping("/s2s/admin/{transID}")
	public ResponseEntity<?> getS2SStatus(@PathVariable String transID, HttpServletRequest httpRequest) {
	    try {
	        // Log request details for debugging
	        System.out.println("Received S2S status GET request for transID: " + transID);
	        System.out.println("Request URL: " + httpRequest.getRequestURL());

	        // Extract and log authorization header
	        String authHeader = httpRequest.getHeader("Authorization");
	        System.out.println("Auth header: " + (authHeader != null ? "Present" : "Missing"));

	        // Ensure authorization header is forwarded to the service
	        if (authHeader != null && authHeader.startsWith("Bearer ")) {
	            String token = authHeader.substring(7);
	            System.out.println("Token extracted successfully" + token);
	        } else {
	            System.out.println("WARNING: No valid Bearer token found in request");
	        }

	        // Call the updateTransStatus method to get the transaction status
	        ResponseEntity<Map<String, Object>> serviceResponse = transactionService.updateTransStatus(transID, httpRequest, Boolean.TRUE, Boolean.FALSE);

	        // Log the service response status code
	        System.out.println("Service response status: " + serviceResponse.getStatusCode());

	        Map<String, Object> response = serviceResponse.getBody();

	        if (response == null || response.isEmpty()) {
	            System.out.println("No S2S status data found for transID: " + transID);
	            return ResponseEntity.status(404) // Replaced HttpStatus.NOT_FOUND with HTTP status code 404
	                .header("Access-Control-Allow-Origin", "*")
	                .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	                .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
	                .body(Map.of("error", "S2S status response not found", 
	                           "transID", transID));
	        }

	        // Log successful response
	        System.out.println("Successfully retrieved S2S status for transID: " + transID);

			return ResponseEntity.ok(response);
			
	        // Return regular JSON response with CORS headers
			/* 
	        return ResponseEntity.ok()
	            .header("Access-Control-Allow-Origin", "*")
	            .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	            .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
	            .body(response);
				*/

	    } catch (Exception e) {
	        // Log the error for debugging
	        System.err.println("Error in S2S status request for transID: " + transID);
	        System.err.println("Error message: " + e.getMessage());
	        e.printStackTrace();

	        return ResponseEntity.internalServerError()
	            .header("Access-Control-Allow-Origin", "*")
	            .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	            .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
	            .body(Map.of("error", "Internal server error in S2S status", 
	                       "message", e.getMessage(),
	                       "transID", transID));
	    }
	}
	
	// Status fetch and update url from s2s for postman
	@PostMapping("/s2s/transid/{transID}")
	public ResponseEntity<?> stsUpdateTransStatus(@PathVariable String transID, HttpServletRequest httpRequest) {
		try {
			//Response as per transID
			// Call the updateTransStatus method to update the transaction status
			ResponseEntity<Map<String, Object>> serviceResponse = transactionService.updateTransStatus(transID, httpRequest, Boolean.TRUE, Boolean.FALSE);
			Map<String, Object> response = serviceResponse.getBody();
			
			if (response == null || response.isEmpty()) {
				return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "S2S status response not found"));
			}
			// Return regular JSON response if no redirect
			return ResponseEntity.ok(response);
			
		} catch (Exception e) {
			return ResponseEntity.internalServerError()
				.body(Map.of("error", "Internal server error in S2S status", 
						   "message", e.getMessage()));
		}
	}
	
	
	//Authstatus URL
	// This method is used to update the transaction status based on the transID.
	// It retrieves the transaction details and updates the status accordingly from provider conenector api based
	// If the transaction is not found, it returns a 404 error.
	// If the transaction is found, it returns the updated transaction details.
	// It also handles the case where the transaction is not found or has an error.
	// The method uses the transactionService to fetch and update the transaction status.
	// It returns a ResponseEntity with the appropriate status and response body.
	// This method is used to update the transaction status based on the transID.
	//@GetMapping("/transid/{transID}")
	@RequestMapping(
		value = "/transid/{transID}",
		method = {RequestMethod.POST, RequestMethod.GET, RequestMethod.PUT}
	)
	public ResponseEntity<?> updateTransStatus(@PathVariable String transID, HttpServletRequest httpRequest) {
	    Map<String, Object> getPost = new HashMap<>();
	    try {
	        // For POST/PUT: extract form parameters
	        if ("POST".equalsIgnoreCase(httpRequest.getMethod()) || "PUT".equalsIgnoreCase(httpRequest.getMethod())) {
	            Map<String, String[]> parameterMap = httpRequest.getParameterMap();
	            for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
	                String key = entry.getKey();
	                String[] values = entry.getValue();
	                if (values != null && values.length > 0) {
	                    getPost.put(key, values[0]);
	                }
	            }
	        }
	        // For GET: extract query parameters
	        else if ("GET".equalsIgnoreCase(httpRequest.getMethod())) {
	            String queryString = httpRequest.getQueryString();
	            if (queryString != null) {
	                String[] pairs = queryString.split("&");
	                for (String pair : pairs) {
	                    String[] keyValue = pair.split("=");
	                    if (keyValue.length == 2) {
	                        String key = java.net.URLDecoder.decode(keyValue[0], "UTF-8");
	                        String value = java.net.URLDecoder.decode(keyValue[1], "UTF-8");
	                        getPost.put(key, value);
	                    }
	                }
	            }
	        }
	        // If transID is in params, override path variable
	        if (getPost.containsKey("transID")) {
	            transID = getPost.get("transID").toString();
	        }
	        ResponseEntity<Map<String, Object>> serviceResponse = transactionService.updateTransStatus(transID, httpRequest, Boolean.FALSE, Boolean.FALSE);
	        Map<String, Object> response = serviceResponse.getBody();
	        if (response == null || response.isEmpty()) {
	            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Transaction not found"));
	        }
	        if (response.containsKey("redirect_url")) {
	            HttpHeaders headers = new HttpHeaders();
	            headers.add("Location", response.get("redirect_url").toString());
	            return ResponseEntity.status(HttpStatus.SC_TEMPORARY_REDIRECT)
	                .headers(headers)
	                .build();
	        }
	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        return ResponseEntity.internalServerError()
	            .body(Map.of("error", "Internal server error in fetch status", "message", e.getMessage()));
	    }
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


	
   
}
