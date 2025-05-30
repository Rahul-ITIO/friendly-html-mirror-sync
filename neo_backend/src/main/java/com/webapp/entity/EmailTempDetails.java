//The EmailTempDetails class is used to store and manage details related to email templates within the database. It includes fields for the subject and body of the email as well as a code for additional categorization or identification. This entity facilitates the use of predefined email templates in the system, enabling consistent and efficient email communication

package com.webapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
@Entity
public class EmailTempDetails {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id; // ID field
	    private String emailSubject;
	    @Column(length = 1000) 
	    private String emailMessage;
	    private String code;


	    public Long getId() {
	        return id;
	    }

	    public void setId(Long id) {
	        this.id = id;
	    }

	    public String getEmailSubject() {
	        return emailSubject;
	    }

	    public void setEmailSubject(String emailSubject) {
	        this.emailSubject = emailSubject;
	    }

	    public String getEmailMessage() {
	        return emailMessage;
	    }

	    public void setEmailMessage(String emailMessage) {
	        this.emailMessage = emailMessage;
	    }

	    public String getCode() {
	        return code;
	    }

	    public void setCode(String code) {
	        this.code = code;
	    }

}
