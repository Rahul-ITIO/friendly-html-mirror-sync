package com.webapp.controller.payin.pay_100;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

public class Connector_100 {

    /**
     * Maps the input payload according to Connector_100 requirements
     * @param payloadObj The payload object (a Map containing connectorData and request)
     * @return The mapped payload
     */
    public Object mapPayload(Object payloadObj) {
        if (!(payloadObj instanceof Map)) {
            throw new IllegalArgumentException("Payload must be a Map");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) payloadObj;
        
        @SuppressWarnings("unchecked")
        Map<String, Object> request = payload.get("request") instanceof Map ? 
                                    (Map<String, Object>) payload.get("request") : 
                                    new HashMap<>();

        // Get credentials from payload
        @SuppressWarnings("unchecked")
        Map<String, Object> apc_get = payload.get("apc_get") instanceof Map ? 
                                    (Map<String, Object>) payload.get("apc_get") : 
                                    new HashMap<>();
        
        // Create a new map for the mapped payload
        Map<String, Object> mappedPayload = new HashMap<>();

        // Add credentials to mapped payload
        //mappedPayload.put("apc_get", apc_get);

        // Add request-specific fields if available
        if (request != null) {
            // Map any request parameters to the payload
            for (Map.Entry<String, Object> entry : request.entrySet()) {
                mappedPayload.put(entry.getKey(), entry.getValue());
            }
        }
        
        if (payload.containsKey("total_payment")) {
            mappedPayload.put("bill_amt", payload.get("total_payment"));
        }
        if (payload.containsKey("orderCurrency")) {
            mappedPayload.put("bill_currency", payload.get("orderCurrency"));
        }

        // Add credentials specific fields from apc_get of connectors and terminal 
        mappedPayload.put("connectorId", payload.get("connectorNumber"));
        mappedPayload.put("connectorName", payload.get("connectorName"));
        mappedPayload.put("connectorBaseUrl", payload.get("connectorBaseUrl"));
        mappedPayload.put("reference", payload.get("transID").toString());
       
        if (apc_get.containsKey("public_key")) {
            mappedPayload.put("apc_get_public_key", apc_get.get("public_key"));
            mappedPayload.put("public_key", apc_get.get("public_key"));
        }
        if (apc_get.containsKey("terNO")) {
            mappedPayload.put("terNO", apc_get.get("terNO").toString());
        }
        
        
       
        
        // Extract gateway URL from connector configuration or use default
        String gatewayUrl = (String) payload.get("connectorProdUrl");
        if (gatewayUrl == null || gatewayUrl.isEmpty()) {
            gatewayUrl = "https://default-payment-gateway.com/api";
        }
        mappedPayload.put("gatewayUrl", gatewayUrl);
        
        // Add webhook and return URLs if available
        if (request != null) {
	        if (request.containsKey("webhook_url")) {
	            mappedPayload.put("webhook_url", request.get("webhook_url"));
	        }
	        
            /*
	        if (request.containsKey("total_payment")) {
	            mappedPayload.put("bill_amt", request.get("total_payment"));
	        }
	        if (request.containsKey("orderCurrency")) {
	            mappedPayload.put("bill_currency", request.get("orderCurrency"));
	        }
            */
	        
	        if (request.containsKey("return_url")) {
	            mappedPayload.put("return_url", request.get("return_url"));
	        }
	        
	        if (request.containsKey("checkout_url")) {
	            mappedPayload.put("checkout_url", request.get("checkout_url"));
	        }

	        if (request.containsKey("bill_ip")) {
	            mappedPayload.put("bill_ip", request.get("bill_ip"));
	        }
            else {
                mappedPayload.put("bill_ip", "127.0.0.1");   
            }
        }
        
        // Add integration type and source
        mappedPayload.put("integration-type", "s2s");
        mappedPayload.put("source", "Java-Spring-Curl-Direct-Payment");
        
        
        try {
            // Process the payment request
            Map<String, Object> processResult = processPaymentRequest(mappedPayload);
            
            // Add the process result to the mapped payload
            mappedPayload.putAll(processResult);
            
        } catch (Exception e) {
            mappedPayload.put("status", "error");
            mappedPayload.put("message", "Failed to process payment: " + e.getMessage());
            e.printStackTrace();
        }

        // Mask sensitive data
        if (mappedPayload.containsKey("ccno")) {
            String ccno = (String) mappedPayload.get("ccno");
            if (ccno.length() > 10) {
                ccno = ccno.substring(0, 6) + "XXXXXX" + ccno.substring(ccno.length() - 4);
            }
            else if (ccno.length() > 4) {
                ccno = "**** **** **** " + ccno.substring(ccno.length() - 4);
            }
            else {
                ccno = "****";
            }
            mappedPayload.put("ccno", ccno);
        }
        
        if (mappedPayload.containsKey("ccvv")) {
            mappedPayload.put("ccvv", "XXX");
        }
        
        if (mappedPayload.containsKey("month")) {
            mappedPayload.put("month", "XX"); // Mask month
        }
        
        if (mappedPayload.containsKey("year")) {
            mappedPayload.put("year", "XX"); // Mask year
        }

        // Return the mapped payload
        
        System.out.println("Mapped payload in Connector_100: " + mappedPayload);
        return mappedPayload;
    }

