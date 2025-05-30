//This file defines the TicketController class, which handles HTTP requests related to ticket operations. It provides endpoints for fetching all tickets, fetching a ticket by user ID, and adding a new ticket. The controller interacts with a TicketResource service to perform these operations.

package com.webapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.TicketRequestDto;
import com.webapp.dto.TicketResponse;
import com.webapp.resource.TicketResource;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("api/ticket/")
@CrossOrigin
public class TicketController {
	
	@Autowired
	private TicketResource ticketResource;

	@GetMapping("/fetch/all")
	@Operation(summary = "Api to get ticket By Role")
	public ResponseEntity<TicketResponse> fetchAllTicket() {
		return ticketResource.fetchAllTicket();
	}

	@GetMapping("/fetch/id")
	@Operation(summary = "Api to get ticket By user  id")
	public ResponseEntity<TicketResponse> fetchById(@RequestParam("id") int id) {
		return ticketResource.fetchById(id);
	}
	@PostMapping("/add")
	@Operation(summary = "Api to get ticket By user  id")
	public ResponseEntity<CommonApiResponse> addTicket(@RequestBody TicketRequestDto ticketRequestDto) {
		return ticketResource.addTicket(ticketRequestDto);
	}
}
