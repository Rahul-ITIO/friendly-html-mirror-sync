package com.webapp.utility;

import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

//https://dev.java/learn/security/intro/

public class AES256Util {
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
    //8TQ1WYuSRfiuRjGWnjFQVNcsXA4UV+MDgQRi93xiZV4= fZaYtAkplFPx+K5tb7voG1bwZM6TqhuJ9rp0IuwiiMw=
    private static final String SECRET_KEY = "cejXt5sR1ZUSck6AjxRwPvhhZdXkwXcv"; // 16, 24, or 32-byte key

    // Generate AES-256 Key (Run this once and store securely)
    public static String generateKey() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
        keyGenerator.init(256, new SecureRandom()); 
        SecretKey secretKey = keyGenerator.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }

    // Encrypt data
    public static String encrypt(String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), ALGORITHM);
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encryptedBytes = cipher.doFinal(data.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    // Decrypt data
    public static String decrypt(String encryptedData) throws Exception {
        if (encryptedData == null || encryptedData.isEmpty()) {
            return null;
        }

        try {
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes("UTF-8"), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            // Add padding if necessary
            String paddedData = encryptedData;
            int padding = paddedData.length() % 4;
            if (padding > 0) {
                paddedData += "====".substring(padding);
            }
            
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(paddedData));
            return new String(decryptedBytes, "UTF-8");
        } catch (IllegalArgumentException e) {
            throw new Exception("Invalid Base64 string: " + e.getMessage());
        }
    }
}
