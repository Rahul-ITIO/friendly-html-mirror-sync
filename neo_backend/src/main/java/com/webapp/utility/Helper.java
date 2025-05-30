//Generate a Random Alphanumeric Transaction ID: The method creates a random string of 16 characters composed of uppercase letters, lowercase letters, and digits. This string can be used as a unique identifier for transactions or other entities in a system
package com.webapp.utility;

public class Helper {
	
	public static String getAlphaNumericTransactionId()
    {
        // Define the characters that can be used in the transaction ID
        String AlphaNumericString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                    + "0123456789"
                                    + "abcdefghijklmnopqrstuvxyz";
	    
      // Create a StringBuilder to build the transaction ID
        StringBuilder sb = new StringBuilder(16);
	    
     // Loop to generate 16 random characters
        for (int i = 0; i < 16; i++) {
          // Generate a random index to select a character from AlphaNumericString
            int index
                = (int)(AlphaNumericString.length()
                        * Math.random());
  
            sb.append(AlphaNumericString
                          .charAt(index));
        }
  
        return sb.toString().toUpperCase();
    }

}
