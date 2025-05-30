package com.webapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.webapp.entity.CurrencyExchangeApi;
import com.webapp.service.CurrencyExchangeApiService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currency-exchange")
public class CurrencyExchangeApiController {

    @Autowired
    private CurrencyExchangeApiService currencyExchangeApiService;

    @GetMapping
    public List<CurrencyExchangeApi> getAllCurrencyExchangesSortedByIdDesc() {
        return currencyExchangeApiService.getAllCurrencyExchangesSortedByIdDesc();
    }

    @GetMapping("/{id}")
    public CurrencyExchangeApi getCurrencyExchangeById(@PathVariable Integer id) {
        return currencyExchangeApiService.getCurrencyExchangeById(id);
    }

    @GetMapping("/{gateway}/{fromCurrency}/{toCurrency}/{getAmount}")
    public Map<String, Object> dbCurrencyConverter(@PathVariable String gateway, @PathVariable String fromCurrency, @PathVariable String toCurrency, @PathVariable String getAmount) {
        return commonDbCurrencyConverter(currencyExchangeApiService, fromCurrency, toCurrency, getAmount, gateway, "false");
    }

    @PostMapping
    public CurrencyExchangeApi createCurrencyExchange(@RequestBody CurrencyExchangeApi currencyExchange) {
        // Get values from the request
        String fromCurrency = currencyExchange.getCurrencyFrom();
        String toCurrency = currencyExchange.getCurrencyTo();
        double amount = 1.0; // Default amount if not specified
        
        amount = Double.parseDouble(currencyExchange.getAmountToConvert());
        
        try {
            // Call the currency converter service to get the JSON response
            Map<String, Object> conversionResult = currencyExchangeApiService.currencyConverter(fromCurrency, toCurrency, amount);
            
            String jsonResponse = "";
            // Convert the response to a JSON string and save it in the currencyJson field
            if (conversionResult.get("success") != null && (boolean) conversionResult.get("success")) {
                 jsonResponse = conversionResult.get("data").toString();
                currencyExchange.setCurrencyJson(jsonResponse);
            } else {
                // Handle error case
                currencyExchange.setCurrencyJson("Conversion failed: " + conversionResult.get("message"));
            }
            
            // Set the timestamp to current time
            currencyExchange.setTimestamp(LocalDateTime.now());
            
            
            return currencyExchange;
            
            
            // Save the currency exchange
            //return currencyExchangeApiService.saveCurrencyExchange(currencyExchange);
        } catch (Exception e) {
            // Handle exceptions
            currencyExchange.setCurrencyJson("Error during conversion: " + e.getMessage());
            return currencyExchangeApiService.saveCurrencyExchange(currencyExchange);
        }
    }


