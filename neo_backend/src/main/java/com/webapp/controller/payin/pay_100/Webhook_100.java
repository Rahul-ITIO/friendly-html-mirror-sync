package com.webapp.controller.payin.pay_100;

import java.util.HashMap;
import java.util.Map;

public class Webhook_100 {

    /**
     * Maps the input payload according to Webhook_100 requirements
     * @param payloadObj The payload object (a Map containing connectorData and request)
     * @return The mapped payload
     */
    public Object mapPayload(Object payloadObj) {
        if (!(payloadObj instanceof Map)) {
            throw new IllegalArgumentException("Status Payload must be a Map");
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) payloadObj;

        // Create a new map for the mapped payload
        Map<String, Object> mappedPayload = new HashMap<>();

        if(payload.get("cyberId")!= null) {
            mappedPayload.put("transID", payload.get("cyberId"));
        } 
        else if(payload.get("reference")!= null) {
            mappedPayload.put("transID", payload.get("reference"));
        }
        else if(payload.get("transID")!= null) {
            mappedPayload.put("transID", payload.get("transID"));
        } 
        
        // Return the mapped payload
        
        System.out.println("Mapped payload in Webhook_100: " + mappedPayload);
        return mappedPayload;
    }

}