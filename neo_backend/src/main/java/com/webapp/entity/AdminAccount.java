//The AdminAccount class is used to manage administrative bank accounts within an online banking system. It stores essential details about the account, including the beneficiary, bank information, and addresses. The many-to-many relationship with Currency allows an admin account to handle multiple currencies, which is crucial for multi-currency support in banking operations
package com.webapp.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

@Entity
public class AdminAccount {
    @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String beneficiary;
    private String bankName;
    private String iban;
    private String swiftCode;
    private String bankAddress;
    private String beneficiaryAddress;

    @ManyToMany(cascade = { CascadeType.ALL })
    @JoinTable(name = "admin_account_currency", joinColumns = {
            @JoinColumn(name = "admin_account_id") }, inverseJoinColumns = { @JoinColumn(name = "currency_id") })
    private List<Currency> currencyMap = new ArrayList<>();

    public List<Currency> getCurrencyMap() {
        return currencyMap;
    }

    public void setCurrencyMap(List<Currency> currencyMap) {
        this.currencyMap = currencyMap;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBeneficiary() {
        return beneficiary;
    }

    public void setBeneficiary(String beneficiary) {
        this.beneficiary = beneficiary;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getIban() {
        return iban;
    }

    public void setIban(String iban) {
        this.iban = iban;
    }

    public String getSwiftCode() {
        return swiftCode;
    }

    public void setSwiftCode(String swiftCode) {
        this.swiftCode = swiftCode;
    }

    public String getBankAddress() {
        return bankAddress;
    }

    public void setBankAddress(String bankAddress) {
        this.bankAddress = bankAddress;
    }

    public String getBeneficiaryAddress() {
        return beneficiaryAddress;
    }

    public void setBeneficiaryAddress(String beneficiaryAddress) {
        this.beneficiaryAddress = beneficiaryAddress;
    }

}