    public static Map<String, Object> commonDbCurrencyConverter(CurrencyExchangeApiService currencyExchangeApiService, String fromCurrency, String toCurrency, String getAmount, String gateway, String results) {
       
        Boolean qp = false;
        if (gateway != null && gateway.equals("qp" )) qp = true;

        if(qp){
            System.out.println("gateway: " + gateway);
            System.out.println("Converting from " + fromCurrency + " to " + toCurrency + ", amount: " + getAmount);
        }

        if (results == null) {
            results = "false";
        }
        double amount = Double.parseDouble(getAmount.toString());
        Map<String, Object> jsonResponse = new HashMap<>();
        jsonResponse.put("fromCurrency", fromCurrency);
        jsonResponse.put("toCurrency", toCurrency);
        jsonResponse.put("amountToConvert", getAmount);

        //Boolean isGateway = Boolean.parseBoolean(gateway.toString());
        //Boolean isResults = Boolean.parseBoolean(results.toString());

        Boolean isInsertDb = false;

        Double conversion_rates = 0.0;
        double convertedAmount = 0.0;

        //latest descending order for db values where is fromCurrency and toCurrency
        CurrencyExchangeApi currencyExchange = currencyExchangeApiService.findTopByCurrencyFromAndCurrencyToOrderByIdDesc(fromCurrency, toCurrency);
         //Check if the currency exchange exists in the database
        if (currencyExchange != null) {
           // Check if the conversion rates are up to date
            if (currencyExchange.getTimestamp() != null && currencyExchange.getTimestamp().isAfter(LocalDateTime.now().minusHours(2))) {
                // Return the existing conversion rates
                try {
                    conversion_rates = Double.parseDouble(currencyExchange.getConversionRates());
                    //String convertedAmount = currencyExchange.getConvertedAmount();

                    convertedAmount = (amount * conversion_rates);
                    jsonResponse.put("conversion_rates", conversion_rates);
                    jsonResponse.put("converted_amount_accurate", convertedAmount);
                    jsonResponse.put("response_from", "db");
                    if(qp) System.out.println("Using cached conversion rate from DB: " + conversion_rates);
                } catch (NumberFormatException e) {
                    if(qp) System.out.println("Error parsing conversion rate from DB: " + e.getMessage());
                    isInsertDb = true;
                }
            }
            else {
                isInsertDb = true;
            }
        }
        else {
            isInsertDb = true;
        }

        if(isInsertDb) 
        {
            if(qp) System.out.println("Fetching fresh conversion rate from API");
            // Call the currency converter service to get the conversion result with insert in db also
            Map<String, Object> conversionResult = currencyExchangeApiService.currencyConverter(fromCurrency, toCurrency, amount);
            // Check if the conversion was successful
            if (conversionResult.get("success") != null && (boolean) conversionResult.get("success")) {
                // Update the currency exchange object with the new conversion rates
                if (conversionResult.get("conversionRates") != null) {
                    conversion_rates = Double.parseDouble(conversionResult.get("conversionRates").toString());
                    if(qp) System.out.println("Got conversion rate from API: " + conversion_rates);
                } else {
                    // If conversionRates is not directly available, try to calculate it
                    if(qp) System.out.println("conversionRates not found in API response, trying alternative calculation");
                    if (conversionResult.get("convertedAmount") != null) {
                        double convertedAmountValue = Double.parseDouble(conversionResult.get("convertedAmount").toString());
                        conversion_rates = convertedAmountValue / amount;
                        if(qp) System.out.println("Calculated conversion rate: " + conversion_rates);
                    } else {
                        return Map.of("error", "Conversion failed: Missing conversion rate data");
                    }
                }
                
                convertedAmount = (amount * conversion_rates);

                jsonResponse.put("conversion_rates", conversion_rates);
                jsonResponse.put("converted_amount_accurate", convertedAmount);
                jsonResponse.put("response_from", "api");
                
            } else {
                // Handle error case with more detailed error message
                String errorMsg = "Conversion failed";
                if (conversionResult.get("message") != null) {
                    errorMsg += ": " + conversionResult.get("message");
                } else if (conversionResult.get("error") != null) {
                    errorMsg += ": " + conversionResult.get("error");
                }
                if(qp) System.out.println(errorMsg);
                return Map.of("error", errorMsg);
            }
        }
       
        // Apply gateway or discount logic
        if (gateway != null && ( gateway.equals("wd" ) || gateway.equals("wdresponse" ) )) { // for withdraw as a discount
            convertedAmount -= (convertedAmount * 1.553 / 100); // 1.553%
            jsonResponse.put("cal_rate", "- 1.553%");
        }
        else{ // for transaction 
            convertedAmount += (convertedAmount * 2.676 / 100); // 2.676%
            jsonResponse.put("cal_rate", "+ 2.676%");
        }

        convertedAmount = Math.round(convertedAmount * 100.0) / 100.0; // Round to 2 decimal places
       
        //convertedAmount = Math.round(convertedAmount * 10000.0) / 10000.0; // Round to 4 decimal places
       
        jsonResponse.put("convertedAmount", convertedAmount);
        if(qp) System.out.println("Final converted amount: " + convertedAmount);

        return jsonResponse;
    }
}