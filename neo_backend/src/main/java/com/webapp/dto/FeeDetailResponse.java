//The FeeDetailResponse class serves as a container for sending fee-related information in response to a request. It encapsulates a list of FeeDetail entities and provides methods to access and modify this list. This class helps in structuring responses related to fee details, ensuring consistency and clarity in how fee information is communicated between the server and the client

package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.FeeDetail;

public class FeeDetailResponse extends CommonApiResponse {

	List<FeeDetail> feeDetails = new ArrayList<>();

	public List<FeeDetail> getFeeDetails() {
		return feeDetails;
	}

	public void setFeeDetails(List<FeeDetail> feeDetails) {
		this.feeDetails = feeDetails;
	}

}
