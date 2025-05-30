package com.webapp.controller;

import com.webapp.entity.BlackList;
import com.webapp.service.BlackListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/blacklist")
//@CrossOrigin(origins = "*")
public class BlackListController {

    @Autowired
    private BlackListService blackListService;

    Boolean isQp = true; // false || true - for debugging purposes
    

    @PostMapping
    public ResponseEntity<?> createBlacklist(@RequestBody BlackList blackList) {
        // Check for existing blacklist with same clientId, type and condition
        if(isQp) System.out.println("==createBlacklist== " + blackList);

        List<BlackList> existingBlacklists = blackListService.findByClientId(blackList.getClientId());
        boolean isDuplicate = existingBlacklists.stream()
            .anyMatch(existing -> 
                existing.getBlacklistType().equals(blackList.getBlacklistType()) &&
                existing.getCondition().equals(blackList.getCondition()) &&
                existing.getStatus() == 1 && blackList.getStatus() == 1
            );
        
        if (isDuplicate) {
            return ResponseEntity.badRequest()
                .body("A blacklist entry with the same Client ID, Type and Condition already exists");
        }
        
        return ResponseEntity.ok(blackListService.save(blackList));
    }

    @GetMapping
    public ResponseEntity<List<BlackList>> getAllBlacklists() {
        if(isQp) System.out.println("==getAllBlacklists==");
        // Fetch all blacklists ordered by ID in descending order
        // This will return the list of blacklists
        return ResponseEntity.ok(blackListService.findAllByOrderByIdDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlackList> getBlacklistById(@PathVariable Integer id) {
        BlackList blackList = blackListService.findById(id);
        if(isQp) System.out.println("==getBlacklistById== " + blackList);
        // Check if the blacklist exists
        if (blackList != null) {
            return ResponseEntity.ok(blackList);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BlackList>> getBlacklistsByClientId(@PathVariable Integer clientId) {
        if(isQp) System.out.println("==getBlacklistsByClientId== " + clientId);
        // Fetch blacklists by client ID
        return ResponseEntity.ok(blackListService.findByClientId(clientId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlacklist(@PathVariable Integer id) {
        try {
            BlackList blackList = blackListService.findById(id);
            if(isQp) System.out.println("==deleteBlacklist== " + blackList);
            // Check if the blacklist exists
            if (blackList == null) {
                return ResponseEntity.status(404).body("Record not found with id: " + id);
            }
            blackListService.delete(id);
            return ResponseEntity.ok("Record deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting record: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlacklist(@PathVariable Integer id, @RequestBody BlackList updatedBlacklist) {
        try {
            if(isQp) System.out.println("==updateBlacklist== " + updatedBlacklist);
            // Check if the blacklist exists
            BlackList existingBlacklist = blackListService.findById(id);
            if (existingBlacklist == null) {
                return ResponseEntity.status(404).body("Record not found with id: " + id);
            }
            
            // Update fields
            existingBlacklist.setClientId(updatedBlacklist.getClientId());
            existingBlacklist.setBlacklistType(updatedBlacklist.getBlacklistType());
            existingBlacklist.setBlacklistValue(updatedBlacklist.getBlacklistValue());
            existingBlacklist.setCondition(updatedBlacklist.getCondition());
            existingBlacklist.setConnectorId(updatedBlacklist.getConnectorId());
            existingBlacklist.setRemarks(updatedBlacklist.getRemarks());
            
            blackListService.save(existingBlacklist);
            return ResponseEntity.ok("Record updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating record: " + e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBlacklist(
            @RequestParam Integer clientId,
            @RequestParam String type,
            @RequestParam String value) {
        if(isQp) System.out.println("==checkBlacklist== " + clientId + " " + type + " " + value);
        // Check if the client is blacklisted
        // This will return true or false based on the blacklist status
        // The type and value parameters are used to check the specific blacklist entry
        return ResponseEntity.ok(blackListService.isBlacklisted(clientId, type, value));
    }

    @GetMapping("/search")
    public ResponseEntity<List<BlackList>> searchBlacklists(
            @RequestParam String type,
            @RequestParam String value,
            @RequestParam String condition) {
        if(isQp) System.out.println("==searchBlacklists== " + type + " " + value + " " + condition);
        // Search for blacklists based on type, value, and condition
        // This will return a list of blacklists that match the criteria
        // The type and value parameters are used to filter the blacklist entries
        // The condition parameter is used to specify the condition for the search
        // For example, it could be "equals", "contains", etc.
        // The actual implementation of the search logic will depend on the database and ORM being used
        // In this case, we are using JPA and Spring Data to perform the search
        return ResponseEntity.ok(blackListService.findByTypeAndValue(type, value, condition));
    }

    

    public static ResponseEntity<List<BlackList>> getBlacklistsInClientId(BlackListService blackListService, String clientIds, Boolean isQp) {
        if(isQp) System.out.println("==getBlacklistsInClientId== " + clientIds);
        // Fetch blacklists by client ID
        List<BlackList> allBlacklists = new ArrayList<>();
        
        // Split the comma-separated client IDs and fetch blacklists for each
        String[] ids = clientIds.split(",");
        for (String id : ids) {
            try {
                Integer clientId = Integer.parseInt(id.trim());
                List<BlackList> clientBlacklists = blackListService.findByClientId(clientId);
                allBlacklists.addAll(clientBlacklists);
            } catch (NumberFormatException e) {
                // Skip invalid IDs
                continue;
            }
        }
        
        return ResponseEntity.ok(allBlacklists);
    }
}