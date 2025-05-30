package com.webapp.entity;

import java.util.*;
import java.util.HashMap;
import java.util.Map;

public class CardValidatorUtils {

    /**
     * A map to store test card numbers and their corresponding enrollment types.
     * The key is the card number, and the value is the enrollment type.
     */
    // Test card numbers and their enrollment types
    // 3DS, 25, 26, 9
    // Mastercard, Visa, Diners Club, JCB
    private static final Map<String, String> testCardEnrollmentMap = new HashMap<>();

    static {

        // 9 -> Test for 3DS
        // 25 -> Test Approved
        // 26 -> Test Declined

        // Mastercard
        testCardEnrollmentMap.put("5111111111111111", "3DS");
        testCardEnrollmentMap.put("5123450000000008", "25");
        testCardEnrollmentMap.put("5555229999997722", "26");
        testCardEnrollmentMap.put("5555229999999975", "9");

        // Visa
        testCardEnrollmentMap.put("4111111111111111", "3DS");
        testCardEnrollmentMap.put("4012000033330026", "25");
        testCardEnrollmentMap.put("4043409999991437", "26");
        testCardEnrollmentMap.put("4029939999997636", "9");

        // Diners Club
        testCardEnrollmentMap.put("30000000000000", "3DS");
        testCardEnrollmentMap.put("30123400000000", "25");
        testCardEnrollmentMap.put("36259600000012", "26");

        // JCB
        testCardEnrollmentMap.put("35000000000000", "3DS");
        testCardEnrollmentMap.put("3528000000000007", "25");
        testCardEnrollmentMap.put("3528111100000001", "26");
    }

    /**
     * Returns a map with card type and enrollment type based on the card number.
     *
     * @param cardNumber The card number to analyze.
     * @return A map containing card type and enrollment type.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, String> getCardDetails(String cardNumber) {
        Map<String, String> result = new HashMap<>();

        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            result.put("cardType", "Unknown");
            result.put("enrollmentType", "Unknown");
            return result;
        }

        // Remove spaces and dashes
        cardNumber = cardNumber.replaceAll("[\\s-]", "").trim();

        String enrollmentType = testCardEnrollmentMap.getOrDefault(cardNumber, "Live");
        String cardType = detectCardType(cardNumber);

        result.put("cardType", cardType);
        result.put("enrollmentType", enrollmentType);
        return result;
    }

    /**
     * Validates a card number and returns a map with validation results.
     *
     * @param cardNumber The card number to validate.
     * @return A map containing validation results.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> validateAllCard(String cardNumber) {
        Map<String, Object> result = new HashMap<>();
    
        if (cardNumber == null || cardNumber.trim().isEmpty()) {
            result.put("valid", false);
            result.put("message", "Card number is required");
            return result;
        }
    
        cardNumber = cardNumber.replaceAll("\\s+", "").trim();
    
        String cardType = detectCardType(cardNumber);
        String enrollmentType = testCardEnrollmentMap.get(cardNumber); // null if not test
    
        result.put("cardNumber", cardNumber);
        result.put("cardType", cardType);
    
        if (enrollmentType != null) {
            // ✅ Test card
            String message = "";
            if (enrollmentType.equals("3DS")) {
                message = "3DS Authentication";
            } else if (enrollmentType.equals("25")) {
                message = "Approved";
            } else if (enrollmentType.equals("26")) {
                message = "Declined";
            } else if (enrollmentType.equals("9")) {
                message = "Unknown";
            }

            result.put("enrollmentType", enrollmentType);
            result.put("valid", true);
            result.put("validLuhn", true); // assume all test cards pass
            result.put("message", message);
        } else {
            // ✅ Not a test card → use Luhn for live cards
            boolean luhnValid = isValidLuhn(cardNumber);
            result.put("enrollmentType", "LIVE");
            result.put("validLuhn", luhnValid);
            result.put("valid", luhnValid);
            result.put("message", luhnValid ? "Live card is valid (Luhn passed)" : "Live card is invalid (Luhn failed)");
        }
    
        return result;
    }
    /**
     * Validates a card number using the Luhn algorithm.
     *
     * @param cardNumber The card number to validate.
     * @return true if the card number is valid, false otherwise.
     */
    public static boolean isValidLuhn(String cardNumber) {
        // Remove spaces and dashes
        cardNumber = cardNumber.replaceAll("[\\s-]", "").trim();

        // Check if the card number is numeric and has a valid length
        if (!cardNumber.matches("\\d{13,19}")) {
            return false;
        }

        int sum = 0;
        boolean alternate = false;

        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Integer.parseInt(cardNumber.substring(i, i + 1));

            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }

