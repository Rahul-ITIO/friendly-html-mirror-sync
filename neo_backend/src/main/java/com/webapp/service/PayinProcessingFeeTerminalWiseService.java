package com.webapp.service;


import com.webapp.dto.PayinProcessingFeeDropdownDTO;
import com.webapp.entity.PayinProcessingFeeTerminalWise;
import java.util.List;

public interface PayinProcessingFeeTerminalWiseService {
    List<PayinProcessingFeeTerminalWise> getAllFees();
    PayinProcessingFeeTerminalWise getFeeById(Integer id);
    PayinProcessingFeeTerminalWise saveFee(PayinProcessingFeeTerminalWise fee);
    void deleteFee(Integer id);
    List<PayinProcessingFeeTerminalWise> searchPayinProcessingFeeTerminalWise(
        Boolean connectorProcessingMode,
        String connectorId,
        String merid,
        String mdrRate,
        String monthlyFee
    );
    
    List<PayinProcessingFeeDropdownDTO> getDropdownList();
    List<PayinProcessingFeeDropdownDTO> getDropdownListByMerid(Integer merid); // Changed from String to Integer
}
