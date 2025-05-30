//The purpose of this code is to define a repository interface for the Ticket entity in a Spring Boot application that uses Spring Data JPA

package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.webapp.entity.Ticket;

public interface TicketDao extends JpaRepository<Ticket, Integer> {
	
	Ticket findById(long id);
	
	List<Ticket> findByUserId(long id);
}
