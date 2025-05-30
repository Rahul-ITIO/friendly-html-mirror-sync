//the TicketRequestDto class is used to transfer ticket-related information between different parts of an application. It includes various attributes that capture the details of a ticket, such as its identifier, status, priority, and descriptive fields. This DTO helps in managing and processing tickets efficiently within the application, ensuring that all necessary data is conveyed in a structured manner

package com.webapp.dto;

import java.util.Date;

public class TicketRequestDto {
	private long id;
    private Date date;
    private String userName;
    private Long userId;
    private String status;
    private String priority;
    private Date updateDate;
    private String subject;
    private String body;
    private String assignee;
    
    
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getPriority() {
		return priority;
	}
	public void setPriority(String priority) {
		this.priority = priority;
	}
	public Date getUpdateDate() {
		return updateDate;
	}
	public void setUpdateDate(Date updateDate) {
		this.updateDate = updateDate;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public String getAssignee() {
		return assignee;
	}
	public void setAssignee(String assignee) {
		this.assignee = assignee;
	}
    
    

}
