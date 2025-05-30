package com.webapp.service;

import java.util.List;
import java.util.Map;

import com.webapp.entity.CurrencyExchangeApi;

public interface CurrencyExchangeApiService {
    List<CurrencyExchangeApi> getAllCurrencyExchanges();
    CurrencyExchangeApi getCurrencyExchangeById(Integer id);
    CurrencyExchangeApi saveCurrencyExchange(CurrencyExchangeApi currencyExchange);
    void deleteCurrencyExchange(Integer id);

    // New method for currency conversion
    Map<String, Object> currencyConverter(String fromCurrency, String toCurrency, double amount);

    // New method to save JSON response
    //void saveCurrencyExchangeResponse(Map<String, Object> response);

    // New method to get all currency exchanges sorted by ID in descending order
    List<CurrencyExchangeApi> getAllCurrencyExchangesSortedByIdDesc();

    // New method to fetch the latest currency exchange record by currencyFrom and currencyTo
    CurrencyExchangeApi getLatestCurrencyExchange(String currencyFrom, String currencyTo);
    CurrencyExchangeApi findTopByCurrencyFromAndCurrencyToOrderByIdDesc(String currencyFrom, String currencyTo);

}