//The CurrencyResponse class serves as a container for sending currency-related information in response to a request. It encapsulates a list of Currency entities and provides methods to access and modify this list. This DTO ensures that currency information is communicated in a structured and consistent manner between the server and client, facilitating easier data handling and presentation

package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.Currency;

public class CurrencyResponse extends CommonApiResponse {
	List<Currency> currencyDetails = new ArrayList<>();

	public List<Currency> getCurrencyDetails() {
		return currencyDetails;
	}

	public void setCurrencyDetails(List<Currency> currencyDetails) {
		this.currencyDetails = currencyDetails;
	}

}
