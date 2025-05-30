//The EmailTempDetailResponse class serves as a container for sending email template information in response to a request. It encapsulates a list of EmailTempDetails entities and provides methods to access and modify this list. This class helps in structuring responses related to email templates, ensuring consistency and clarity in how email template information is communicated between the server and the client

package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.EmailTempDetails;

public class EmailTempDetailResponse  extends CommonApiResponse {
	List<EmailTempDetails> emailTempDetails = new ArrayList<>();               
    
	public List<EmailTempDetails> getEmailTempDetails() {                      
		return emailTempDetails;                                        
	}                                                             
                                                                  
	public void setEmailTempDetails(List<EmailTempDetails> emailTempDetails) {       
		this.emailTempDetails = emailTempDetails;                             
	}                                                             
                                                                  

}