    /**
     * Core processing logic that can be used by both the endpoint and mapPayload
     */
    private Map<String, Object> processPaymentRequest(Map<String, Object> requestData) throws IOException {
        Map<String, String> dataPost = new HashMap<>();
        Map<String, Object> result = new HashMap<>();
        
        // Extract request parameters from the map
        for (Map.Entry<String, Object> entry : requestData.entrySet()) {
            if (entry.getValue() != null) {
                dataPost.put(entry.getKey(), entry.getValue().toString());
            }
        }
        
        // Process the data
        try {
           
            // Use credentials in your API calls
            String apiUrl = requestData.containsKey("gatewayUrl") ? 
                requestData.get("gatewayUrl").toString() : 
                "https://default-payment-gateway.com/api";
                
            // Make the API call
            String apiResponse = sendPostRequest(apiUrl, dataPost);
            
            // Parse the response from json 
            Map<String, Object> parsedResponse = parseResponse(apiResponse);
            
            // Add response to result ####  return final response  ###
            result.put("gateway_response", parsedResponse);
            
            // Extract authdata and authurl from parsedResponse
            if (parsedResponse.containsKey("authdata")) {
               // result.put("connector_authdata", parsedResponse.get("authdata"));
            }

            if (parsedResponse.containsKey("authurl")) {
                result.put("connector_authurl", parsedResponse.get("authurl"));
            }

            if (parsedResponse.containsKey("transID")) {
                result.put("connector_ref", parsedResponse.get("transID"));
            }

            // Extract authdata and authurl from parsedResponse
            if (parsedResponse.containsKey("authdata")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> authdata = (Map<String, Object>) parsedResponse.get("authdata");
                result.put("connector_authdata", authdata);
                
                // Extract payaddress from authdata
                if (authdata.containsKey("payaddress")) {
                    result.put("connector_payaddress", authdata.get("payaddress"));
                }
            }
            
            result.put("connector_status", "connector_api_success");
            result.put("connector_raw_response", apiResponse);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Error processing payment via Connector_100 : " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }

    /**
     * Parse the API response
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseResponse(String response) {
        // Implement response parsing logic
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(response, Map.class);
        } catch (Exception e) {
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "Failed to parse response: " + e.getMessage());
            errorMap.put("raw", response);
            return errorMap;
        }
    }

    

    /**
     * Sends a POST request to the specified URL with the provided data
     */
    private String sendPostRequest(String urlStr, Map<String, String> dataPost) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);

        // Build POST data string
        StringBuilder postData = new StringBuilder();
        for (Map.Entry<String, String> entry : dataPost.entrySet()) {
            if (postData.length() != 0)
                postData.append('&');
            postData.append(entry.getKey()).append('=').append(entry.getValue());
        }

        // Send data
        try (OutputStream os = conn.getOutputStream()) {
            os.write(postData.toString().getBytes("UTF-8"));
            os.flush();
        }

        // Read response
        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
            String responseLine;
            StringBuilder responseBuilder = new StringBuilder();
            while ((responseLine = in.readLine()) != null) {
                responseBuilder.append(responseLine);
            }
            return responseBuilder.toString();
        } catch (IOException e) {
            // Try to read from error stream if available
            try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getErrorStream(), "UTF-8"))) {
                String responseLine;
                StringBuilder responseBuilder = new StringBuilder();
                while ((responseLine = in.readLine()) != null) {
                    responseBuilder.append(responseLine);
                }
                return responseBuilder.toString();
            } catch (Exception ex) {
                throw e; // If we can't read from error stream, throw the original exception
            }
        } finally {
            conn.disconnect();
        }
    }
}