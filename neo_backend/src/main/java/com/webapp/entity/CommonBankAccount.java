//The CommonBankAccount class is used to model bank account information within the system. It captures key details about the bank account, including its beneficiary, bank name, IBAN, SWIFT code, and status. Additionally, it maintains a many-to-many relationship with currencies, allowing the system to handle multiple currencies associated with a single bank account. This setup is essential for supporting multi-currency transactions and integrations
package com.webapp.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;

@Entity
public class CommonBankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String beneficiary;
    private String bankName;
    private String iban;
    private String swiftCode;
    private String bankAddress;
    private String status;

    @ManyToMany(cascade = { CascadeType.ALL })
    @JoinTable(name = "bank_account_currency", joinColumns = {
            @JoinColumn(name = "bank_account_id") }, inverseJoinColumns = { @JoinColumn(name = "currency_id") })
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