            sum += n;
            alternate = !alternate;
        }
        return (sum % 10 == 0);
    }

    /**
    Visa: starts with 4, 13 or 16 digits.
    Mastercard: starts with 51–55, total 16 digits.
    Amex: starts with 34 or 37, 15 digits.
    RuPay: starts with 6, 13–16 digits.
    Discover: starts with 6011 or 65 + 12 digits.
    JCB: starts with 35 or 2131/1800, 15–16 digits.
    Diners: starts with 300–305, 36 or 38 + 11 digits.
    */
    private static String detectCardType(String cardNumber) {
         // Remove spaces and dashes
         cardNumber = cardNumber.replaceAll("[\\s-]", "").trim();

        if (cardNumber.matches("^4[0-9]{12}(?:[0-9]{3})?$")) {
            return "Visa";
        } else if (cardNumber.matches("^5[1-5][0-9]{14}$")) {
            return "Mastercard";
        } else if (cardNumber.matches("^3[47][0-9]{13}$")) {
            return "American Express";
        } else if (cardNumber.matches("^6[0-9]{12}(?:[0-9]{3})?$")) {
            return "RuPay";
        } else if (cardNumber.matches("^6(?:011|5[0-9]{2})[0-9]{12}$")) {
            return "Discover";
        } else if (cardNumber.matches("^(3[0-9]{4}|2131|1800)[0-9]{11}$")) {
            return "JCB";
        } else if (cardNumber.matches("^3(0[0-5]|[68][0-9])[0-9]{11}$")) {
            return "Diners Club";
        }
        return "Unknown";
    }

    // Example usage
    // Demo usage (can be called from controller)
    public static String demoValidateCard(String ccno) {

        if(ccno == null || ccno.trim().isEmpty()) {
            ccno =  "4111111111111111"; // Default test card number
        }

        ccno = ccno.replaceAll("[\\s-]", "").trim();

        Map<String, String> result = getCardDetails(ccno);
        System.out.println("Card Type: " + result.get("cardType"));
        System.out.println("Enrollment Type: " + result.get("enrollmentType"));

        Map<String, Object> info = validateAllCard(ccno);

        System.out.println("Card Number: " + info.get("cardNumber"));
        System.out.println("Card Type: " + info.get("cardType"));
        System.out.println("3DS Status: " + info.get("enrollmentType"));
        System.out.println("Luhn Valid: " + info.get("validLuhn"));
        System.out.println("Final Validation: " + info.get("valid"));
        System.out.println("Message: " + info.get("message"));

        /*
         * Output:
            Card Number: 4111111111111111
            Card Type: Visa
            3DS Status: 3DS
            Luhn Valid: true
            Final Validation: true
            Message: Card is valid
         */

        return "Card Type: " + result.get("cardType") + "\n" +
                "Enrollment Type: " + result.get("enrollmentType") + "\n" +
                "Card Number: " + info.get("cardNumber") + "\n" +
                "3DS Status: " + info.get("enrollmentType") + "\n" +
                "Luhn Valid: " + info.get("validLuhn") + "\n" +
                "Final Validation: " + info.get("valid") + "\n" +
                "Message: " + info.get("message");
    }
}
