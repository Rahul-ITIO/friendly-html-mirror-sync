package com.webapp.controller;

import com.webapp.dto.PayinProcessingFeeDropdownDTO;
import com.webapp.entity.PayinProcessingFeeTerminalWise;
import com.webapp.service.PayinProcessingFeeTerminalWiseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payin-processing-fee")
public class PayinProcessingFeeTerminalWiseController {

    private final PayinProcessingFeeTerminalWiseService feeService;

    public PayinProcessingFeeTerminalWiseController(PayinProcessingFeeTerminalWiseService feeService) {
        this.feeService = feeService;
    }

    @GetMapping({"/list"}) 
    public ResponseEntity<List<PayinProcessingFeeTerminalWise>> getAllFees() {
        return ResponseEntity.ok(feeService.getAllFees());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PayinProcessingFeeTerminalWise>> searchPayinProcessingFeeTerminalWise(
            @RequestParam(required = false) Boolean connectorProcessingMode,
            @RequestParam(required = false) String connectorId,
            @RequestParam(required = false) String merid,
            @RequestParam(required = false) String mdrRate,
            @RequestParam(required = false) String monthlyFee) {
        
        try {
            List<PayinProcessingFeeTerminalWise> results = feeService.searchPayinProcessingFeeTerminalWise(
                    connectorProcessingMode, connectorId, merid, mdrRate, monthlyFee);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error searching for payin processing fees: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<PayinProcessingFeeTerminalWise> getFeeById(@PathVariable Integer id) {
        return ResponseEntity.ok(feeService.getFeeById(id));
    }

    
    @PostMapping("/create")
    public ResponseEntity<PayinProcessingFeeTerminalWise> createFee(@RequestBody PayinProcessingFeeTerminalWise fee) {
        // Check if this is actually an update request (has an ID)
        if (fee.getId() != null && fee.getId() > 0) {
            // This is actually an update request coming through the create endpoint
            // Log this situation for debugging
            System.out.println("Update request received through create endpoint for ID: " + fee.getId());
            return updateFee(fee.getId(), fee);
        }
        
        // This is a genuine create request
        // Ensure ID is null to prevent accidental updates
        fee.setId(null);
        return ResponseEntity.ok(feeService.saveFee(fee));
    }

    // Original update endpoint
    @PutMapping("/update/{id}")
    public ResponseEntity<PayinProcessingFeeTerminalWise> updateFee(@PathVariable int id, @RequestBody PayinProcessingFeeTerminalWise fee) {
        try {
            // Ensure the ID from the path is used
            fee.setId(id);
            System.out.println("Updating fee with ID: " + id + ", payload: " + fee);
            PayinProcessingFeeTerminalWise updatedFee = feeService.saveFee(fee);
            return ResponseEntity.ok(updatedFee);
        } catch (Exception e) {
            System.err.println("Error updating fee with ID: " + id + ", error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    // Additional endpoint without ID in path
    @PutMapping("/update")
    public ResponseEntity<PayinProcessingFeeTerminalWise> updateFeeWithoutPath(@RequestBody PayinProcessingFeeTerminalWise fee) {
        if (fee.getId() == null || fee.getId() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            System.out.println("Updating fee with ID from payload: " + fee.getId());
            PayinProcessingFeeTerminalWise updatedFee = feeService.saveFee(fee);
            return ResponseEntity.ok(updatedFee);
        } catch (Exception e) {
            System.err.println("Error updating fee with ID from payload: " + fee.getId() + ", error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    // Simple endpoint with just ID in path
    @PutMapping("/{id}")
    public ResponseEntity<PayinProcessingFeeTerminalWise> updateFeeSimple(@PathVariable int id, @RequestBody PayinProcessingFeeTerminalWise fee) {
        return updateFee(id, fee);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFee(@PathVariable Integer id) {
        feeService.deleteFee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dropdown/list/{merid}")
    public ResponseEntity<List<PayinProcessingFeeDropdownDTO>> fetchDropdownList(@PathVariable Integer merid) {
        List<PayinProcessingFeeDropdownDTO> dropdownList = feeService.getDropdownListByMerid(merid);
        return ResponseEntity.ok(dropdownList);
    }
}
