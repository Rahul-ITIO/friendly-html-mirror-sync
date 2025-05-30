package com.webapp.controller.payin.pay_105;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class Connector_105 {

    /**
     * Maps the input payload according to Connector_105 requirements
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
        

        @SuppressWarnings("unchecked")
        Map<String, Object> apc_get = payload.get("apc_get") instanceof Map ? 
                                    (Map<String, Object>) payload.get("apc_get") : 
                                    new HashMap<>();
        
        
        // Create a new map for the mapped payload
        Map<String, Object> mappedPayload = new HashMap<>();
        
        // Add connector-specific fields
        mappedPayload.put("connectorId", payload.get("connectorNumber"));
        mappedPayload.put("connectorName", payload.get("connectorName"));
        mappedPayload.put("connectorBaseUrl", payload.get("connectorBaseUrl"));
       // mappedPayload.put("connectorProcessingCredsJson1", payload.get("connectorProcessingCredsJson"));
        mappedPayload.put("connectorProdMode", payload.get("connectorProdMode"));
        mappedPayload.put("apc_get_public_key", apc_get.get("public_key"));
        
        
        // Extract gateway URL from connector configuration or use default
        String gatewayUrl = (String) payload.get("connectorProdUrl");
        if (gatewayUrl == null || gatewayUrl.isEmpty()) {
            gatewayUrl = "http://localhost:8080/gw/directapi";
        }
        
        // Add standard fields
        mappedPayload.put("gatewayUrl", gatewayUrl);
        mappedPayload.put("webhook_url", "https://aws-cc-uat.web1.one/responseDataList/?urlaction=webhook_url");
        mappedPayload.put("return_url", "https://aws-cc-uat.web1.one/responseDataList/?urlaction=return_url");
        mappedPayload.put("checkout_url", "https://aws-cc-uat.web1.one/responseDataList/?urlaction=checkout_url");
        
        // Add integration type and source
        mappedPayload.put("integration-type", "s2s");
        mappedPayload.put("source", "Java-Spring-Curl-Direct-Payment");
        
        // Add client IP (using default since we don't have the actual request)
        mappedPayload.put("bill_ip", "127.0.0.1");
        
        // Add request-specific fields if available
        if (request != null) {
            // Map any request parameters to the payload
            for (Map.Entry<String, Object> entry : ((Map<String, Object>) request).entrySet()) {
                // Skip certain keys that we've already handled
                if (!entry.getKey().equals("gatewayUrl") && 
                    !entry.getKey().equals("webhook_url") && 
                    !entry.getKey().equals("return_url") && 
                    !entry.getKey().equals("checkout_url")) {
                    mappedPayload.put(entry.getKey(), entry.getValue());
                }
            }
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
        
        System.out.println("Mapped payload in Connector_105: " + mappedPayload);
        return mappedPayload;
    }

    @GetMapping
    public void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> dataPost = new HashMap<>();

        // Extract request parameters
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            dataPost.put(paramName, paramValue);

            if (request.getParameter("qp") != null && request.getParameter("qp") != "") {
                PrintWriter out = response.getWriter();
                // Print the parameter name and value
                out.println("<p>" + paramName + " = " + paramValue + "</p>");
            }
        }

        String gatewayUrl = getOrDefault(request, "gatewayUrl", "http://localhost:8080/gw/directapi");
        String webhook_url = getOrDefault(request, "webhook_url",
                "https://aws-cc-uat.web1.one/responseDataList/?urlaction=webhook_url");
        String return_url = getOrDefault(request, "return_url",
                "https://aws-cc-uat.web1.one/responseDataList/?urlaction=return_url");
        String checkout_url = getOrDefault(request, "checkout_url",
                "https://aws-cc-uat.web1.one/responseDataList/?urlaction=checkout_url");

        try {
            // Add additional parameters
            dataPost.put("gatewayUrl", gatewayUrl);
            dataPost.put("webhook_url", webhook_url);
            dataPost.put("return_url", return_url);
            dataPost.put("checkout_url", checkout_url);

            // actual IP retrieval logic
            String clientIP = request.getHeader("X-Forwarded-For");
            if (clientIP != null && !clientIP.isEmpty()) {
                // Split the header value by commas
                String[] ipAddresses = clientIP.split(",");

                // Return the first IP after trimming any leading/trailing whitespace
                clientIP = ipAddresses[0].trim();
            } else {
                // Fallback to request's remote address if no X-Forwarded-For header
                clientIP = request.getRemoteAddr();
            }

            if (clientIP.isEmpty()) {
                clientIP = "127.0.0.1";
            }

            // Default (fixed) value * default
            dataPost.put("integration-type", "s2s");
            // dataPost.put("unique_reference", "Y");
            dataPost.put("bill_ip", clientIP);
            dataPost.put("source", "Java-Spring-Curl-Direct-Payment");
            // dataPost.put("source_url", source_url);

            // Send data to the gateway
            String jsonResponse = sendPostRequest(gatewayUrl, dataPost);

            // Parse and handle the JSON response
            handleResponse(jsonResponse, response);

        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.getWriter().write("Error processing the request: " + e.getMessage());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }

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
            os.write(postData.toString().getBytes());
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

    private void handleResponse(String jsonResponse, HttpServletResponse response) throws IOException {
        try {
            // Parse the JSON response using Jackson
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(jsonResponse);

            if (jsonNode.has("authurl")) {
                String authUrl = jsonNode.get("authurl").asText();
                // Redirect to the auth URL
                response.sendRedirect(authUrl);
            } else if (jsonNode.has("error")) {
                String error = jsonNode.get("error").asText();
                response.getWriter().write("Error in Gateway Response: " + error);
            } else if (jsonNode.has("order_status")) {
                int orderStatus = jsonNode.get("order_status").asInt();
                response.getWriter().write("Order Status: " + orderStatus);
            } else {
                response.getWriter().write("Unknown Response: " + jsonResponse);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error parsing response: " + e.getMessage());
        }
    }

    public static String getOrDefault(HttpServletRequest request, String paramName, String defaultValue) {
        String value = request.getParameter(paramName);
        return (value != null) ? value : defaultValue;
    }
}