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

public class Refund_100 {

    /**
     * Maps the input payload according to Refund_100 requirements
     * @param payloadObj The payload object (a Map containing connectorData and request)
     * @return The mapped payload
     */
    public Object mapPayload(Object payloadObj) {
        if (!(payloadObj instanceof Map)) {
            throw new IllegalArgumentException("Status Payload must be a Map");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) payloadObj;

        // Get credentials from payload
        @SuppressWarnings("unchecked")
        Map<String, Object> apc_get = payload.get("apc_get") instanceof Map ? 
                                    (Map<String, Object>) payload.get("apc_get") : 
                                    new HashMap<>();
        
        // Create a new map for the mapped payload
        Map<String, Object> mappedPayload = new HashMap<>();

        
        
        // Add credentials specific fields from apc_get of connectors and terminal 
        mappedPayload.put("transID", payload.get("connectorRef"));
       // mappedPayload.put("connectorBaseUrl", payload.get("connectorBaseUrl"));
       
        String public_key = "";

        if (apc_get.containsKey("public_key")) {
            public_key = (String) apc_get.get("public_key");
            mappedPayload.put("public_key", apc_get.get("public_key"));
        }
        
        
       
        
        // Extract gateway URL from connector configuration or use default
        String refundGatewayUrl = (String) payload.get("connectorRefundUrl");
        if (refundGatewayUrl == null || refundGatewayUrl.isEmpty()) {
            refundGatewayUrl = "https://ipg.i15.tech/refund";
        }
        refundGatewayUrl = refundGatewayUrl+"?transID="+payload.get("connectorRef")+"&public_key="+public_key+"&bill_amt="+payload.get("bankProcessingAmount");

        mappedPayload.put("gatewayUrl", refundGatewayUrl);
        
       
        
        
        try {
            // Process the status request
            Map<String, Object> processResult = processStatusRequest(mappedPayload);
            
            // Add the process result to the mapped payload
            mappedPayload.putAll(processResult);
            
        } catch (Exception e) {
            mappedPayload.put("status", "error");
            mappedPayload.put("message", "Failed to process refund: " + e.getMessage());
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
        
        System.out.println("Mapped payload in Refund_100: " + mappedPayload);
        return mappedPayload;
    }

    /**
     * Core processing logic that can be used by both the endpoint and mapPayload
     */
    private Map<String, Object> processStatusRequest(Map<String, Object> requestData) throws IOException {
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
                "https://ipg.i15.tech/refund";
                
                dataPost.remove(apiUrl);

            // Make the API call
            String apiResponse = sendPostRequest(apiUrl, dataPost);
            
            // Parse the response from json 
            Map<String, Object> parsedResponse = parseResponse(apiResponse);
            
            // Add response to result ####  return final response  ###
            result.put("gateway_response", parsedResponse);
            
            // Extract status,order_status,acquirer_status_code  from parsedResponse
            
            if (parsedResponse.containsKey("order_status")) {
                //result.put("connector_status_code", parsedResponse.get("order_status").toString());
            }
            
            
           

            String connectorResponseMsg = "";

            if (parsedResponse.get("response") != null && !parsedResponse.get("response").toString().trim().isEmpty()) {
                connectorResponseMsg = parsedResponse.get("response").toString();
            } else if (parsedResponse.get("Message") != null && !parsedResponse.get("Message").toString().trim().isEmpty()) {
                connectorResponseMsg = parsedResponse.get("Message").toString();
            } else if (parsedResponse.get("status") != null
                    && !parsedResponse.get("status").toString().trim().isEmpty()) {
                connectorResponseMsg = parsedResponse.get("status").toString();
            } else {
                connectorResponseMsg = "No response available";
            }

            result.put("connector_response_msg", connectorResponseMsg);
           
            
            if (parsedResponse.containsKey("bill_amt")) {
                result.put("connector_response_amount", parsedResponse.get("bill_amt").toString());
            }
            
            if (parsedResponse.containsKey("transID")) {
                result.put("connector_response_ref", parsedResponse.get("transID"));
            }
            
            result.put("connector_status", "connector_api_success");
            result.put("status_connector_raw_response", apiResponse);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Error processing status via Refund_100 : " + e.getMessage());
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