package com.webapp.dto;

import java.util.List;
import com.webapp.entity.Connector;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class TransactionResponse {
    private Long transID;
    private Double bill_amt;
    private Double trans_amt;
    private String bill_currency;
    private String trans_currency;
    private String statusMessage;
    private boolean success;
    private String responseMessage;
    private List<Connector> transaction; // Ensure Connector is a valid class

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
    
    public List<Connector> getTransaction() { return transaction; }
    public void setTransaction(List<Connector> transaction) { this.transaction = transaction; }

    public Long getTransID() { return transID; }
    public void setTransID(Long transID) { this.transID = transID; }

    public Double getBill_amt() { return bill_amt; }
    public void setBill_amt(Double bill_amt) { this.bill_amt = bill_amt; }

    public Double getTrans_amt() { return trans_amt; }
    public void setTrans_amt(Double trans_amt) { this.trans_amt = trans_amt; }

    public String getBill_currency() { return bill_currency; }
    public void setBill_currency(String bill_currency) { this.bill_currency = bill_currency; }

    public String getTrans_currency() { return trans_currency; }
    public void setTrans_currency(String trans_currency) { this.trans_currency = trans_currency; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }
}