package com.webapp.dao;



import lombok.*;


@NoArgsConstructor
@AllArgsConstructor
public class TerminalResponse {
    private Integer id;
    private String publicKey;
    private String merid;
    private String connectorids;
    private String bussinessUrl;
    private String terminalType;
    
    //setter and getter 
	public String getTerminalType() {
		return terminalType;
	}
	public void setTerminalType(String terminalType) {
		this.terminalType = terminalType;
	}
	public String getBussinessUrl() {
		return bussinessUrl;
	}
	public void setBussinessUrl(String bussinessUrl) {
		this.bussinessUrl = bussinessUrl;
	}
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
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
	public String getMerid() {
		return merid;
	}
	public void setMerid(String merid) {
		this.merid = merid;
	}
}
