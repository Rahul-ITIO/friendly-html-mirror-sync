package com.webapp.dto;

public class TransactionResponseDTO {
    private Long transID;
    private String order_status;
    private String status;
    private Double bill_amt;
    private String descriptor;
    private String tdate;
    private String bill_currency;
    private String response;
    private String reference;
    private String mop;
    private String ccno;
    private String rrn;
    private String upa;
    private String authstatus;
    private String authurl;
    private String authdata;

    // Constructor
    public TransactionResponseDTO(Long transID, String order_status, String status, Double bill_amt, 
                                  String descriptor, String tdate, String bill_currency, String response, 
                                  String reference, String mop, String ccno, String rrn, String upa, 
                                  String authstatus, String authurl, String authdata) {
        this.transID = transID;
        this.order_status = order_status;
        this.status = status;
        this.bill_amt = bill_amt;
        this.descriptor = descriptor;
        this.tdate = tdate;
        this.bill_currency = bill_currency;
        this.response = response;
        this.reference = reference;
        this.mop = mop;
        this.ccno = ccno;
        this.rrn = rrn;
        this.upa = upa;
        this.authstatus = authstatus;
        this.authurl = authurl;
        this.authdata = authdata;
    }

    // Getters and Setters
    public Long getTransID() { return transID; }
    public void setTransID(Long transID) { this.transID = transID; }

    public String getOrder_status() { return order_status; }
    public void setOrder_status(String order_status) { this.order_status = order_status; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getBill_amt() { return bill_amt; }
    public void setBill_amt(Double bill_amt) { this.bill_amt = bill_amt; }

    public String getDescriptor() { return descriptor; }
    public void setDescriptor(String descriptor) { this.descriptor = descriptor; }

    public String getTdate() { return tdate; }
    public void setTdate(String tdate) { this.tdate = tdate; }

    public String getBill_currency() { return bill_currency; }
    public void setBill_currency(String bill_currency) { this.bill_currency = bill_currency; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getMop() { return mop; }
    public void setMop(String mop) { this.mop = mop; }

    public String getCcno() { return ccno; }
    public void setCcno(String ccno) { this.ccno = ccno; }

    public String getRrn() { return rrn; }
    public void setRrn(String rrn) { this.rrn = rrn; }

    public String getUpa() { return upa; }
    public void setUpa(String upa) { this.upa = upa; }

    public String getAuthstatus() { return authstatus; }
    public void setAuthstatus(String authstatus) { this.authstatus = authstatus; }

    public String getAuthurl() { return authurl; }
    public void setAuthurl(String authurl) { this.authurl = authurl; }

    public String getAuthdata() { return authdata; }
    public void setAuthdata(String authdata) { this.authdata = authdata; }
}
