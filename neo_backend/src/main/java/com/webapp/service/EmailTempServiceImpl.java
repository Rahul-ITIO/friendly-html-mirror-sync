//The EmailTempServiceImpl class provides the service layer methods for managing email template details within the application. It interacts with the EmailTempDetailsDao repository to perform various operations, such as adding, retrieving by ID or code, and listing all email template details. The service layer typically handles business logic and ensures proper interaction between the data layer (DAO) and the rest of the application
package com.webapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.webapp.dao.EmailTempDetailsDao;
import com.webapp.entity.EmailTempDetails;
@Service
public class EmailTempServiceImpl implements EmailTempService{
	@Autowired
	private EmailTempDetailsDao emailTempDetailsDao;
	
	@Override
	public EmailTempDetails addEmailTempDetails(EmailTempDetails emailTempDetails) {
		// TODO Auto-generated method stub
		return emailTempDetailsDao.save(emailTempDetails);
	}

	@Override
	public EmailTempDetails getEmailTempDetailById(int emailTempId) {
		
		Optional<EmailTempDetails> optional = this.emailTempDetailsDao.findById(emailTempId);
		
		if(optional.isPresent()) {
			return optional.get();
		}
		
		return null;
	}

	@Override
	public EmailTempDetails getEmailTempDetailsByCode(String type) {
		// TODO Auto-generated method stub
		return this.emailTempDetailsDao.findByCode(type);
	}

	@Override
	public List<EmailTempDetails> getAllEmailTempDetails() {
		// TODO Auto-generated method stub
		return emailTempDetailsDao.findAll();
	}

}
