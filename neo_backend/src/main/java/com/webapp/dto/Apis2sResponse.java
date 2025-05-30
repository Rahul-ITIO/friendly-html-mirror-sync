package com.webapp.dto;

public class Apis2sResponse {

    private String responseMessage;
    private boolean isSuccess;
    private Object data;

    // Constructor with all fields
    public Apis2sResponse(String responseMessage, boolean isSuccess, Object data) {
        this.responseMessage = responseMessage;
        this.isSuccess = isSuccess;
        this.data = data;
    }

    // Constructor without data field
    public Apis2sResponse(String responseMessage, boolean isSuccess) {
        this.responseMessage = responseMessage;
        this.isSuccess = isSuccess;
        this.data = null; // Ensure data is explicitly set to null if not provided
    }

    // Getters and Setters
    public String getResponseMessage() {
        return responseMessage;
    }

    public void setResponseMessage(String responseMessage) {
        this.responseMessage = responseMessage;
    }

    public boolean isSuccess() {
        return isSuccess;
    }

    public void setSuccess(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
    
    
 	
}
