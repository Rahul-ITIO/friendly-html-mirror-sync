package com.webapp.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.entity.CurrencyExchangeApi;

@Repository
public interface CurrencyExchangeApiDao extends JpaRepository<CurrencyExchangeApi, Integer> {
    // For example, to find all CurrencyExchangeApi entities sorted by ID in descending order:
    List<CurrencyExchangeApi> findAllByOrderByIdDesc();

    CurrencyExchangeApi findTopByCurrencyFromAndCurrencyToOrderByIdDesc(String currencyFrom, String currencyTo);
}