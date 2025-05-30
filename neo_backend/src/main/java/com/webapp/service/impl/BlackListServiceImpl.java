package com.webapp.service.impl;

import com.webapp.dao.BlackListDao;
import com.webapp.entity.BlackList;
import com.webapp.service.BlackListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BlackListServiceImpl implements BlackListService {

    @Autowired
    private BlackListDao blackListDao;

    @Override
    public BlackList save(BlackList blackList) {
        if (blackList.getId() == null) {
            blackList.setCreatedDate(LocalDateTime.now());
            blackList.setStatus((short) 1);
        }
        return blackListDao.save(blackList);
    }

    @Override
    public List<BlackList> findAll() {
        return blackListDao.findAll();
    }

    @Override
    public BlackList findById(Integer id) {
        return blackListDao.findById(id).orElse(null);
    }

    @Override
    public List<BlackList> findByClientId(Integer clientId) {
        return blackListDao.findByClientIdAndStatus(clientId, (short) 1);
    }

    @Override
    public void delete(Integer id) {
        BlackList blackList = findById(id);
        if (blackList != null) {
            blackList.setStatus((short) 0);
            blackListDao.save(blackList);
        }
    }

    @Override
    public boolean isBlacklisted(Integer clientId, String blacklistType, String blacklistValue) {
        return blackListDao.existsByClientIdAndBlacklistTypeAndBlacklistValue(clientId, blacklistType, blacklistValue);
    }

    @Override
    public List<BlackList> findByTypeAndValue(String blacklistType, String blacklistValue, String condition) {
        return blackListDao.findByBlacklistTypeAndBlacklistValueAndStatusAndCondition(blacklistType, blacklistValue, (short) 1, condition);
    }

    @Override
    public List<BlackList> findAllByOrderByIdDesc() {
        return blackListDao.findAllByOrderByIdDesc();
    }
}