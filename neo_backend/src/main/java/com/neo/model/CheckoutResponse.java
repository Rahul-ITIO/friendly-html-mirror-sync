package com.neo.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CheckoutResponse {
    private String transactionId;
    private String status;
    private Double amount;
    private String currency;
    private String message;
}