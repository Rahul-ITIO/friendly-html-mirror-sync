package com.webapp.service.impl;


import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.webapp.dao.PayinProcessingFeeTerminalWiseDao;
import com.webapp.dto.PayinProcessingFeeDropdownDTO;
import com.webapp.entity.Connector;
import com.webapp.entity.PayinProcessingFeeTerminalWise;
import com.webapp.service.PayinProcessingFeeTerminalWiseService;

import jakarta.persistence.criteria.Predicate;

@Service
public class PayinProcessingFeeTerminalWiseServiceImpl implements PayinProcessingFeeTerminalWiseService {

    @Autowired
    private PayinProcessingFeeTerminalWiseDao payinProcessingFeeTerminalWiseDao;

    

    public PayinProcessingFeeTerminalWiseServiceImpl(PayinProcessingFeeTerminalWiseDao feeDao) {
        this.payinProcessingFeeTerminalWiseDao = feeDao;
    }

    @Override
    public List<PayinProcessingFeeTerminalWise> getAllFees() {
        return payinProcessingFeeTerminalWiseDao.findAll();
    }

    @Override
    public PayinProcessingFeeTerminalWise getFeeById(Integer id) {
        return payinProcessingFeeTerminalWiseDao.findById(id).orElse(null);
    }

    @Override
    public PayinProcessingFeeTerminalWise saveFee(PayinProcessingFeeTerminalWise fee) {
        return payinProcessingFeeTerminalWiseDao.save(fee);
    }

    @Override
    public void deleteFee(Integer id) {
        payinProcessingFeeTerminalWiseDao.deleteById(id);
    }

    @Override
    public List<PayinProcessingFeeTerminalWise> searchPayinProcessingFeeTerminalWise(Boolean connectorProcessingMode, String connectorId, String merid, String mdrRate, String monthlyFee) {
        Specification<PayinProcessingFeeTerminalWise> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (connectorProcessingMode != null) {
                predicates.add(cb.equal(root.get("connectorProcessingMode"), connectorProcessingMode));
            }
            if (merid != null && !merid.isEmpty()) {
                predicates.add(cb.like(root.get("merid"), "%" + merid + "%"));
            }
            if (connectorId != null && !connectorId.isEmpty()) {
                predicates.add(cb.like(root.get("connector_id"), "%" + connectorId + "%"));
            }
            if (mdrRate != null && !mdrRate.isEmpty()) {
                predicates.add(cb.like(root.get("mdr_rate"), "%" + mdrRate + "%"));
            }
            if (monthlyFee != null && !monthlyFee.isEmpty()) {
                predicates.add(cb.like(root.get("monthly_fee"), "%" + monthlyFee + "%"));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };

        
        return payinProcessingFeeTerminalWiseDao.findAll(spec);
    }

    //Dev Tech : 29-03-25 : Fetch id,connectorId and Fetch ecommerceCruisesJson from Connector as per PayinProcessingFeeTerminalWise.connectorId==Connector.connectorNumber  only
    @Override
    public List<PayinProcessingFeeDropdownDTO> getDropdownList() {
        List<PayinProcessingFeeTerminalWise> results = payinProcessingFeeTerminalWiseDao.findAllByOrderById();
        return convertToDropdownDTO(results);
    }

    @Override
    public List<PayinProcessingFeeDropdownDTO> getDropdownListByMerid(Integer merid) { // Changed from String to Integer
        List<PayinProcessingFeeTerminalWise> results = payinProcessingFeeTerminalWiseDao.findByMeridOrderById(merid);
        return convertToDropdownDTO(results);
    }

    private List<PayinProcessingFeeDropdownDTO> convertToDropdownDTO(List<PayinProcessingFeeTerminalWise> results) {
        List<PayinProcessingFeeDropdownDTO> dtoList = new ArrayList<>();
        for (PayinProcessingFeeTerminalWise result : results) {
            PayinProcessingFeeDropdownDTO dto = new PayinProcessingFeeDropdownDTO();
            dto.setId(result.getId());
            dto.setConnectorId(result.getConnectorId());
            
            // Get connector data if available
            if (result.getConnector() != null) {
                Connector connector = result.getConnector();
                dto.setEcommerceCruisesJson(connector.getEcommerceCruisesJson());
                dto.setConnectorName(connector.getConnectorName());
                dto.setChannelType(connector.getChannelType());
                dto.setConnectorStatus(connector.getConnectorStatus());
                
                // Convert string to Boolean for defaultConnector
                if (connector.getDefaultConnector() != null) {
                    dto.setDefaultConnector("true".equalsIgnoreCase(connector.getDefaultConnector()) || 
                                           "1".equals(connector.getDefaultConnector()) || 
                                           "yes".equalsIgnoreCase(connector.getDefaultConnector()));
                } else {
                    dto.setDefaultConnector(false);
                }
            }
            
            dtoList.add(dto);
        }
        return dtoList;
    }

     

}