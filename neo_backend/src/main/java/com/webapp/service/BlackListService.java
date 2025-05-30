package com.webapp.service;

import com.webapp.entity.BlackList;
import java.util.List;

public interface BlackListService {
    BlackList save(BlackList blackList);
    List<BlackList> findAll();
    List<BlackList> findAllByOrderByIdDesc();
    BlackList findById(Integer id);
    List<BlackList> findByClientId(Integer clientId);
    void delete(Integer id);
    boolean isBlacklisted(Integer clientId, String blacklistType, String blacklistValue);
    List<BlackList> findByTypeAndValue(String blacklistType, String blacklistValue, String condition);
}