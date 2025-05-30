package com.webapp.entity;

import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
@Table(name = "master_trans_table_3", 
indexes = {
    @Index(name = "idx_transaction_date_desc", columnList = "tdate DESC"),
    @Index(name = "idx_trans_id", columnList = "transid DESC"),
    @Index(name = "idx_bill_email", columnList = "bill_email DESC"),
    @Index(name = "idx_trans_status", columnList = "trans_status"),
    @Index(name = "idx_merid", columnList = "merid")
    
})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "transid", unique = true)
    private Long transID;  // Assigned manually in the controller

    @Column(name = "reference")
    private String reference;

    @Column(name = "bearer_token")
    private Long bearerToken;

    @Column(name = "tdate", columnDefinition = "TIMESTAMP(6)")
    private Date transactionDate;

    @Column(name = "bill_amt")
    private Double billAmount;

    @Column(name = "bill_currency")
    private String billCurrency;

    @Column(name = "trans_amt")
    private Double transactionAmount;

    @Column(name = "trans_currency")
    private String transactionCurrency;

    @Column(name = "connector")
    private Long connector;

    @Column(name = "trans_status")
    private Short transactionStatus;
    

    @Column(name = "trans_status_step")
    private Short transactionStatusStep;


    @Column(name = "merID")
    private Long merchantID;

    @Column(name = "feeId")
    private Integer feeId;

    @Column(name = "transaction_flag")
    private String transactionFlag;

    @Column(name = "fullname")
    private String fullName;

    @Column(name = "bill_email")
    private String billEmail;

    @Column(name = "bill_ip")
    private String billIP;

    @Column(name = "terNO")
    private Long terminalNumber;

    @Column(name = "mop")
    private String methodOfPayment;

    @Column(name = "channel_type")
    private Integer channelType;

    @Column(name = "integration_type")
    private String integrationType;

    @Column(name = "buy_mdr_amt")
    private Double buyMdrAmount;

    @Column(name = "sell_mdr_amt")
    private Double sellMdrAmount;

    @Column(name = "buy_txnfee_amt")
    private Double buyTxnFeeAmount;

    @Column(name = "sell_txnfee_amt")
    private Double sellTxnFeeAmount;

    @Column(name = "gst_amt")
    private Double gstAmount;

    @Column(name = "rolling_amt")
    private Double rollingAmount;

    @Column(name = "mdr_cb_amt")
    private Double mdrCashbackAmount;

    @Column(name = "fee_update_timestamp")
    private LocalDateTime feeUpdateTimestamp;

    @Column(name = "remark_status")
    private Short remarkStatus;

    @Column(name = "trans_type")
    private Integer transactionType;

    @Column(name = "settelement_date")
    private LocalDateTime settlementDate;

    @Column(name = "settelement_delay")
    private Integer settlementDelay;

    @Column(name = "rolling_date")
    private LocalDateTime rollingDate;

    @Column(name = "rolling_delay")
    private Integer rollingDelay;

    @Column(name = "risk_ratio")
    private String riskRatio;

    @Column(name = "transaction_period")
    private String transactionPeriod;

    @Column(name = "bank_processing_amount")
    private Double bankProcessingAmount;

    @Column(name = "bank_processing_curr")
    private String bankProcessingCurrency;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "related_transID")
    private String relatedTransactionID;

    @Column(name = "payable_amt_of_txn")
    private Double payableTransactionAmount;

    @Column(name = "mdr_cbk1_amt")
    private Double mdrCashback1Amount;

    @Column(name = "mdr_refundfee_amt")
    private Double mdrRefundFeeAmount;

    @Column(name = "available_rolling")
    private Double availableRolling;

    @Column(name = "available_balance")
    private Double availableBalance;

    @Column(name = "runtime")
    private Integer runtime;

    @Column(name = "remaining_balance_amt")
    private Double remainingBalanceAmount;

    @Column(name = "mature_rolling_fund_amt")
    private Double matureRollingFundAmount;

    @Column(name = "immature_rolling_fund_amt")
    private Double immatureRollingFundAmount;

    // Getters and Setters
    
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    
    public Long getTransID() {
        return transID;
    }
    // Adding the remaining getters and setters
    public void setTransID(Long transID) {
        this.transID = transID;
    }
    
    

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Long getBearerToken() {
        return bearerToken;
    }

    public void setBearerToken(Long bearerToken) {
        this.bearerToken = bearerToken;
    }

    public Date getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(Date transactionDate) {
        this.transactionDate = transactionDate;
    }

    public Double getBillAmount() {
        return billAmount;
    }

    public void setBillAmount(Double billAmount) {
        this.billAmount = billAmount;
    }

    public String getBillCurrency() {
        return billCurrency;
    }

    public void setBillCurrency(String billCurrency) {
        this.billCurrency = billCurrency;
    }

    public Double getTransactionAmount() {
        return transactionAmount;
    }

    public void setTransactionAmount(Double transactionAmount) {
        this.transactionAmount = transactionAmount;
    }

    public String getTransactionCurrency() {
        return transactionCurrency;
    }

    public void setTransactionCurrency(String transactionCurrency) {
        this.transactionCurrency = transactionCurrency;
    }

    public Long getConnector() {
        return connector;
    }

    public void setConnector(Long connector) {
        this.connector = connector;
    }

    public Short getTransactionStatus() {
        return transactionStatus;
    }

    public void setTransactionStatus(Short transactionStatus) {
        this.transactionStatus = transactionStatus;
    }

    public Short getTransactionStatusStep() {
		return transactionStatusStep;
	}

	public void setTransactionStatusStep(Short transactionStatusStep) {
		this.transactionStatusStep = transactionStatusStep;
	}

	public Long getMerchantID() {
        return merchantID;
    }

    public void setMerchantID(Long merchantID) {
        this.merchantID = merchantID;
    }

    public String getTransactionFlag() {
        return transactionFlag;
    }

    public void setTransactionFlag(String transactionFlag) {
        this.transactionFlag = transactionFlag;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getBillEmail() {
        return billEmail;
    }

    public void setBillEmail(String billEmail) {
        this.billEmail = billEmail;
    }

    public String getBillIP() {
        return billIP;
    }

    public void setBillIP(String billIP) {
        this.billIP = billIP;
    }

    public String getIntegrationType() {
        return integrationType;
    }

    public void setIntegrationType(String integrationType) {
        this.integrationType = integrationType;
    }

    public Long getTerminalNumber() {
        return terminalNumber;
    }

    public void setTerminalNumber(Long terminalNumber) {
        this.terminalNumber = terminalNumber;
    }

    public String getMethodOfPayment() {
        return methodOfPayment;
    }

    public void setMethodOfPayment(String methodOfPayment) {
        this.methodOfPayment = methodOfPayment;
    }

    public Integer getChannelType() {
        return channelType;
    }

    public void setChannelType(Integer channelType) {
        this.channelType = channelType;
    }

    public Double getBuyMdrAmount() {
        return buyMdrAmount;
    }

    public void setBuyMdrAmount(Double buyMdrAmount) {
        this.buyMdrAmount = buyMdrAmount;
    }

    public Double getSellMdrAmount() {
        return sellMdrAmount;
    }

    public void setSellMdrAmount(Double sellMdrAmount) {
        this.sellMdrAmount = sellMdrAmount;
    }

    public Double getBuyTxnFeeAmount() {
        return buyTxnFeeAmount;
    }

    public void setBuyTxnFeeAmount(Double buyTxnFeeAmount) {
        this.buyTxnFeeAmount = buyTxnFeeAmount;
    }

    public Double getSellTxnFeeAmount() {
        return sellTxnFeeAmount;
    }

    public void setSellTxnFeeAmount(Double sellTxnFeeAmount) {
        this.sellTxnFeeAmount = sellTxnFeeAmount;
    }

    public Double getGstAmount() {
        return gstAmount;
    }

    public void setGstAmount(Double gstAmount) {
        this.gstAmount = gstAmount;
    }

    public Double getRollingAmount() {
        return rollingAmount;
    }

    public void setRollingAmount(Double rollingAmount) {
        this.rollingAmount = rollingAmount;
    }

    public Double getMdrCashbackAmount() {
        return mdrCashbackAmount;
    }

    public void setMdrCashbackAmount(Double mdrCashbackAmount) {
        this.mdrCashbackAmount = mdrCashbackAmount;
    }

    public LocalDateTime getFeeUpdateTimestamp() {
        return feeUpdateTimestamp;
    }

    public void setFeeUpdateTimestamp(LocalDateTime feeUpdateTimestamp) {
        this.feeUpdateTimestamp = feeUpdateTimestamp;
    }

    public Short getRemarkStatus() {
        return remarkStatus;
    }

    public void setRemarkStatus(Short remarkStatus) {
        this.remarkStatus = remarkStatus;
    }

    public Integer getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(Integer transactionType) {
        this.transactionType = transactionType;
    }

    public LocalDateTime getSettlementDate() {
        return settlementDate;
    }

    public void setSettlementDate(LocalDateTime settlementDate) {
        this.settlementDate = settlementDate;
    }

    public Integer getSettlementDelay() {
        return settlementDelay;
    }

    public void setSettlementDelay(Integer settlementDelay) {
        this.settlementDelay = settlementDelay;
    }

    public LocalDateTime getRollingDate() {
        return rollingDate;
    }

    public void setRollingDate(LocalDateTime rollingDate) {
        this.rollingDate = rollingDate;
    }

    public Integer getRollingDelay() {
        return rollingDelay;
    }

    public void setRollingDelay(Integer rollingDelay) {
        this.rollingDelay = rollingDelay;
    }

    public String getRiskRatio() {
        return riskRatio;
    }

    public void setRiskRatio(String riskRatio) {
        this.riskRatio = riskRatio;
    }

    public String getTransactionPeriod() {
        return transactionPeriod;
    }

    public void setTransactionPeriod(String transactionPeriod) {
        this.transactionPeriod = transactionPeriod;
    }

    public Double getBankProcessingAmount() {
        return bankProcessingAmount;
    }

    public void setBankProcessingAmount(Double bankProcessingAmount) {
        this.bankProcessingAmount = bankProcessingAmount;
    }

    public String getBankProcessingCurrency() {
        return bankProcessingCurrency;
    }

    public void setBankProcessingCurrency(String bankProcessingCurrency) {
        this.bankProcessingCurrency = bankProcessingCurrency;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getRelatedTransactionID() {
        return relatedTransactionID;
    }

    public void setRelatedTransactionID(String relatedTransactionID) {
        this.relatedTransactionID = relatedTransactionID;
    }

    public Double getPayableTransactionAmount() {
        return payableTransactionAmount;
    }

    public void setPayableTransactionAmount(Double payableTransactionAmount) {
        this.payableTransactionAmount = payableTransactionAmount;
    }

    public Double getMdrCashback1Amount() {
        return mdrCashback1Amount;
    }

    public void setMdrCashback1Amount(Double mdrCashback1Amount) {
        this.mdrCashback1Amount = mdrCashback1Amount;
    }

    public Double getMdrRefundFeeAmount() {
        return mdrRefundFeeAmount;
    }

    public void setMdrRefundFeeAmount(Double mdrRefundFeeAmount) {
        this.mdrRefundFeeAmount = mdrRefundFeeAmount;
    }

    public Double getAvailableRolling() {
        return availableRolling;
    }

    public void setAvailableRolling(Double availableRolling) {
        this.availableRolling = availableRolling;
    }

    public Double getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(Double availableBalance) {
        this.availableBalance = availableBalance;
    }

    public Integer getRuntime() {
        return runtime;
    }

    public void setRuntime(Integer runtime) {
        this.runtime = runtime;
    }

    public Integer getFeeId() {
        return feeId;
    }

    public void setFeeId(Integer feeId) {
        this.feeId = feeId;
    }

    public Double getRemainingBalanceAmount() {
        return remainingBalanceAmount;
    }

    public void setRemainingBalanceAmount(Double remainingBalanceAmount) {
        this.remainingBalanceAmount = remainingBalanceAmount;
    }

    public Double getMatureRollingFundAmount() {
        return matureRollingFundAmount;
    }

    public void setMatureRollingFundAmount(Double matureRollingFundAmount) {
        this.matureRollingFundAmount = matureRollingFundAmount;
    }

    public Double getImmatureRollingFundAmount() {
        return immatureRollingFundAmount;
    }

    public void setImmatureRollingFundAmount(Double immatureRollingFundAmount) {
        this.immatureRollingFundAmount = immatureRollingFundAmount;
    }

    


}
