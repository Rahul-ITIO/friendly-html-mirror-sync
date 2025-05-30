package com.webapp.entity;


import com.webapp.utility.AES256Util;

import jakarta.persistence.*;

@Entity
@Table(name = "terminal")
public class Terminal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer merid;
    @Column(unique = true)
    private String publicKey;
    @Column(unique = true, nullable = true)
    private String privateKey;
    private String connectorids;
    private String bussinessUrl;
    private String terName;
    private String terminalType;
    private String businessDescription;
    private String businessNature;
    private Short active;
    private String tarnsAlertEmail;
    private String merTransAlertEmail;
    private String dbaBrandName;
    private String customerServiceNo;
    private String customerServiceEmail;
    private String merchantTermConditionUrl;
    private String merchantRefundPolicyUrl;
    private String merchantPrivacyPolicyUrl;
    private String merchantContactUsUrl;
    private String merchantLogoUrl;
    private String curlingAccessKey;
    @Column(name = "terno_json_value", columnDefinition = "TEXT")
    private String ternoJsonValue;
    private Integer selectTemplates;
    private String selectTemplatesLog;
    private String jsonLogHistory;
    private String deletedBussinessUrl;
    private String checkoutTheme;
    private String selectMcc;
    private String webhookUrl;
    private String returnUrl;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getMerid() {
        return merid;
    }

    public void setMerid(Integer merid) {
        this.merid = merid;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getConnectorids() {
        return connectorids;
    }

    public void setConnectorids(String connectorids) {
        this.connectorids = connectorids;
    }

    public String getBussinessUrl() {
        return bussinessUrl;
    }

    public void setBussinessUrl(String bussinessUrl) {
        this.bussinessUrl = bussinessUrl;
    }

    public String getTerName() {
        return terName;
    }

    public void setTerName(String terName) {
        this.terName = terName;
    }

    public String getTerminalType() {
        return terminalType;
    }

    public void setTerminalType(String terminalType) {
        this.terminalType = terminalType;
    }

    public String getBusinessDescription() {
        return businessDescription;
    }

    public void setBusinessDescription(String businessDescription) {
        this.businessDescription = businessDescription;
    }

    public String getBusinessNature() {
        return businessNature;
    }

    public void setBusinessNature(String businessNature) {
        this.businessNature = businessNature;
    }

    public Short getActive() {
        return active;
    }

    public void setActive(Short active) {
        this.active = active;
    }

    public String getTarnsAlertEmail() {
        return tarnsAlertEmail;
    }

    public void setTarnsAlertEmail(String tarnsAlertEmail) {
        this.tarnsAlertEmail = tarnsAlertEmail;
    }

    public String getMerTransAlertEmail() {
        return merTransAlertEmail;
    }

    public void setMerTransAlertEmail(String merTransAlertEmail) {
        this.merTransAlertEmail = merTransAlertEmail;
    }

    public String getDbaBrandName() {
        return dbaBrandName;
    }

    public void setDbaBrandName(String dbaBrandName) {
        this.dbaBrandName = dbaBrandName;
    }

    public String getCustomerServiceNo() {
        return customerServiceNo;
    }

    public void setCustomerServiceNo(String customerServiceNo) {
        this.customerServiceNo = customerServiceNo;
    }

    public String getCustomerServiceEmail() {
        return customerServiceEmail;
    }

    public void setCustomerServiceEmail(String customerServiceEmail) {
        this.customerServiceEmail = customerServiceEmail;
    }

    public String getMerchantTermConditionUrl() {
        return merchantTermConditionUrl;
    }

    public void setMerchantTermConditionUrl(String merchantTermConditionUrl) {
        this.merchantTermConditionUrl = merchantTermConditionUrl;
    }

    public String getMerchantRefundPolicyUrl() {
        return merchantRefundPolicyUrl;
    }

    public void setMerchantRefundPolicyUrl(String merchantRefundPolicyUrl) {
        this.merchantRefundPolicyUrl = merchantRefundPolicyUrl;
    }

    public String getMerchantPrivacyPolicyUrl() {
        return merchantPrivacyPolicyUrl;
    }

    public void setMerchantPrivacyPolicyUrl(String merchantPrivacyPolicyUrl) {
        this.merchantPrivacyPolicyUrl = merchantPrivacyPolicyUrl;
    }

    public String getMerchantContactUsUrl() {
        return merchantContactUsUrl;
    }

    public void setMerchantContactUsUrl(String merchantContactUsUrl) {
        this.merchantContactUsUrl = merchantContactUsUrl;
    }

    public String getMerchantLogoUrl() {
        return merchantLogoUrl;
    }

    public void setMerchantLogoUrl(String merchantLogoUrl) {
        this.merchantLogoUrl = merchantLogoUrl;
    }

    public String getCurlingAccessKey() {
        return curlingAccessKey;
    }

    public void setCurlingAccessKey(String curlingAccessKey) {
        this.curlingAccessKey = curlingAccessKey;
    }

    public String getTernoJsonValue() {
        return ternoJsonValue;
    }

    public void setTernoJsonValue(String ternoJsonValue) {
        this.ternoJsonValue = ternoJsonValue;
    }

    public Integer getSelectTemplates() {
        return selectTemplates;
    }

    public void setSelectTemplates(Integer selectTemplates) {
        this.selectTemplates = selectTemplates;
    }

    public String getSelectTemplatesLog() {
        return selectTemplatesLog;
    }

    public void setSelectTemplatesLog(String selectTemplatesLog) {
        this.selectTemplatesLog = selectTemplatesLog;
    }

    public String getJsonLogHistory() {
        return jsonLogHistory;
    }

    public void setJsonLogHistory(String jsonLogHistory) {
        this.jsonLogHistory = jsonLogHistory;
    }

    public String getDeletedBussinessUrl() {
        return deletedBussinessUrl;
    }

    public void setDeletedBussinessUrl(String deletedBussinessUrl) {
        this.deletedBussinessUrl = deletedBussinessUrl;
    }

    public String getCheckoutTheme() {
        return checkoutTheme;
    }

    public void setCheckoutTheme(String checkoutTheme) {
        this.checkoutTheme = checkoutTheme;
    }

    public String getSelectMcc() {
        return selectMcc;
    }

    public void setSelectMcc(String selectMcc) {
        this.selectMcc = selectMcc;
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
    public String getPrivateKey() {
		return privateKey;
	}

	public void setPrivateKey(String privateKey) {
		this.privateKey = privateKey;
	}
    
    public void setPublicKeyEn(String publicKey) {
        try {
            this.publicKey = AES256Util.encrypt(publicKey); // Encrypt before storing
        } catch (Exception e) {
            e.printStackTrace();
            this.publicKey = null;
        }
    }

    public String getPublicKeyDe() {
        try {
            return AES256Util.decrypt(this.publicKey); // Decrypt when retrieving
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

	
}
