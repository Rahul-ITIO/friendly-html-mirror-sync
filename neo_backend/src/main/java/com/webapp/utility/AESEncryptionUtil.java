package com.webapp.utility;

import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;


public class AESEncryptionUtil {
    private static final String ALGORITHM = "AES";
    private static final String SECRET_KEY = "cejXt5sR1ZUSck6AjxRwPvhhZdXkwXcv"; // Must be 16 bytes

    public static String encrypt(String data) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(), ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedBytes = cipher.doFinal(data.getBytes());

        // URL-safe Base64 encoding and removing padding
        return Base64.getUrlEncoder().encodeToString(encryptedBytes).replaceAll("=", "");
    }

    public static String decrypt(String encryptedData) throws Exception {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return null; // Return null or a placeholder instead of throwing an error
        }
        
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(), ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        // Add padding before decoding (if needed)
        String paddedData = addPadding(encryptedData);
        byte[] decryptedBytes = cipher.doFinal(Base64.getUrlDecoder().decode(paddedData));
        return new String(decryptedBytes);
    }

    // Adds missing padding (`=`) to Base64 string before decoding
    private static String addPadding(String data) {
        int paddingCount = (4 - (data.length() % 4)) % 4;
        return data + "=".repeat(paddingCount);
    }

    
}
