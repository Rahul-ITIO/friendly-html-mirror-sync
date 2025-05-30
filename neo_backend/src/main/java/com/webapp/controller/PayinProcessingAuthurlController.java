package com.webapp.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;
import java.net.URL;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.service.impl.TransactionServiceImpl;
import com.webapp.utility.Base64Util;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/authurl")
@CrossOrigin
public class PayinProcessingAuthurlController {
	
	@Autowired
    private TransactionServiceImpl transactionService;
	
	// Redirect to auth_3ds URL or handle postrequest action via authurl
	@GetMapping("/{transID}")
	public ResponseEntity<Map<String, Object>> getStatusByTransIDAuth(@PathVariable String transID) {
	    Map<String, Object> response = transactionService.getTransactionDetails(transID);

	    if (response == null || response.isEmpty()) {
	        return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Transaction not found"));
	    }

	    if (response.containsKey("error_number")) {
	        return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(response);
	    }

	    // Check if order_status exists and handle accordingly
	    String orderStatus = (String) response.get("order_status");
	    if (orderStatus == null) {
	        return ResponseEntity.badRequest().body(Map.of("error", "order_status is missing"));
	    }

	    // Handle order_status = 0 (redirect to auth_3ds URL)
	    if (("0".equals(orderStatus) || "27".equals(orderStatus)) && response.get("authurl") != null) {
	        String auth3dsUrl = (String) response.get("authurl");
	        if (auth3dsUrl == null || auth3dsUrl.isEmpty()) {
	            return ResponseEntity.badRequest().body(Map.of("error", "authurl is missing or invalid"));
	        }

	        System.out.println("Authurl found: " + auth3dsUrl);

	        // Add Location header for auto-opening in the browser
	        return ResponseEntity.status(HttpStatus.SC_TEMPORARY_REDIRECT)
	                .header("Location", auth3dsUrl)
	                .build();
	    }

	    // Handle order_status = 1 or 2 (redirect to authstatus URL)
	    if ("1".equals(orderStatus) || "2".equals(orderStatus)) {
	        String authStatusUrl = (String) response.get("authstatus");
	        if (authStatusUrl == null || authStatusUrl.isEmpty()) {
	            return ResponseEntity.badRequest().body(Map.of("error", "authstatus is missing or invalid"));
	        }
	        return ResponseEntity.status(HttpStatus.SC_TEMPORARY_REDIRECT)
	                .header("Location", authStatusUrl)
	                .build();
	    }

	    // Default case: return the response as-is
	    return ResponseEntity.ok(response);
	}


