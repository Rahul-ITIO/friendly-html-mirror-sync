package com.webapp.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;


@Entity
@Table(name = "client_info_table", 
indexes = {
	    @Index(name = "idx_user_name_desc", columnList = "user_name DESC"),
	    @Index(name = "idx_email", columnList = "email DESC")
	    
	})  // Quoting to match PostgreSQL
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) // Uses PostgreSQL auto-increment
	private Integer id;


    @Column(name = "user_name")
    private String userName;


    @Column(name = "name")
    private String name;

    
    @Column(name = "email")
    private String email;

    @JsonIgnore
    @Column(name = "password")
    private String password;

    @Column(name = "confirm_password")
    private String confirmpassword;

    @Column(name = "roles")
    private String roles;

    @Column(name = "contact")
    private String contact;

    @Column(name = "street")
    private String street;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "default_currency")
    private String defaultCurrency; // Payin Currency

    @Column(name = "is_account_linked")
    private String isAccountLinked; // Yes, No

    @Column(name = "account_id")
    private String accountId; // to use during KYC

    @Column(name = "account_balance")
    private BigDecimal accountBalance;

    @Column(name = "status")
    private String status; // active, deactivated

    // Add by Prince
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "gender")
    private String gender;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "address")
    private String address;

    @Column(name = "address2")
    private String address2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "country")
    private String country;

    @Column(name = "individual_or_corporate")
    private String individualOrCorporate;

    @Column(name = "employment_status")
    private String employmentStatus;

    @Column(name = "role_in_company")
    private String roleInCompany;

    @Column(name = "business_activity")
    private String businessActivity;

    @Column(name = "enter_activity")
    private String enterActivity;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_registration_number")
    private String companyRegistrationNumber;

    @Column(name = "date_of_incorporation")
    private String dateOfIncorporation;

    @Column(name = "country_of_incorporation")
    private String countryOfIncorporation;

    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "place_of_birth")
    private String placeOfBirth;

    @Column(name = "id_type")
    private String idType;

    @Column(name = "id_number")
    private String idNumber;

    @Column(name = "id_expiry_date")
    private String idExpiryDate;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "profile_img")
    private String profileImg;

    @Column(name = "profile_complete")
    private Boolean profileComplete; // Add By Prince

    @Column(name = "two_factor_enabled")
    private boolean twoFactorEnabled;

    @Column(name = "google_auth_secret")
    private String googleAuthSecret;

    @Column(name = "common_bank_accounts")
    private String commonBankAccounts;
	
	/*
	private String name;
	private String userName;
	private String email;

	@JsonIgnore
	private String password;
	private String confirmpassword;
	private String roles;
	private String contact;
	private String street;
	private String pincode;
	private String isAccountLinked; // Yes, No
	private String accountId; // to use during KYC
	private BigDecimal accountBalance;
	private String status; // active, deactivated

	// Add by Prince
	private String firstName;
	private String lastName;
	private String contactNumber;
	private String gender;
	private String dateOfBirth;
	private String address;
	private String address2;
	private String city;
	private String state;
	private String country;
	private String individualOrCorporate;
	private String employmentStatus;
	private String roleInCompany;
	private String businessActivity;
	private String enterActivity;
	private String companyName;
	private String companyRegistrationNumber;
	private String dateOfIncorporation;
	private String countryOfIncorporation;
	private String companyAddress;
	private String nationality;
	private String placeOfBirth;
	private String idType;
	private String idNumber;
	private String idExpiryDate;
	private String accountNumber;
	private String profileImg;
	private Boolean profileComplete;// Add By Prince
	private boolean twoFactorEnabled;
	private String googleAuthSecret;

	private String commonBankAccounts;
	
	*/

	public String getCommonBankAccounts() {
		return commonBankAccounts;
	}

	public void setCommonBankAccounts(String commonBankAccounts) {
		this.commonBankAccounts = commonBankAccounts;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getGoogleAuthSecret() {
		return googleAuthSecret;
	}

	public void setGoogleAuthSecret(String googleAuthSecret) {
		this.googleAuthSecret = googleAuthSecret;
	}

	public boolean isTwoFactorEnabled() {
		return twoFactorEnabled;
	}

	public void setTwoFactorEnabled(boolean twoFactorEnabled) {
		this.twoFactorEnabled = twoFactorEnabled;
	}

	public Integer getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

	public String getName() {
		return name;
	}

	public Boolean getProfileComplete() {
		return profileComplete;
	}

	public void setProfileComplete(Boolean profileComplete) {
		this.profileComplete = profileComplete;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRoles() {
		return roles;
	}

	public void setRoles(String roles) {
		this.roles = roles;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getContact() {
		return contact;
	}

	public void setContact(String contact) {
		this.contact = contact;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}

	public String getAccountId() {
		return accountId;
	}

	public void setAccountId(String accountId) {
		this.accountId = accountId;
	}

	public String getIsAccountLinked() {
		return isAccountLinked;
	}

	public void setIsAccountLinked(String isAccountLinked) {
		this.isAccountLinked = isAccountLinked;
	}

	public String getDefaultCurrency() {
		return defaultCurrency;
	}

	public void setDefaultCurrency(String defaultCurrency) {
		this.defaultCurrency = defaultCurrency;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public BigDecimal getAccountBalance() {
		return accountBalance;
	}

	public void setAccountBalance(BigDecimal accountBalance) {
		this.accountBalance = accountBalance;
	}

	public String getConfirmpassword() {
		return confirmpassword;
	}

	public void setConfirmpassword(String confirmpassword) {
		this.confirmpassword = confirmpassword;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getContactNumber() {
		return contactNumber;
	}

	public void setContactNumber(String contactNumber) {
		this.contactNumber = contactNumber;
	}

	public String getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(String dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getAddress2() {
		return address2;
	}

	public void setAddress2(String address2) {
		this.address2 = address2;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getIndividualOrCorporate() {
		return individualOrCorporate;
	}

	public void setIndividualOrCorporate(String individualOrCorporate) {
		this.individualOrCorporate = individualOrCorporate;
	}

	public String getEmploymentStatus() {
		return employmentStatus;
	}

	public void setEmploymentStatus(String employmentStatus) {
		this.employmentStatus = employmentStatus;
	}

	public String getRoleInCompany() {
		return roleInCompany;
	}

	public void setRoleInCompany(String roleInCompany) {
		this.roleInCompany = roleInCompany;
	}

	public String getBusinessActivity() {
		return businessActivity;
	}

	public void setBusinessActivity(String businessActivity) {
		this.businessActivity = businessActivity;
	}

	public String getEnterActivity() {
		return enterActivity;
	}

	public void setEnterActivity(String enterActivity) {
		this.enterActivity = enterActivity;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getCompanyRegistrationNumber() {
		return companyRegistrationNumber;
	}

	public void setCompanyRegistrationNumber(String companyRegistrationNumber) {
		this.companyRegistrationNumber = companyRegistrationNumber;
	}

	public String getDateOfIncorporation() {
		return dateOfIncorporation;
	}

	public void setDateOfIncorporation(String dateOfIncorporation) {
		this.dateOfIncorporation = dateOfIncorporation;
	}

	public String getCountryOfIncorporation() {
		return countryOfIncorporation;
	}

	public void setCountryOfIncorporation(String countryOfIncorporation) {
		this.countryOfIncorporation = countryOfIncorporation;
	}

	public String getCompanyAddress() {
		return companyAddress;
	}

	public void setCompanyAddress(String companyAddress) {
		this.companyAddress = companyAddress;
	}

	public String getNationality() {
		return nationality;
	}

	public void setNationality(String nationality) {
		this.nationality = nationality;
	}

	public String getPlaceOfBirth() {
		return placeOfBirth;
	}

	public void setPlaceOfBirth(String placeOfBirth) {
		this.placeOfBirth = placeOfBirth;
	}

	public String getIdType() {
		return idType;
	}

	public void setIdType(String idType) {
		this.idType = idType;
	}

	public String getIdNumber() {
		return idNumber;
	}

	public void setIdNumber(String idNumber) {
		this.idNumber = idNumber;
	}

	public String getIdExpiryDate() {
		return idExpiryDate;
	}

	public void setIdExpiryDate(String idExpiryDate) {
		this.idExpiryDate = idExpiryDate;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getProfileImg() {
		return profileImg;
	}

	public void setProfileImg(String profileImg) {
		this.profileImg = profileImg;
	}

}
