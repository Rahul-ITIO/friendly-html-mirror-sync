package com.webapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.webapp.dao.ConnectorDao;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.ConnectorResponse;
import com.webapp.entity.Connector;

import io.swagger.v3.oas.annotations.Operation;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/connectors/")
@CrossOrigin
public class ConnectorController {

    @Autowired
    private ConnectorDao connectorDao;

    @PostMapping("add")
    public ResponseEntity<CommonApiResponse> addConnector(@RequestBody Connector connector) {
        CommonApiResponse response = new CommonApiResponse();
        
        try {
            // In addConnector method:
            Connector existingConnector = connectorDao.findByConnectorNumber(connector.getConnectorNumber());

            
            if (existingConnector == null) {
                connectorDao.save(connector);
                response.setSuccess(true);
                response.setResponseMessage("Connector added successfully");
            } else {
                // Update all fields with the new naming convention
                existingConnector.setConnectorName(connector.getConnectorName());
                existingConnector.setChannelType(connector.getChannelType());
                existingConnector.setConnectorStatus(connector.getConnectorStatus());
                existingConnector.setConnectorProdMode(connector.getConnectorProdMode());
                /*
                existingConnector.setMccCode(connector.getMccCode());
                existingConnector.setDefaultConnector(connector.getDefaultConnector());
                existingConnector.setConnectionMethod(connector.getConnectionMethod());
                existingConnector.setConnectorDescriptor(connector.getConnectorDescriptor());
                
                // URLs
                existingConnector.setConnectorBaseUrl(connector.getConnectorBaseUrl());
                existingConnector.setConnectorProdUrl(connector.getConnectorProdUrl());
                existingConnector.setConnectorUatUrl(connector.getConnectorUatUrl());
                existingConnector.setConnectorStatusUrl(connector.getConnectorStatusUrl());
                existingConnector.setConnectorRefundUrl(connector.getConnectorRefundUrl());
                existingConnector.setConnectorDevApiUrl(connector.getConnectorDevApiUrl());
                existingConnector.setHardCodePaymentUrl(connector.getHardCodePaymentUrl());
                existingConnector.setHardCodeStatusUrl(connector.getHardCodeStatusUrl());
                existingConnector.setHardCodeRefundUrl(connector.getHardCodeRefundUrl());
                
                // Processing related
                existingConnector.setConnectorLoginCreds(connector.getConnectorLoginCreds());
                existingConnector.setConnectorProcessingCurrency(connector.getConnectorProcessingCurrency());
                existingConnector.setProcessingCurrencyMarkup(connector.getProcessingCurrencyMarkup());
                existingConnector.setConnectorRefundPolicy(connector.getConnectorRefundPolicy());
                existingConnector.setTransAutoExpired(connector.getTransAutoExpired());
                existingConnector.setTransAutoRefund(connector.getTransAutoRefund());
                existingConnector.setMopWeb(connector.getMopWeb());
                existingConnector.setMopMobile(connector.getMopMobile());
                existingConnector.setTechCommentsText(connector.getTechCommentsText());
                
                // Whitelist
                existingConnector.setConnectorWlIp(connector.getConnectorWlIp());
                existingConnector.setConnectorWlDomain(connector.getConnectorWlDomain());
                
                // Checkout UI
                existingConnector.setSkipCheckoutValidation(connector.getSkipCheckoutValidation());
                existingConnector.setRedirectPopupMsgWeb(connector.getRedirectPopupMsgWeb());
                existingConnector.setRedirectPopupMsgMobile(connector.getRedirectPopupMsgMobile());
                existingConnector.setCheckoutLabelNameWeb(connector.getCheckoutLabelNameWeb());
                existingConnector.setCheckoutLabelNameMobile(connector.getCheckoutLabelNameMobile());
                existingConnector.setCheckoutSubLabelNameWeb(connector.getCheckoutSubLabelNameWeb());
                existingConnector.setCheckoutSubLabelNameMobile(connector.getCheckoutSubLabelNameMobile());
                existingConnector.setCheckoutUiVersion(connector.getCheckoutUiVersion());
                existingConnector.setCheckoutUiTheme(connector.getCheckoutUiTheme());
                existingConnector.setCheckoutUiLanguage(connector.getCheckoutUiLanguage());
                
                // JSON data
                existingConnector.setConnectorProcessingCredsJson(connector.getConnectorProcessingCredsJson());
                existingConnector.setEcommerceCruisesJson(connector.getEcommerceCruisesJson());
                existingConnector.setMerSettingJson(connector.getMerSettingJson());
                existingConnector.setConnectorLabelJson(connector.getConnectorLabelJson());
                existingConnector.setProcessingCountriesJson(connector.getProcessingCountriesJson());
                existingConnector.setBlockCountriesJson(connector.getBlockCountriesJson());
                
                // Notifications
                existingConnector.setNotificationEmail(connector.getNotificationEmail());
                existingConnector.setNotificationCount(connector.getNotificationCount());
                existingConnector.setAutoStatusFetch(connector.getAutoStatusFetch());
                existingConnector.setAutoStatusStartTime(connector.getAutoStatusStartTime());
                existingConnector.setAutoStatusIntervalTime(connector.getAutoStatusIntervalTime());
                existingConnector.setCronBankStatusResponse(connector.getCronBankStatusResponse());
                 */

                connectorDao.save(existingConnector);
                response.setSuccess(true);
                response.setResponseMessage("Connector updated successfully");
            }
        } catch (Exception e) {
            response.setSuccess(false);
            response.setResponseMessage("Failed to add/update connector: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("all")
    public ResponseEntity<ConnectorResponse> getAllConnectors() {
        ConnectorResponse response = new ConnectorResponse();
        
        try {
            System.out.println("Fetching all connectors...");
            List<Connector> connectors = connectorDao.findAll();
            System.out.println("Found " + connectors.size() + " connectors");
            
            response.setConnectors(connectors);
            response.setSuccess(true);
            response.setResponseMessage("Connectors fetched successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error fetching connectors: " + e.getMessage());
            
            response.setSuccess(false);
            response.setResponseMessage("Failed to fetch connectors: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Dev Tech : 28-03-25 : Fetch Active is 1 & Common is 2 Connectors for DropDown with retrun response is connectorNumber and connectorName only
    @GetMapping("/fetch/dropdown/list")
    @Operation(summary = "Get active (1) and common (2) connectors for dropdown")
    public ResponseEntity<ConnectorResponse> getDropdownConnectors() {
        ConnectorResponse response = new ConnectorResponse();
        
        try {
            List<Connector> activeConnectors = connectorDao.findAll().stream()
                .filter(connector -> {
                    String status = connector.getConnectorStatus();
                    return "1".equals(status) || "2".equals(status) || 
                           "Active".equalsIgnoreCase(status) || "Common".equalsIgnoreCase(status);
                })
                .map(connector -> {
                    Connector simplified = new Connector();
                    simplified.setConnectorNumber(connector.getConnectorNumber());
                    simplified.setConnectorName(connector.getConnectorName());
                    return simplified;
                })
                .collect(Collectors.toList());
            
            response.setConnectors(activeConnectors);
            response.setSuccess(true);
            response.setResponseMessage("Active and Common connectors fetched successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            response.setSuccess(false);
            response.setResponseMessage("Failed to fetch connectors: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("update")
    public ResponseEntity<CommonApiResponse> updateConnector(@RequestParam String originalCode, @RequestBody Connector connector) {
        CommonApiResponse response = new CommonApiResponse();
        
        try {

            System.out.println("Update request received - Original code: " + originalCode);
            System.out.println("New connector data: " + connector.getConnectorNumber() + " - " + connector.getConnectorName());
        

            // Try multiple search strategies
            Connector existingConnector = connectorDao.findByConnectorNumber(originalCode);
        

            if (existingConnector != null) {
                // Update all fields with the new naming convention
                existingConnector.setConnectorNumber(connector.getConnectorNumber());
                existingConnector.setConnectorName(connector.getConnectorName());
                existingConnector.setChannelType(connector.getChannelType());
                existingConnector.setConnectorStatus(connector.getConnectorStatus());
                existingConnector.setConnectorProdMode(connector.getConnectorProdMode());
                existingConnector.setMccCode(connector.getMccCode());
                existingConnector.setDefaultConnector(connector.getDefaultConnector());
                existingConnector.setConnectionMethod(connector.getConnectionMethod());
                existingConnector.setConnectorDescriptor(connector.getConnectorDescriptor());
                
                // URLs
                existingConnector.setConnectorBaseUrl(connector.getConnectorBaseUrl());
                existingConnector.setConnectorProdUrl(connector.getConnectorProdUrl());
                existingConnector.setConnectorUatUrl(connector.getConnectorUatUrl());
                existingConnector.setConnectorStatusUrl(connector.getConnectorStatusUrl());
                existingConnector.setConnectorRefundUrl(connector.getConnectorRefundUrl());
                existingConnector.setConnectorDevApiUrl(connector.getConnectorDevApiUrl());
                existingConnector.setHardCodePaymentUrl(connector.getHardCodePaymentUrl());
                existingConnector.setHardCodeStatusUrl(connector.getHardCodeStatusUrl());
                existingConnector.setHardCodeRefundUrl(connector.getHardCodeRefundUrl());
                
                // Processing related
                existingConnector.setConnectorLoginCreds(connector.getConnectorLoginCreds());
                existingConnector.setConnectorProcessingCurrency(connector.getConnectorProcessingCurrency());
                existingConnector.setProcessingCurrencyMarkup(connector.getProcessingCurrencyMarkup());
                existingConnector.setConnectorRefundPolicy(connector.getConnectorRefundPolicy());
                existingConnector.setTransAutoExpired(connector.getTransAutoExpired());
                existingConnector.setTransAutoRefund(connector.getTransAutoRefund());
                existingConnector.setMopWeb(connector.getMopWeb());
                existingConnector.setMopMobile(connector.getMopMobile());
                existingConnector.setTechCommentsText(connector.getTechCommentsText());
                
                // Whitelist
                existingConnector.setConnectorWlIp(connector.getConnectorWlIp());
                existingConnector.setConnectorWlDomain(connector.getConnectorWlDomain());
                
                // Checkout UI
                existingConnector.setSkipCheckoutValidation(connector.getSkipCheckoutValidation());
                existingConnector.setRedirectPopupMsgWeb(connector.getRedirectPopupMsgWeb());
                existingConnector.setRedirectPopupMsgMobile(connector.getRedirectPopupMsgMobile());
                existingConnector.setCheckoutLabelNameWeb(connector.getCheckoutLabelNameWeb());
                existingConnector.setCheckoutLabelNameMobile(connector.getCheckoutLabelNameMobile());
                existingConnector.setCheckoutSubLabelNameWeb(connector.getCheckoutSubLabelNameWeb());
                existingConnector.setCheckoutSubLabelNameMobile(connector.getCheckoutSubLabelNameMobile());
                existingConnector.setCheckoutUiVersion(connector.getCheckoutUiVersion());
                existingConnector.setCheckoutUiTheme(connector.getCheckoutUiTheme());
                existingConnector.setCheckoutUiLanguage(connector.getCheckoutUiLanguage());
                
                // JSON data
                existingConnector.setConnectorProcessingCredsJson(connector.getConnectorProcessingCredsJson());
                existingConnector.setEcommerceCruisesJson(connector.getEcommerceCruisesJson());
                existingConnector.setMerSettingJson(connector.getMerSettingJson());
                existingConnector.setConnectorLabelJson(connector.getConnectorLabelJson());
                existingConnector.setProcessingCountriesJson(connector.getProcessingCountriesJson());
                existingConnector.setBlockCountriesJson(connector.getBlockCountriesJson());
                
                // Notifications
                existingConnector.setNotificationEmail(connector.getNotificationEmail());
                existingConnector.setNotificationCount(connector.getNotificationCount());
                existingConnector.setAutoStatusFetch(connector.getAutoStatusFetch());
                existingConnector.setAutoStatusStartTime(connector.getAutoStatusStartTime());
                existingConnector.setAutoStatusIntervalTime(connector.getAutoStatusIntervalTime());
                existingConnector.setCronBankStatusResponse(connector.getCronBankStatusResponse());
    
                connectorDao.save(existingConnector);
                System.out.println("Successfully updated connector from " + originalCode + " to " + connector.getConnectorNumber());
                
                response.setSuccess(true);
                response.setResponseMessage("Connector updated successfully");
            } else {
                System.err.println("Connector not found with code: " + originalCode);
                response.setSuccess(false);
                response.setResponseMessage("Connector not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error updating connector: " + e.getMessage());
            response.setSuccess(false);
            response.setResponseMessage("Failed to update connector: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @PostMapping("delete")
    public ResponseEntity<CommonApiResponse> deleteConnector(@RequestBody Long id) {
        CommonApiResponse response = new CommonApiResponse();
        
        try {
            System.out.println("Attempting to delete connector with ID: " + id);
            Optional<Connector> connectorOpt = connectorDao.findById(id);
            
            if (connectorOpt.isPresent()) {
                Connector connector = connectorOpt.get();
                System.out.println("Found connector: " + connector.getConnectorNumber() + " - " + connector.getConnectorName());
                connectorDao.deleteById(id);
                System.out.println("Successfully deleted connector with ID: " + id);
                
                response.setSuccess(true);
                response.setResponseMessage("Connector deleted successfully");
            } else {
                System.err.println("Connector not found with ID: " + id);
                response.setSuccess(false);
                response.setResponseMessage("Connector not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error deleting connector: " + e.getMessage());
            response.setSuccess(false);
            response.setResponseMessage("Failed to delete connector: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
