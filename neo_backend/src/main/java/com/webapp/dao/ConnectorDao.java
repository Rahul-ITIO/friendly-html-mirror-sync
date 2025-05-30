package com.webapp.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.webapp.entity.Connector;

public interface ConnectorDao extends JpaRepository<Connector, Long> {
    Connector findByConnectorNumber(String connectorNumber);
   // Optional<Connector> findByConnectorNumr(String connectorNumber);
}