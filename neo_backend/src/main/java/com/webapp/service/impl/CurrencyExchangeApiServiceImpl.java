package com.webapp.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.webapp.dao.CurrencyExchangeApiDao;
import com.webapp.entity.CurrencyExchangeApi;
import com.webapp.service.CurrencyExchangeApiService;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class CurrencyExchangeApiServiceImpl implements CurrencyExchangeApiService {

    @Autowired
    private CurrencyExchangeApiDao currencyExchangeApiDao;

    private static final String API_KEY = "aac84d61afmsha9a687286f524cap19ff6bjsn8f6e1bdd1777";
    private static final String API_URL = "https://currency-converter18.p.rapidapi.com/api/v1/convert";

    @Override
    public List<CurrencyExchangeApi> getAllCurrencyExchanges() {
        return currencyExchangeApiDao.findAll();
    }

    @Override
    public List<CurrencyExchangeApi> getAllCurrencyExchangesSortedByIdDesc() {
        return currencyExchangeApiDao.findAllByOrderByIdDesc();
    }

    @Override
    public CurrencyExchangeApi getCurrencyExchangeById(Integer id) {
        return currencyExchangeApiDao.findById(id).orElse(null);
    }

    @Override
    public CurrencyExchangeApi saveCurrencyExchange(CurrencyExchangeApi currencyExchange) {
        // Validate the currency exchange data if needed
        return currencyExchangeApiDao.save(currencyExchange);
    }

    @Override
    public void deleteCurrencyExchange(Integer id) {
        currencyExchangeApiDao.deleteById(id);
    }

    @Override
    public Map<String, Object> currencyConverter(String fromCurrency, String toCurrency, double amount) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Build the API URL
            String url = String.format("%s?from=%s&to=%s&amount=%f", API_URL, fromCurrency, toCurrency, amount);
            
            System.out.println("Currency conversion request: " + url);

            // Create HTTP request with headers
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("X-RapidAPI-Host", "currency-converter18.p.rapidapi.com")
                .header("X-RapidAPI-Key", API_KEY)
                .GET()
                .build();

            // Send the request
            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Process the response
            System.out.println("Currency conversion response status: " + response.statusCode());
            
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                // Log the raw response for debugging
                System.out.println("Currency conversion raw response: " + response.body());
                
                // Parse JSON response
                ObjectMapper objectMapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = objectMapper.readValue(response.body(), Map.class);
                
                // Check if the response contains an error message
                if (responseBody.containsKey("error")) {
                    result.put("success", false);
                    result.put("message", "API Error: " + responseBody.get("error"));
                    System.out.println("Currency conversion API error: " + responseBody.get("error"));
                    return result;
                }
                
                // Check if the result field exists
                if (!responseBody.containsKey("result")) {
                    result.put("success", false);
                    result.put("message", "Invalid API response format: 'result' field missing");
                    System.out.println("Currency conversion invalid response format: 'result' field missing");
                    return result;
                }
                
                // Extract conversion rates from the response
                @SuppressWarnings("unchecked")
                Map<String, Object> resultData = (Map<String, Object>) responseBody.get("result");
                
                if (resultData != null && resultData.containsKey("convertedAmount")) {
                    double convertedAmount = Double.parseDouble(resultData.get("convertedAmount").toString());
                    double conversionRate = convertedAmount / amount;
                    
                    result.put("success", true);
                    result.put("data", responseBody);
                    result.put("convertedAmount", convertedAmount);
                    result.put("conversionRates", conversionRate);
                    
                    // Save the JSON response to the database
                    String currencyJson = response.body();
                    saveCurrencyJson(fromCurrency, toCurrency, amount, currencyJson);
                } else {
                    result.put("success", false);
                    result.put("message", "Invalid API response format: missing conversion data");
                    System.out.println("Currency conversion invalid response format: missing conversion data");
                }
            } else {
                result.put("success", false);
                result.put("message", "Failed to fetch currency conversion data. Status code: " + response.statusCode());
                System.out.println("Currency conversion failed with status code: " + response.statusCode());
                // Log the error response body
                System.out.println("Error response: " + response.body());
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            System.out.println("Currency conversion exception: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    @Override
    public CurrencyExchangeApi getLatestCurrencyExchange(String currencyFrom, String currencyTo) {
        return currencyExchangeApiDao.findTopByCurrencyFromAndCurrencyToOrderByIdDesc(currencyFrom, currencyTo);
    }

    @Override
    public CurrencyExchangeApi findTopByCurrencyFromAndCurrencyToOrderByIdDesc(String currencyFrom, String currencyTo) {
        return currencyExchangeApiDao.findTopByCurrencyFromAndCurrencyToOrderByIdDesc(currencyFrom, currencyTo);
    }

    public CurrencyExchangeApi saveCurrencyJson(String fromCurrency, String toCurrency, double amountToConvert, String currencyJson) {
        CurrencyExchangeApi currencyExchange = new CurrencyExchangeApi();
        currencyExchange.setCurrencyFrom(fromCurrency);
        currencyExchange.setCurrencyTo(toCurrency);
        currencyExchange.setAmountToConvert(String.valueOf(amountToConvert));
        currencyExchange.setCurrencyJson(currencyJson);

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> jsonMap = objectMapper.readValue(currencyJson, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) jsonMap.get("result");

            if (result != null) {
                double convertedAmount = Double.parseDouble(result.get("convertedAmount").toString());
                double conversionRate = convertedAmount / amountToConvert;
                currencyExchange.setComments("Conversion rate: " + conversionRate);

                currencyExchange.setConvertedAmount(String.valueOf(convertedAmount));
                currencyExchange.setConversionRates(String.valueOf(conversionRate));

            } else {
                currencyExchange.setComments("Conversion rate could not be calculated");
            }
        } catch (Exception e) {
            currencyExchange.setComments("Error parsing currencyJson: " + e.getMessage());
        }

        currencyExchange.setTimestamp(LocalDateTime.now());
        return currencyExchangeApiDao.save(currencyExchange);
    }

   
}