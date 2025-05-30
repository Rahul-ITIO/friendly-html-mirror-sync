//The TicketResource class is a Spring component designed to handle HTTP requests related to ticket management within an online banking system. It interacts with the TicketDao for CRUD operations on ticket records

package com.webapp.resource;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.dao.TicketDao;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.TicketRequestDto;
import com.webapp.dto.TicketResponse;
import com.webapp.dto.UserListResponseDto;
import com.webapp.entity.Ticket;

@Component
public class TicketResource {
	SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	@Autowired
	private TicketDao ticketDao;
	
	private ObjectMapper objectMapper = new ObjectMapper();
          /**
     * Fetches all tickets from the database.
     * @return ResponseEntity containing a list of all tickets.
     */
	public ResponseEntity<TicketResponse> fetchAllTicket() {
		TicketResponse response=new TicketResponse();
		List<Ticket> list= ticketDao.findAll();
		if (list == null) {
			response.setResponseMessage("failed to fatch tickets.");
			response.setSuccess(true);

			return new ResponseEntity<TicketResponse>(response, HttpStatus.BAD_REQUEST);
		}

		
		response.setTicketDetails(list);
		response.setSuccess(true);
		return new ResponseEntity<TicketResponse>(response, HttpStatus.OK);
	}


	 /**
     * Fetches tickets by user ID.
     * @param id The ID of the user whose tickets are to be fetched.
     * @return ResponseEntity containing tickets for the specified user.
     */
	public ResponseEntity<TicketResponse> fetchById(@RequestParam("id") long id) {
		TicketResponse response=new TicketResponse();
		
		List<Ticket> list= ticketDao.findByUserId(id);
		if (list == null) {
			response.setResponseMessage("failed to fatch tickets.");
			response.setSuccess(true);

			return new ResponseEntity<TicketResponse>(response, HttpStatus.BAD_REQUEST);
		}

		
		response.setTicketDetails(list);
		response.setSuccess(true);
		return new ResponseEntity<TicketResponse>(response, HttpStatus.OK);	
		}

	 /**
       * Adds or updates a ticket in the database.
       * @param registerRequest The ticket details to be added or updated.
       * @return ResponseEntity with status and message.
       */
	public ResponseEntity<CommonApiResponse> addTicket(@RequestBody TicketRequestDto registerRequest) {
		CommonApiResponse response = new CommonApiResponse();
		
                  // Validate input
		if (registerRequest == null) {
			response.setResponseMessage("user is null");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (registerRequest.getUserId() == null || registerRequest.getUserName() == null) {
			response.setResponseMessage("missing input");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		 // Retrieve existing ticket or create a new one
		Ticket ticket=ticketDao.findById(registerRequest.getId());
	    Date date=new Date(); 
	    if(ticket==null) {
	    ticket =new Ticket();
	    ticket.setDate(formatter.format(date));
	    }
		ticket.setUserId(registerRequest.getUserId());
		ticket.setUserName(registerRequest.getUserName());
		ticket.setAssignee(registerRequest.getAssignee());
		ticket.setStatus(registerRequest.getStatus());
		ticket.setPriority(registerRequest.getPriority());
		ticket.setSubject(registerRequest.getSubject());
		ticket.setBody(registerRequest.getBody());
		ticket.setUpdateDate(formatter.format(date));
		// Save or update the ticket
		Ticket Addticket =ticketDao.save(ticket);
		
		if (Addticket == null) {
			response.setResponseMessage("failed to add ticket");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		response.setResponseMessage("Add ticket Successfully");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}
}
