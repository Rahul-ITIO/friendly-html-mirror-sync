package com.webapp.service;

import org.springframework.stereotype.Service;
import com.webapp.model.CheckoutRequest;
import java.util.HashMap;
import java.util.Map;

@Service
public class CheckoutService {
    
    public Map<String, Object> processCheckout(CheckoutRequest request) {
        Map<String, Object> payload = new HashMap<>();
        
        // Set integration type for checkout
        payload.put("integration-type", "checkout");
        payload.put("bill_amt", request.getAmount());
        payload.put("bill_currency", request.getCurrency());
        payload.put("fullname", request.getFullname());
        payload.put("bill_email", request.getBill_email());
        payload.put("bill_phone", request.getBill_phone());
        payload.put("bill_address", request.getBill_address());
        payload.put("bill_city", request.getBill_city());
        payload.put("bill_country", request.getBill_country());
        payload.put("bill_state", request.getBill_state());
        payload.put("bill_zip", request.getBill_zip());
        
        // Set default URLs
        payload.put("return_url", "http://localhost:3000/payment/status");
        payload.put("webhook_url", "http://localhost:3000/api/webhook");
        payload.put("source_url", "http://localhost:3000/checkout");
        
        return payload;
    }
}