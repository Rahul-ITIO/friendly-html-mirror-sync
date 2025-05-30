//The TransactionIdGenerator class provides various methods for generating unique identifiers, passwords, and reference IDs. Each method serves a different purpose and uses different techniques to ensure uniqueness and randomness.

package com.webapp.utility;

import java.util.Random;
import java.util.UUID;

public class TransactionIdGenerator {
	/**
	 * Generates a unique 16-character alphanumeric transaction ID.
	 * 
	 * @return A 16-character alphanumeric transaction ID.
	 */
	
	public static String generate() {
		UUID uuid = UUID.randomUUID();
        String uuidHex = uuid.toString().replace("-", ""); // Remove hyphens
        String uuid16Digits = uuidHex.substring(0, 16); // Take the first 16 characters
        
        return uuid16Digits; // Return the 16-character ID
    }
	
	/**
	 * Generates a unique 9-character account ID.
	 * 
	 * @return A 9-character alphanumeric account ID.
	 */
	public static String generateAccountId() {
		UUID uuid = UUID.randomUUID();
        String uuidHex = uuid.toString().replace("-", ""); // Remove hyphens
        String accountId = uuidHex.substring(0, 9); // Take the first 16 characters
        
        return accountId;
    }

	/**
	 * Generates a secure password with a fixed prefix.
	 * 
	 * @return A password with the format "Bank@XXXX", where XXXX is a random 4-character string.
	 */
	
	public static String generatePassword() {
		UUID uuid = UUID.randomUUID();
        String uuidHex = uuid.toString().replace("-", ""); // Remove hyphens
        String random = uuidHex.substring(0, 4); // Take the first 16 characters
        
        String password = "Bank@"+random;
        
        return password;
    }

	/**
	 * Generates a unique 10-digit transaction reference ID.
	 * 
	 * @return A 10-digit transaction reference ID.
	 */
	public static String generateUniqueTransactionRefId() {
        // Generate a random number between 1000000000 and 9999999999
        Random random = new Random();
        long randomNum = random.nextInt(900000000) + 1000000000;
        
        // Get current timestamp
        long timestamp = System.currentTimeMillis() % 1000000000;
        
        // Combine timestamp and random number
        String uniqueId = String.valueOf(timestamp) + String.valueOf(randomNum);
        
        // Trim or pad with zeros to make sure the ID is 10 digits long
        if (uniqueId.length() > 10) {
            uniqueId = uniqueId.substring(0, 10);
        } else if (uniqueId.length() < 10) {
            while (uniqueId.length() < 10) {
                uniqueId = "0" + uniqueId;
            }
        }
        
        return uniqueId;
    }

}
