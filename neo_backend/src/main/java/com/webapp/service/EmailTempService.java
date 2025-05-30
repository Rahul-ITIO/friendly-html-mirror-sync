//The EmailTempService interface establishes a set of methods that any class implementing this interface must provide. It outlines the operations for managing email template details, serving as a contract for how these operations should be executed
package com.webapp.service;

import java.util.List;

import com.webapp.entity.EmailTempDetails;

public interface EmailTempService {
	
	EmailTempDetails addEmailTempDetails(EmailTempDetails emailTempDetails);
	
	EmailTempDetails getEmailTempDetailById(int EmailTempId);
	
	EmailTempDetails getEmailTempDetailsByCode(String type);
	
	List<EmailTempDetails> getAllEmailTempDetails();
}
