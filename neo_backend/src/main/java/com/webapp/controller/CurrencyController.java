package com.webapp.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.webapp.config.SmtpConfiguration;
import com.webapp.dao.CommonBankAccountDao;
import com.webapp.dao.AdminAccountDao;
import com.webapp.dao.CurrencyDao;
import com.webapp.dao.HostingDetailDao;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.CurrencyResponse;
import com.webapp.dto.HostingDetailResponse;
import com.webapp.dto.CommonBankAccountResponse;
import com.webapp.entity.AdminAccount;
import com.webapp.entity.CommonBankAccount;
import com.webapp.entity.Currency;
import com.webapp.entity.HostingDetail;
import com.webapp.entity.User;

import io.jsonwebtoken.lang.Arrays;

@RestController
@RequestMapping("/api/currencies/")
@CrossOrigin
public class CurrencyController {

    @Autowired
    private CurrencyDao currencyRepository;

    @Autowired
    private CommonBankAccountDao commonBankAccountDao;

    @Autowired
    private HostingDetailDao hostingDetailDao;

    @Autowired
    private AdminAccountDao adminAccountDao;

    private final SmtpConfiguration smtpConfiguration;

    @Autowired
    public CurrencyController(SmtpConfiguration smtpConfiguration) {
        this.smtpConfiguration = smtpConfiguration;
    }

