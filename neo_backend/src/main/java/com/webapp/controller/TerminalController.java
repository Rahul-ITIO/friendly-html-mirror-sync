package com.webapp.controller;

import com.webapp.entity.Terminal;
import com.webapp.service.TerminalService;
import com.webapp.utility.AES256Util;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terminals")  // Simplified to single path
public class TerminalController {

    @Autowired
    private TerminalService terminalService;

    @GetMapping({"", "/list"})  // Handle both /api/terminals and /api/terminals/list
    public List<Terminal> getAllTerminals() {
        return terminalService.getAllTerminals();
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Terminal> getTerminalById(@PathVariable int id) {
        try {
            Terminal terminal = terminalService.getTerminalById(id);
            if (terminal != null) {
                return ResponseEntity.ok(terminal);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/key/{public_key}")
    public ResponseEntity<Map<String, Object>> getPublicKey(@PathVariable String public_key) {
        Map<String, Object> response = terminalService.getPublicKey(public_key);

        if (response.containsKey("error_number")) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Terminal>> searchTerminals(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String publicKey,
            @RequestParam(required = false) String merId,
            @RequestParam(required = false) String businessUrl,
            @RequestParam(required = false) String terName,
            @RequestParam(required = false) String dbaBrandName,
            @RequestParam(required = false) String connectorids) {
        
        List<Terminal> results = terminalService.searchTerminals(
            active, publicKey, merId, businessUrl, terName, dbaBrandName, connectorids);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search/merid/{merId}")
    public ResponseEntity<List<Terminal>> searchTerminalsByMerid(
        @PathVariable String merId,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) String publicKey,
        @RequestParam(required = false) String businessUrl,
        @RequestParam(required = false) String terName,
        @RequestParam(required = false) String dbaBrandName,
        @RequestParam(required = false) String connectorids) {
        try {
            // Add validation for merId
            if (merId == null || merId.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Terminal> terminals = terminalService.searchTerminalsByMerid(
                merId, active, publicKey, businessUrl, terName, dbaBrandName, connectorids);
            return ResponseEntity.ok(terminals);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Terminal> createTerminal(@RequestBody Terminal terminal) {
        try {
            Terminal savedTerminal = terminalService.saveTerminal(terminal);
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");
            String publicKey = AES256Util.encrypt(savedTerminal.getId() + "_" + savedTerminal.getMerid() + "_" + dateFormat.format(new Date()));
            String privateKey = AES256Util.encrypt(savedTerminal.getMerid() + "_" + savedTerminal.getId() + "_" + dateFormat.format(new Date()));
            
            savedTerminal.setPublicKey(publicKey);
            savedTerminal.setPrivateKey(privateKey);
            
            savedTerminal = terminalService.saveTerminal(savedTerminal);
            return ResponseEntity.ok(savedTerminal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Terminal> updateTerminal(@PathVariable int id, @RequestBody Terminal terminal) {
        try {
            terminal.setId(id); // Ensure ID matches path variable
            Terminal updatedTerminal = terminalService.saveTerminal(terminal);
            return ResponseEntity.ok(updatedTerminal);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).build();
        }
    }
    
    //generate public key as a 256 encrypted for ID_merid_timestamp
    @GetMapping({"/generatePublicKey/{id}"})
    public ResponseEntity<String> generatePublicKey(@PathVariable int id) {
        Terminal terminal = terminalService.getTerminalById(id);
        Integer getid = terminal.getId();
        Integer merid = terminal.getMerid();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");
    	
        String publickey = "";
        try {
            publickey = AES256Util.encrypt(getid+"_"+merid+"_"+dateFormat.format(new Date()));
            terminal.setPublicKey(publickey);
            terminalService.saveTerminal(terminal);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(publickey);
    }

    //generate public key as a 256 encrypted for merid_ID_timestamp
    @GetMapping({"/generatePrivateKey/{id}"})
    public ResponseEntity<String> generatePrivateKey(@PathVariable int id) {
        Terminal terminal = terminalService.getTerminalById(id);
        Integer getid = terminal.getId();
        Integer merid = terminal.getMerid();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");
    	
        String publickey = "";
        try {
            publickey = AES256Util.encrypt(merid+"_"+getid+"_"+dateFormat.format(new Date()));
            terminal.setPrivateKey(publickey);
            terminalService.saveTerminal(terminal);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(publickey);
    }

    @DeleteMapping("/{id}")
    public void deleteTerminal(@PathVariable int id) {
        terminalService.deleteTerminal(id);
    }
}

