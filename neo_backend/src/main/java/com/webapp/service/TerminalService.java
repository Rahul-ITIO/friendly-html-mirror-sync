package com.webapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.TerminalDao;
import com.webapp.entity.Terminal;

import jakarta.persistence.criteria.Predicate;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import org.springframework.data.jpa.domain.Specification;

/**
 * Service class for handling terminal-related operations in the online banking system.
 * This class is annotated with @Service to indicate that it's a Spring service component.
 */
@Service
public class TerminalService {  
    @Autowired
    private TerminalDao terminalDao;

    public List<Terminal> getAllTerminals() {
        return terminalDao.findAll();
    }

    public Terminal getTerminalById(int id) {
        return terminalDao.findById(id).orElse(null);
    }

    public Terminal saveTerminal(Terminal terminal) {
        return terminalDao.save(terminal);
    }

    public void deleteTerminal(int id) {
        terminalDao.deleteById(id);
    }

    public Map<String, Object> getPublicKey(String public_key) {
        // TODO Auto-generated method stub  
        throw new UnsupportedOperationException("Unimplemented method 'getPublicKey'");
    }

    public List<Terminal> searchTerminals(Boolean active, String publicKey, String merId, String businessUrl,
            String terName, String dbaBrandName, String connectorids) {
        
        Specification<Terminal> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (publicKey != null && !publicKey.isEmpty()) {
                predicates.add(cb.like(root.get("publicKey"), "%" + publicKey + "%"));
            }
            if (merId != null && !merId.isEmpty()) {
                predicates.add(cb.like(root.get("merId"), "%" + merId + "%"));
            }
            if (businessUrl != null && !businessUrl.isEmpty()) {
                predicates.add(cb.like(root.get("businessUrl"), "%" + businessUrl + "%"));
            }
            if (terName != null && !terName.isEmpty()) {
                predicates.add(cb.like(root.get("terName"), "%" + terName + "%"));
            }
            if (dbaBrandName != null && !dbaBrandName.isEmpty()) {
                predicates.add(cb.like(root.get("dbaBrandName"), "%" + dbaBrandName + "%"));
            }
            if (connectorids != null && !connectorids.isEmpty()) {
                predicates.add(cb.like(root.get("connectorids"), "%" + connectorids + "%"));
            }
            
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return terminalDao.findAll(spec);
    }

    public List<Terminal> searchTerminalsByMerid(String merId) {
        Specification<Terminal> spec = (root, query, cb) -> {
            return cb.like(root.get("merId"), "%" + merId + "%");
        };
        return terminalDao.findAll(spec);
    }

    public List<Terminal> searchTerminalsByMerid(String merId, Boolean active, String publicKey,
            String businessUrl, String terName, String dbaBrandName, String connectorids) {
        
        Specification<Terminal> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Fix: Change 'merId' to 'merid' to match entity field name
            predicates.add(cb.equal(root.get("merid"), Integer.parseInt(merId)));
            
            // Add optional filters
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            if (publicKey != null && !publicKey.isEmpty()) {
                predicates.add(cb.like(root.get("publicKey"), "%" + publicKey + "%"));
            }
            if (businessUrl != null && !businessUrl.isEmpty()) {
                predicates.add(cb.like(root.get("bussinessUrl"), "%" + businessUrl + "%"));
            }
            if (terName != null && !terName.isEmpty()) {
                predicates.add(cb.like(root.get("terName"), "%" + terName + "%"));
            }
            if (dbaBrandName != null && !dbaBrandName.isEmpty()) {
                predicates.add(cb.like(root.get("dbaBrandName"), "%" + dbaBrandName + "%"));
            }
            if (connectorids != null && !connectorids.isEmpty()) {
                predicates.add(cb.like(root.get("connectorids"), "%" + connectorids + "%"));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return terminalDao.findAll(spec);
    }
}