	// Redirect to auth_3ds URL or handle postrequest action
	// This method processes the transaction after 3DS authentication.
	// It expects a transID as a path variable and retrieves the transaction details.
	// The method decodes the authdata and determines the action to perform:
	// - If the action is "redirect", it redirects the user to the payaddress URL.
	// - If the action is "postrequest", it sends a POST request to the payaddress URL with the transaction details.
	// - If the action is invalid or missing, it returns an appropriate error response.
	@GetMapping("/auth_3ds/{transID}")
	public ResponseEntity<Map<String, Object>> redirectAuth3ds(@PathVariable String transID) {
		Map<String, Object> response = transactionService.getTransactionDetails(transID);
		System.out.println("Auth 3DS response found: " + response);
		String authdata = "";
		String decodedAuthdata = "";
		String action = "";
		if (response == null || response.isEmpty()) {
			return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(Map.of("error", "Transaction not found"));
		}

		if (response.containsKey("error_number")) {
			return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(response);
		}

		try {

			// Extract the authdata from the response and decode it
			authdata = (String) response.get("authdata");
			if (authdata == null || authdata.isEmpty()) {
	            return ResponseEntity.badRequest().body(Map.of("error", "authdata is missing or invalid"));
	        }

			System.out.println("Authdata found: " + authdata);

			if (authdata != null && !authdata.isEmpty()) {
				try {
					decodedAuthdata = Base64Util.decodeBase64(authdata);
				} catch (Exception e) {
					System.err.println("Error decoding authdata: " + e.getMessage());
					return ResponseEntity.badRequest().body(Map.of("error", "Failed to decode authdata"));
				}
				

				@SuppressWarnings("unchecked")
				Map<String, String> authdataArray = (Map<String, String>) (Map<?, ?>) jsonde(decodedAuthdata);
				if (authdataArray != null && !authdataArray.isEmpty()) {
					response.put("authdata", authdataArray);
					System.out.println("Decoded authdata: " + decodedAuthdata);
				}

				// Extract payaddress URL from authdata
				String auth3dsUrl = authdataArray.get("payaddress");
				if (auth3dsUrl == null || auth3dsUrl.isEmpty()) {
					return ResponseEntity.badRequest().body(Map.of("error", "payaddress is missing or invalid"));
				}

				// Extract action from authdata
				 action = authdataArray.get("action");
				if (action == null || action.isEmpty()) {
					return ResponseEntity.badRequest().body(Map.of("error", "action is missing or invalid"));
				}

				// Handle redirect action
				if ("redirect".equalsIgnoreCase(action)) {
					System.out.println("Auth 3ds URL found: " + auth3dsUrl);
					return ResponseEntity.status(HttpStatus.SC_TEMPORARY_REDIRECT)
							.header("Location", auth3dsUrl)
							.build();
				}

				// Handle postrequest action
				if ("postrequest".equalsIgnoreCase(action)) {
					Map<String, String> dataPost = new HashMap<>();
					response.forEach((key, value) -> dataPost.put(key, value != null ? value.toString() : ""));
					String serverResponse = sendPostRequest(auth3dsUrl, dataPost);
					return ResponseEntity.ok(Map.of("status", "success", "serverResponse", serverResponse));
				}
			}
			
			// Handle invalid action
			return ResponseEntity.badRequest().body(Map.of("error", "Unsupported action: " + action));

		} catch (IOException e) {
			System.err.println("Error sending POST for authurl request: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(Map.of(
					"status", "error",
					"message", "Error sending POST request",
					"error", e.getMessage()));
		} catch (Exception e) {
			System.err.println("Unexpected error: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body(Map.of(
					"status", "error",
					"message", "Unexpected error occurred",
					"error", e.getMessage()));
		}
	}

	// test3dsecureauthentication URL for html UI for 3D secure authentication
	// Input enter OTP 123456 and select for Approved or Declined then submit 
	// Redirect api/status/transid/{transID}
	//@GetMapping("/test3dsecureauthentication/{transID}")
	@RequestMapping(
		value = "/test3dsecureauthentication/{transID}",
		method = {RequestMethod.POST, RequestMethod.GET, RequestMethod.PUT}
	)
	public ResponseEntity<String> test3dsecureauthentication(@PathVariable String transID, HttpServletRequest httpRequest) {
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
			

		
			// Generate dynamic auth URL
			String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName();
			if (httpRequest.getServerPort() != 80 && httpRequest.getServerPort() != 443) {
				baseUrl += ":" + httpRequest.getServerPort();
			}
			baseUrl += "/api/";

			String html = """
			<!DOCTYPE html>
			<html lang=\"en\">
			<head>
				<meta charset=\"UTF-8\">
				<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
				<title>3D Secure Authentication</title>
				<style>
					body { font-family: Arial, sans-serif; background: #f7f7f7; }
					.container { max-width: 400px; margin: 60px auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
					h2 { text-align: center; }
					.form-group { margin-bottom: 18px; }
					label { display: block; margin-bottom: 6px; }
					input[type='text'] { width: 100%%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
					.actions { display: flex; justify-content: space-between; }
					button { padding: 10px 18px; border: none; border-radius: 4px; background: #007bff; color: #fff; cursor: pointer; }
					button:hover { background: #0056b3; }
					.error { color: red; margin-bottom: 10px; text-align: center; }
				</style>
				<script>
				function validateOTP(event) {
					var otp = document.getElementById('otp').value;
					var errorDiv = document.getElementById('error-msg');
					if (otp !== '123456') {
						errorDiv.textContent = 'OTP must be 123456.';
						event.preventDefault();
						return false;
					} else {
						errorDiv.textContent = '';
						return true;
					}
				}
				</script>
			</head>
			<body>
				<div class=\"container\">
					<h2>3D Secure Authentication</h2>
					<div id=\"error-msg\" class=\"error\"></div>
					<form id=\"otpForm\" method=\"POST\" action=\"%sstatus/transid/%s\" onsubmit=\"return validateOTP(event);\">
						<div class=\"form-group\">
							<label for=\"otp\">Enter OTP (use 123456):</label>
							<input type=\"text\" id=\"otp\" name=\"otp\" required maxlength=\"6\" />
						</div>
						<div class=\"form-group\">
							<label>Result:</label>
							<div class=\"actions\">
								<button type=\"submit\" name=\"test_auth\" value=\"approved\">Approved</button>
								<button type=\"submit\" name=\"test_auth\" value=\"declined\">Declined</button>
							</div>
						</div>
					</form>
				</div>
			</body>
			</html>
			""".formatted(baseUrl,transID);
			return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
		} catch (Exception e) {
			System.err.println("Error processing transID: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body("Error processing transID");
		}
	}


	// Authstatus URL for s2s
	@GetMapping("/s2s/{transID}")
	public ResponseEntity<Map<String, Object>> getStatusByTransIDs2s(@PathVariable String transID) {
	    Map<String, Object> response = transactionService.getTransactionDetails(transID);

	    if (response.containsKey("error_number")) {
	        return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(response);
	    }

	    return ResponseEntity.ok(response);
	}

	// Method to send a POST request to the specified URL with the provided data
	// It handles the connection, sends the data, and returns the server response.
	// It also handles HTTP response codes and throws an IOException for errors.
	// The method takes a URL string and a map of data to be sent in the POST request.
	// It returns the server response as a string.
	private String sendPostRequest(String urlStr, Map<String, String> dataPost) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);

        // Build POST data string
        StringBuilder postData = new StringBuilder();
        for (Map.Entry<String, String> entry : dataPost.entrySet()) {
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

	
   
}
