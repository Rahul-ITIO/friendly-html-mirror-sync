//The FeeDetailService interface defines methods for managing fee details in an application

package com.webapp.service;

import java.util.List;

import com.webapp.entity.FeeDetail;

public interface FeeDetailService {

	
	FeeDetail addFeeDetail(FeeDetail feeDetail);
	
	FeeDetail getFeeDetailById(int feeDetailId);
	
	FeeDetail getFeeDetailByType(String type);
	
	List<FeeDetail> getAllFeeDetails();
	
}
