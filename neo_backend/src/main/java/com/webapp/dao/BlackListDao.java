package com.webapp.dao;

import com.webapp.entity.BlackList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlackListDao extends JpaRepository<BlackList, Integer> {
    List<BlackList> findByClientIdAndStatus(Integer clientId, Short status);
    List<BlackList> findByBlacklistTypeAndBlacklistValueAndStatusAndCondition(String blacklistType, String blacklistValue, Short status, String condition);
    boolean existsByClientIdAndBlacklistTypeAndBlacklistValue(Integer clientId, String blacklistType, String blacklistValue);
    List<BlackList> findAllByOrderByIdDesc();
}