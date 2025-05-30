package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.webapp.entity.Terminal;

@Repository
public interface TerminalDao extends JpaRepository<Terminal, Integer>, JpaSpecificationExecutor<Terminal> {
    Terminal findByPublicKey(String publicKey);
     
    /*
    Terminal findByBussinessUrl(String bussinessUrl);
    Terminal findByConnectorids(String connectorids);
    Terminal findByMerid(Integer merid);
    
    List<Terminal> findByActive(Boolean active);
    List<Terminal> findByTerName(String terName);
    List<Terminal> findByDbaBrandName(String dbaBrandName);
    List<Terminal> findByConnectorids(String connectorids);
    List<Terminal> findByPublicKeyContaining(String publicKey);
    List<Terminal> findByMeridContaining(String merid);
    List<Terminal> findByBussinessUrlContaining(String bussinessUrl);
    List<Terminal> findByTerNameContaining(String terName);
    List<Terminal> findByDbaBrandNameContaining(String dbaBrandName);
    List<Terminal> findByConnectoridsContaining(String connectorids);
    */
}
