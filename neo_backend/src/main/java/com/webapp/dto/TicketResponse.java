//the TicketResponse class is used to structure the response for API requests that involve multiple tickets. It extends CommonApiResponse to maintain a consistent response format and includes a List<Ticket> to hold the ticket details being returned. This DTO is typically used in scenarios where a collection of ticket information needs to be retrieved and provided to the client, such as in ticket management or support systems
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;
import com.webapp.entity.Ticket;


public class TicketResponse extends CommonApiResponse  {
	List<Ticket> ticketDetails = new ArrayList<>();

	public List<Ticket> getTicketDetails() {
		return ticketDetails;
	}

	public void setTicketDetails(List<Ticket> ticketDetails) {
		this.ticketDetails = ticketDetails;
	}


}
