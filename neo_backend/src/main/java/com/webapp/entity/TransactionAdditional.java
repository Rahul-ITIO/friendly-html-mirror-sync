package com.webapp.entity;

import com.webapp.utility.AES256Util;
import com.webapp.utility.Base64Util;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "master_trans_additional_3", 
indexes = {
    @Index(name = "idx_transid_ad", columnList = "transid_ad DESC")
})

public class TransactionAdditional {

    @Id
    @Column(name = "id_ad")
    private Integer id;
    
    @Column(name = "transID_ad", unique = true)
    private Long transIDAd;  // Renamed field to use camelCase

    @Column(name = "authurl")
    private String authUrl;

    @Column(name = "authdata", columnDefinition = "TEXT")
    private String authData;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "return_url")
    private String returnUrl;

    @Column(name = "upa")
    private String upa;

    @Column(name = "rrn")
    private String rrn;

    @Column(name = "connector_ref")
    private String connectorRef;

    @Column(name = "connector_response", columnDefinition = "TEXT")
    private String connectorResponse;

    @Column(name = "descriptor")
    private String descriptor;

    @Column(name = "mer_note", columnDefinition = "TEXT")
    private String merchantNote;

    @Column(name = "support_note", columnDefinition = "TEXT")
    private String supportNote;

    @Column(name = "system_note", columnDefinition = "TEXT")
    private String systemNote;

    @Column(name = "json_value", columnDefinition = "TEXT")
    private String jsonValue;

    @Column(name = "connector_json", columnDefinition = "TEXT")
    private String connectorJson;

    @Column(name = "json_log_history", columnDefinition = "TEXT")
    private String jsonLogHistory;

    @Column(name = "payload_stage1", columnDefinition = "TEXT")
    private String payloadStage1;

    @Column(name = "connector_creds_processing_final", columnDefinition = "TEXT")
    private String connectorCredsProcessingFinal;

    @Column(name = "connector_response_stage1", columnDefinition = "TEXT")
    private String connectorResponseStage1;

    @Column(name = "connector_response_stage2", columnDefinition = "TEXT")
    private String connectorResponseStage2;

    @Column(name = "bin_no")
    private Integer binNumber;

    @Column(name = "ccno")
    private String cardNumber;

    @Column(name = "ex_month")
    private String expiryMonth;

    @Column(name = "ex_year")
    private String expiryYear;

    @Column(name = "trans_response")
    private String transactionResponse;

    @Column(name = "bill_phone")
    private String billingPhone;

    @Column(name = "bill_address")
    private String billingAddress;

    @Column(name = "bill_city")
    private String billingCity;

    @Column(name = "bill_state")
    private String billingState;

    @Column(name = "bill_country")
    private String billingCountry;

    @Column(name = "bill_zip")
    private String billingZip;

    @Column(name = "product_name")
    private String productName;
    
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getAuthUrl() {
        return authUrl;
    }
    
    public void setAuthUrl(String authUrl) {
        this.authUrl = authUrl;
    }
    
    public String getAuthData() {
        return authData;
    }
    
    public void setAuthData(String authData) {
        this.authData = authData;
    }
    
    public String getSourceUrl() {
        return sourceUrl;
    }
    
    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
    
    public String getWebhookUrl() {
        return webhookUrl;
    }
    
    public void setWebhookUrl(String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }
    
    public String getReturnUrl() {
        return returnUrl;
    }
    
    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }
    
    public String getUpa() {
        return upa;
    }
    
    public void setUpa(String upa) {
        this.upa = upa;
    }
    
    public String getRrn() {
        return rrn;
    }
    
    public void setRrn(String rrn) {
        this.rrn = rrn;
    }
    
    public String getConnectorRef() {
        return connectorRef;
    }
    
    public void setConnectorRef(String connectorRef) {
        this.connectorRef = connectorRef;
    }
    
    public String getConnectorResponse() {
        return connectorResponse;
    }
    
    public void setConnectorResponse(String connectorResponse) {
        this.connectorResponse = connectorResponse;
    }
    
    public String getDescriptor() {
        return descriptor;
    }
    
    public void setDescriptor(String descriptor) {
        this.descriptor = descriptor;
    }
    
    public String getMerchantNote() {
        return merchantNote;
    }
    
    public void setMerchantNote(String merchantNote) {
        this.merchantNote = merchantNote;
    }
    
    public String getSupportNote() {
        return supportNote;
    }
    
    public void setSupportNote(String supportNote) {
        this.supportNote = supportNote;
    }
    
    public String getSystemNote() {
        return systemNote;
    }
    
    public void setSystemNote(String systemNote) {
        this.systemNote = systemNote;
    }
    
    public String getJsonValue() {
        return jsonValue;
    }
    
    public void setJsonValue(String jsonValue) {
        this.jsonValue = jsonValue;
    }
    
    public String getConnectorJson() {
        return connectorJson;
    }
    
    public void setConnectorJson(String connectorJson) {
        this.connectorJson = connectorJson;
    }
    
    public String getJsonLogHistory() {
        return jsonLogHistory;
    }
    
    public void setJsonLogHistory(String jsonLogHistory) {
        this.jsonLogHistory = jsonLogHistory;
    }
    
    public String getPayloadStage1() {
        return payloadStage1;
    }
    
    public void setPayloadStage1(String payloadStage1) {
        this.payloadStage1 = payloadStage1;
    }
    
    public String getConnectorCredsProcessingFinal() {
        return connectorCredsProcessingFinal;
    }
    
    public void setConnectorCredsProcessingFinal(String connectorCredsProcessingFinal) {
        this.connectorCredsProcessingFinal = connectorCredsProcessingFinal;
    }
    
    public String getConnectorResponseStage1() {
        return connectorResponseStage1;
    }
    
    public void setConnectorResponseStage1(String connectorResponseStage1) {
        this.connectorResponseStage1 = connectorResponseStage1;
    }
    
    public String getConnectorResponseStage2() {
        return connectorResponseStage2;
    }
    
    public void setConnectorResponseStage2(String connectorResponseStage2) {
        this.connectorResponseStage2 = connectorResponseStage2;
    }
    
    public Integer getBinNumber() {
        return binNumber;
    }
    
    public void setBinNumber(Integer binNumber) {
        this.binNumber = binNumber;
    }
    
    public String getCardNumber() {
        return cardNumber;
    }
    
    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }
    
    public String getExpiryMonth() {
        return expiryMonth;
    }
    
    public void setExpiryMonth(String expiryMonth) {
        this.expiryMonth = expiryMonth;
    }
    
    public String getExpiryYear() {
        return expiryYear;
    }
    
    public void setExpiryYear(String expiryYear) {
        this.expiryYear = expiryYear;
    }
    
    public String getTransactionResponse() {
        return transactionResponse;
    }
    
    public void setTransactionResponse(String transactionResponse) {
        this.transactionResponse = transactionResponse;
    }
    
    public String getBillingPhone() {
        return billingPhone;
    }
    
    public void setBillingPhone(String billingPhone) {
        this.billingPhone = billingPhone;
    }
    
    public String getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }
    
    public String getBillingCity() {
        return billingCity;
    }
    
    public void setBillingCity(String billingCity) {
        this.billingCity = billingCity;
    }
    
    public String getBillingState() {
        return billingState;
    }
    
    public void setBillingState(String billingState) {
        this.billingState = billingState;
    }
    
    public String getBillingCountry() {
        return billingCountry;
    }
    
    public void setBillingCountry(String billingCountry) {
        this.billingCountry = billingCountry;
    }
    
    public String getBillingZip() {
        return billingZip;
    }
    
    public void setBillingZip(String billingZip) {
        this.billingZip = billingZip;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public Long getTransIDAd() {
        return transIDAd;
    }

    public void setTransIDAd(Long transIDAd) {
        this.transIDAd = transIDAd;
    }
    
    public void setCcno(String cardNumber) {
        try {
            this.cardNumber = AES256Util.encrypt(cardNumber); // Encrypt before storing
        } catch (Exception e) {
            e.printStackTrace();
            this.cardNumber = null;
        }
    }

    public String getCcnoDecrypted() {
        try {
            return AES256Util.decrypt(this.cardNumber); // Decrypt when retrieving
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void setExMonth(String expiryMonth) {
        try {
            this.expiryMonth = Base64Util.encodeBase64(expiryMonth); 
        } catch (Exception e) {
            e.printStackTrace();
            this.expiryMonth = null;
        }
    }

    public String getExMonth() {
        try {
            return Base64Util.decodeBase64(this.expiryMonth); 
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public void setExYear(String expiryYear) {
        try {
            this.expiryYear = Base64Util.encodeBase64(expiryYear); 
        } catch (Exception e) {
            e.printStackTrace();
            this.expiryYear = null;
        }
    }

    public String getExYear() {
        try {
            return Base64Util.decodeBase64(this.expiryYear); 
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
