package com.webapp.controller;

public class CommonPaymentStatus {

    /**
     * Returns a status description based on the provided status code.
     * @param statusCode The status code to check.
     * @return A string containing the status description.
     */
    public static String getStatusDescription(String statusCode) {
        switch (statusCode) {
            /* 
            // calcalulation of status code
	        case "0": return "Pending";
	        case "1": return "Approved";
	        case "2": return "Declined";
	        case "3": return "Refunded";
	        case "5": return "Chargeback";
	        case "7": return "Reversed";
	        case "8": return "Refund Pending";
	        case "9": return "Test";
	        case "10": return "Scrubbed";
            */
            
            // 🟡 1X – Pending / In-Progress
            case "11": return "Initialized - Awaiting Customer Action";
            case "12": return "Awaiting OTP / 3DS Authentication";
            case "13": return "Awaiting Network Authorization";
            case "14": return "Awaiting Blockchain Confirmations";
            case "15": return "Awaiting Bank Response";
            case "16": return "Queued - Processing Delayed";
            case "17": return "Awaiting Manual Review";
            case "18": return "Awaiting KYC or Compliance Clearance";
            case "19": return "Awaiting Merchant Approval";

            // 🟢 2X - Authorized / Approved / Captured
            case "21": return "Authorized - Awaiting Capture";
            case "22": return "Captured - Payment Completed";
            case "23": return "Settled - Funds Transferred to Merchant";
            case "24": return "Approved - One-Time Payment Complete";
            case "25": return "Captured - Awaiting Settlement";
            case "26": return "Recurring Setup Successful";
            case "27": return "Recurring Payment Processed";
            case "28": return "Verified - Crypto Confirmed";
            case "29": return "Local/QR Payment Completed";

            // 🔁 3X - Refund / Return / Reversal
            case "31": return "Refund Requested";
            case "32": return "Refund Processed - Awaiting Bank";
            case "33": return "Refund Completed";
            case "34": return "Partial Refund Completed";
            case "35": return "Refund Failed";
            case "36": return "Crypto Refund Sent";
            case "37": return "Return - Payment Reversed by Issuer";
            case "38": return "Refund Auto-Issued (Timeout/No Delivery)";
            case "39": return "Refund Rejected - Not Eligible";

            // 🔴 4X - Declined / Failed
            case "41": return "Declined - Insufficient Funds";
            case "42": return "Declined - Card/Method Expired";
            case "43": return "Declined - Invalid Details / CVV / OTP";
            case "44": return "Declined - Suspected Fraud";
            case "45": return "Declined - Issuer or Network Rejected";
            case "46": return "Failed - Bank/Network Error";
            case "47": return "Failed - Timeout or Disconnected";
            case "48": return "Failed - Invalid Crypto Address";
            case "49": return "Failed - Unsupported Method / Region";

            // ⚖️ 5X - Chargeback & Disputes
            case "51": return "Chargeback Initiated";
            case "52": return "Chargeback Accepted";
            case "53": return "Chargeback Under Review";
            case "54": return "Chargeback Reversed (Merchant Won)";
            case "55": return "Chargeback Closed (Customer Won)";
            case "56": return "Evidence Submitted - Pending Decision";
            case "57": return "Dispute Filed by Customer";
            case "58": return "Dispute Resolved in Customer’s Favor";
            case "59": return "Dispute Resolved in Merchant’s Favor";

            // ⚪ 6X - Cancelled / Voided / Expired
            case "61": return "Cancelled by Customer";
            case "62": return "Cancelled by Merchant";
            case "63": return "Cancelled - Fraud Flag";
            case "64": return "Cancelled - Duplicate Transaction";
            case "65": return "Expired - No Customer Action";
            case "66": return "Expired - Session Timed Out";
            case "67": return "Voided - Not Captured";
            case "68": return "Cancelled - System Error";
            case "69": return "Cancelled - Risk Detected";
            case "6A": return "Cancelled - Internal Risk Policy";
            case "6B": return "Cancelled - Merchant Risk Policy";
            case "6C": return "Cancelled - Compliance / Regulatory Risk";

            // 💸 7X - Payout / Withdrawal
            case "71": return "Payout Requested";
            case "72": return "Payout In-Progress";
            case "73": return "Payout Completed";
            case "74": return "Payout Failed - Bank Error";
            case "75": return "Payout Reversed";
            case "76": return "Payout Cancelled";
            case "77": return "Scheduled Payout";
            case "78": return "Payout On Hold - Compliance";
            case "79": return "Payout Returned - Invalid Details";

            // 🌐 8X - System / Technical / Validation Errors
            case "81": return "Invalid API Key / Signature";
            case "82": return "Validation Error - Missing Fields";
            case "83": return "Method Not Supported";
            case "84": return "Gateway Timeout";
            case "85": return "System Error - Try Again";
            case "86": return "Duplicate Request Detected";
            case "87": return "Rate Limited / Throttled";
            case "88": return "Invalid Payment Configuration";
            case "89": return "Invalid Currency or Conversion Issue";

            // 🔐 9X - Compliance / Risk / AML / KYC
            case "91": return "KYC Verification Required";
            case "92": return "KYC Verification In Progress";
            case "93": return "KYC Approved";
            case "94": return "KYB (Business) Incomplete";
            case "95": return "Transaction Flagged - High-Risk Country";
            case "96": return "AML Triggered - On Hold";
            case "97": return "Blacklisted - Blocked";
            case "98": return "Sanctioned Entity Match";
            case "99": return "Blocked - Regulatory Violation";

            default: return "Unknown or Pending Status";
        }
    }

    /**
     * Returns a status description with a color code based on the leading digit of the status code.
     * @param statusCode The status code to check.
     * @return A string containing the status description with a color code.
     */
    public static String getStatusDescriptionWithColor(String statusCode) {
        String desc = getStatusDescription(statusCode);
        if (statusCode == null || statusCode.length() < 1) return "🟡 Unknown Status";
        char leadingDigit = statusCode.charAt(0);

        switch (leadingDigit) {
            case '1': return "🟡 " + desc; // 🟡 1X – Pending / In-Progress
            case '2': return "🟢 " + desc; // 🟢 2X – Authorized / Approved / Captured
            case '3': return "🔁 " + desc; // 🔁 3X – Refund / Return / Reversal
            case '4': return "🔴 " + desc; // 🔴 4X – Declined / Failed
            case '5': return "⚖️ " + desc; // ⚖️ 5X – Chargeback & Disputes
            case '6': return "⚪ " + desc; // ⚪ 6X – Cancelled / Voided / Expired
            case '7': return "💸 " + desc; // 💸 7X – Payout / Withdrawal
            case '8': return "🌐 " + desc; // 🌐 8X – System / Technical / Validation Errors
            case '9': return "🔐 " + desc; // 🔐 9X – Compliance / Risk / AML / KYC
            default:  return "🟡 " + desc; // 🟡 1X – Pending / In-Progress
        }
    }
}