    @PostMapping("add")
    public ResponseEntity<CommonApiResponse> addCurrency(@RequestBody Currency currency) {
        if (currencyRepository.findByCode(currency.getCode()) == null) {
            currencyRepository.save(currency);
        } else {
            if (currency.getIsDefault()) {
                List<Currency> currencies = currencyRepository.findAll();
                // Set all currencies to non-default
                for (Currency cur : currencies) {
                    cur.setIsDefault(false);
                    currencyRepository.save(cur);
                }
            }
            Currency currencyUpdate = currencyRepository.findByCode(currency.getCode());
            currencyUpdate.setCode(currency.getCode());
            currencyUpdate.setName(currency.getName());
            currencyUpdate.setStatus(currency.getStatus());
            currencyUpdate.setTerritory(currency.getTerritory());
            currencyUpdate.setIcon(currency.getIcon());
            currencyUpdate.setIsDefault(currency.getIsDefault());
            currencyRepository.save(currencyUpdate);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("fatch")
    public ResponseEntity<CurrencyResponse> getCurrency() {
        CurrencyResponse currencyRes = new CurrencyResponse();
        List<Currency> a = currencyRepository.findAll();
        currencyRes.setCurrencyDetails(a);
        currencyRes.setResponseMessage("get Data  successfully");
        currencyRes.setSuccess(true);
        return new ResponseEntity<CurrencyResponse>(currencyRes, HttpStatus.OK);
    }

    @PostMapping("delete")
    public ResponseEntity<CommonApiResponse> deleteCurrency(@RequestBody Long id) {
        Optional<Currency> currencyToDeleteOpt = currencyRepository.findById(id);

        if (currencyToDeleteOpt.isPresent()) {
            Currency currencyToDelete = currencyToDeleteOpt.get();

            // Step 1: Remove the association with CommonBankAccounts
            List<CommonBankAccount> bankAccounts = commonBankAccountDao.findAll();
            for (CommonBankAccount bankAccount : bankAccounts) {
                bankAccount.getCurrencyMap().remove(currencyToDelete);
            }
            List<AdminAccount> adminAccounts = adminAccountDao.findAll();
            for (AdminAccount adminAccount : adminAccounts) {
                adminAccount.getCurrencyMap().remove(currencyToDelete);
            }

            // Step 2: Delete the currency entity
            currencyRepository.delete(currencyToDelete);

            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // for Common Bank Account

    @PostMapping("addAccount")
    public ResponseEntity<CommonApiResponse> addAccount(@RequestBody Map<String, Object> accountData) {
        CommonBankAccount commonBankAccount = new CommonBankAccount();
        commonBankAccount.setBeneficiary(accountData.get("beneficiary").toString());
        commonBankAccount.setBankName(accountData.get("bankName").toString());
        commonBankAccount.setIban(accountData.get("iban").toString());
        commonBankAccount.setSwiftCode(accountData.get("swiftCode").toString());
        commonBankAccount.setBankAddress(accountData.get("bankAddress").toString());
        commonBankAccount.setStatus(accountData.get("status").toString());

        // Convert currency IDs to Currency objects
        List<String> currencyIds = (List<String>) accountData.get("currencyMap");
        List<Currency> currencies = new ArrayList<>();
        for (String currencyId : currencyIds) {
            Currency currency = currencyRepository.findByCode(currencyId);
            if (currency != null) {
                currencies.add(currency);
            } else {
                // Handle the case where currency with the given ID doesn't exist
                // You may choose to throw an exception or log a warning
            }
        }
        commonBankAccount.setCurrencyMap(currencies);

        // Check if the account with the given IBAN already exists
        CommonBankAccount existingAccount = commonBankAccountDao.findByIban(commonBankAccount.getIban());
        if (existingAccount == null) {
            // Save the new account
            commonBankAccountDao.save(commonBankAccount);
        } else {
            // Update the existing account
            existingAccount.setBeneficiary(commonBankAccount.getBeneficiary());
            existingAccount.setBankName(commonBankAccount.getBankName());
            existingAccount.setStatus(commonBankAccount.getStatus());
            existingAccount.setBankAddress(commonBankAccount.getBankAddress());
            existingAccount.setSwiftCode(commonBankAccount.getSwiftCode());
            existingAccount.setCurrencyMap(currencies);

            commonBankAccountDao.save(existingAccount);
        }

        // Return a response indicating success
        return ResponseEntity.ok().build();
    }

    @GetMapping("fatchAccount")
    public ResponseEntity<CommonBankAccountResponse> getCAccount() {
        CommonBankAccountResponse currencyRes = new CommonBankAccountResponse();

        List<CommonBankAccount> a = commonBankAccountDao.findAll();
        currencyRes.setCommonBankAccountDetais(a);

        List<AdminAccount> b = adminAccountDao.findAll();
        currencyRes.setAdminAccountDetais(b); // For Admin Accunts........

        currencyRes.setResponseMessage("get Data  successfully");
        currencyRes.setSuccess(true);
        return new ResponseEntity<CommonBankAccountResponse>(currencyRes, HttpStatus.OK);
    }

    @PostMapping("deleteAccount")
    public ResponseEntity<CommonApiResponse> deleteAccount(@RequestBody CommonBankAccount a) {
        // CommonBankAccount a=id;
        a.setCurrencyMap(new ArrayList<Currency>());
        commonBankAccountDao.save(a);
        commonBankAccountDao.deleteById(a.getId());

        return ResponseEntity.ok().build();
    }

    // for Hosting Details

    @GetMapping("fatchHostDetail")
    public ResponseEntity<HostingDetailResponse> fatchHostDetail() {
        HostingDetailResponse hostingDetailRes = new HostingDetailResponse();
        HostingDetail hostingDetail = hostingDetailDao.findFirstById(Long.parseLong("0"));
        hostingDetailRes.setHostingDetail(hostingDetail);
        hostingDetailRes.setResponseMessage("get Data  successfully");
        hostingDetailRes.setSuccess(true);
        return new ResponseEntity<HostingDetailResponse>(hostingDetailRes, HttpStatus.OK);
    }

    // Import other necessary packages

    @PostMapping("/updateHostDetail")
    public ResponseEntity<CommonApiResponse> updateHostDetail(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("logo") String logo, @RequestParam("shortName") String shortName,
            @RequestParam("longName") String longName, @RequestParam("contact") String contact,
            @RequestParam("email") String email, @RequestParam("address") String address,
            @RequestParam("headerColor") String headerColor, @RequestParam("sidebarColor") String sidebarColor,
            @RequestParam("smtpHost") String smtpHost, @RequestParam("smtpPort") int smtpPort,
            @RequestParam("smtpUsername") String smtpUsername, @RequestParam("smtpPassword") String smtpPassword) {
        try {
            // Process the received data
            if (image != null) {
                uploadLogoImage(image);
            }
            HostingDetail hostingDetail = hostingDetailDao.findFirstById(0L);
            hostingDetail.setShortName(shortName == null ? "" : shortName);
            hostingDetail.setLongName(longName == null ? "" : longName);
            hostingDetail.setContact(contact == null ? "" : contact);
            hostingDetail.setEmail(email == null ? "" : email);
            hostingDetail.setAddress(address == null ? "" : address);
            hostingDetail.setHeaderColor(headerColor == null ? "" : headerColor);
            hostingDetail.setSidebarColor(sidebarColor == null ? "" : sidebarColor);
            hostingDetail.setSmtpHost(smtpHost);
            hostingDetail.setSmtpPort(smtpPort);
            hostingDetail.setSmtpUsername(smtpUsername);
            hostingDetail.setSmtpPassword(smtpPassword);

            // Save the hosting detail
            hostingDetailDao.save(hostingDetail);

            // Initialize SMTP configuration
            smtpConfiguration.init();

            // Return a response indicating success
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Handle exceptions appropriately
            return ResponseEntity.badRequest().build();
        }
    }

    public void uploadLogoImage(MultipartFile image) {
        CommonApiResponse response = new CommonApiResponse();
        String profileImageUploadDir = "D:\\Files\\online-banking-system-frontend\\src\\images";
        try {
            // Ensure the directory exists, create if not
            Path directoryPath = Paths.get(profileImageUploadDir);
            Files.createDirectories(directoryPath);
            // Generate a unique filename for the uploaded image
            String filename = "Logo_" + image.getOriginalFilename();
            Path filePath = Paths.get(profileImageUploadDir, filename);

            HostingDetail hostingDetail = hostingDetailDao.findFirstById(Long.parseLong("0"));
            hostingDetail.setLogo(filename);
            hostingDetailDao.save(hostingDetail);
            Files.write(filePath, image.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // for Admin Account

    @GetMapping("fatchAdminAccount")
    public ResponseEntity<CommonBankAccountResponse> getAdminAccount() {
        CommonBankAccountResponse currencyRes = new CommonBankAccountResponse();
        List<AdminAccount> a = adminAccountDao.findAll();
        currencyRes.setAdminAccountDetais(a);
        currencyRes.setResponseMessage("get Data  successfully");
        currencyRes.setSuccess(true);
        return new ResponseEntity<CommonBankAccountResponse>(currencyRes, HttpStatus.OK);
    }

    @PostMapping("addAdminAccount")
    public ResponseEntity<CommonApiResponse> addAdminAccount(@RequestBody Map<String, Object> accountData) {
        AdminAccount adminAccount = new AdminAccount();
        adminAccount.setId(0L);
        adminAccount.setBeneficiary(accountData.get("beneficiary").toString());
        adminAccount.setBankName(accountData.get("bankName").toString());
        adminAccount.setIban(accountData.get("iban").toString());
        adminAccount.setSwiftCode(accountData.get("swiftCode").toString());
        adminAccount.setBankAddress(accountData.get("bankAddress").toString());
        adminAccount.setBeneficiaryAddress(accountData.get("beneficiaryAddress").toString());

        // Convert currency IDs to Currency objects
        List<String> currencyIds = (List<String>) accountData.get("currencyMap");
        List<Currency> currencies = new ArrayList<>();
        for (String currencyId : currencyIds) {
            Currency currency = currencyRepository.findByCode(currencyId);
            if (currency != null) {
                currencies.add(currency);
            } else {
                // Handle the case where currency with the given ID doesn't exist
                // You may choose to throw an exception or log a warning
            }
        }
        adminAccount.setCurrencyMap(currencies);

        // Check if the account with the given IBAN already exists
        AdminAccount existingAccount = adminAccountDao.findFirstById(0L);
        if (existingAccount == null) {
            // Save the new account
            adminAccountDao.save(adminAccount);
        } else {
            // Update the existing account
            existingAccount.setBeneficiary(adminAccount.getBeneficiary());
            existingAccount.setBankName(adminAccount.getBankName());
            existingAccount.setBeneficiaryAddress(adminAccount.getBeneficiaryAddress());
            existingAccount.setBankAddress(adminAccount.getBankAddress());
            existingAccount.setSwiftCode(adminAccount.getSwiftCode());
            existingAccount.setCurrencyMap(currencies);

            adminAccountDao.save(existingAccount);
        }

        // Return a response indicating success
        return ResponseEntity.ok().build();
    }
}
