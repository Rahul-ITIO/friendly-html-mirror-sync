package com.webapp.dto;

import java.util.List;
import com.webapp.entity.Connector;

public class ConnectorResponse {
    private boolean success;
    private String responseMessage;
    private List<Connector> connectors;

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
    public List<Connector> getConnectors() { return connectors; }
    public void setConnectors(List<Connector> connectors) { this.connectors = connectors; }
}