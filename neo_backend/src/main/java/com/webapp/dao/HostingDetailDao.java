//The HostingDetailDao interface provides CRUD operations for HostingDetail entities through the JpaRepository interface. This allows you to perform standard database operations such as creating, reading, updating, and deleting HostingDetail records

package com.webapp.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.HostingDetail;

@Repository
public interface HostingDetailDao extends JpaRepository<HostingDetail, Long> {

    HostingDetail findFirstById(Long id);

}
