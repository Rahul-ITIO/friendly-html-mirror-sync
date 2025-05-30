package com.webapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.webapp.service.CheckoutService;
import com.webapp.model.CheckoutRequest;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class CheckoutController {
    
    @Autowired
    private CheckoutService checkoutService;
    
    @RequestMapping(value = {"/checkout", "/api/checkout"}, method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<Map<String, Object>> processCheckout(@RequestBody(required = false) CheckoutRequest request) {
        if (request == null) {
            request = new CheckoutRequest(); // Create default request for GET
        }
        Map<String, Object> response = checkoutService.processCheckout(request);
        return ResponseEntity.ok(response);
    }
}