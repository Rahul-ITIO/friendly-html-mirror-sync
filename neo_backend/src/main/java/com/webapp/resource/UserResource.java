package com.webapp.resource;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webapp.config.CustomUserDetailsService;
import com.webapp.dao.CurrencyDao;
import com.webapp.dao.UserAccountDao;
import com.webapp.dto.CommonApiResponse;
import com.webapp.dto.RegisterUserRequestDto;
import com.webapp.dto.UserAccountDto;
import com.webapp.dto.UserListResponseDto;
import com.webapp.dto.UserLoginRequest;
import com.webapp.dto.UserLoginResponse;
import com.webapp.dto.UserProfileUpdateDto;
import com.webapp.dto.UserStatusUpdateRequestDto;
import com.webapp.entity.AuthenticationResponse;
import com.webapp.entity.Bank;
import com.webapp.entity.Currency;
import com.webapp.entity.User;
import com.webapp.entity.UserAccounts;
import com.webapp.service.BankService;
import com.webapp.service.EmailService;
import com.webapp.service.JwtService;
import com.webapp.service.UserService;
import com.webapp.utility.Constants.IsAccountLinked;
import com.webapp.utility.Constants.UserRole;
import com.webapp.utility.Constants.UserStatus;
import com.webapp.utility.TransactionIdGenerator;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import com.webapp.service.TwoFactorAuthenticationService;

@Component
public class UserResource {
	private String profileImageUploadDir;

	private final Logger LOG = LoggerFactory.getLogger(UserResource.class);

	@Autowired
	private UserService userService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private CustomUserDetailsService customUserDetailsService;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private BankService bankService;

	@Autowired
	private EmailService emailService;

	@Autowired
	private UserAccountDao userAccountDao;

	@Autowired
	private CurrencyDao currencyDao;

	private ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
	private TwoFactorAuthenticationService tfaService;

	public AuthenticationResponse TFA(UserLoginRequest request) {
		//The method begins by fetching the User object from the database using the email ID provided in the UserLoginRequest object
		//This is done through a userService that typically interacts with the database or repository layer
		User user = userService.getUserByEmail(request.getEmailId());
		
		//Sets the TwoFactorEnabled flag for the user based on whether 2FA is required or not. This value is derived from the request object
		user.setTwoFactorEnabled(request.isTwoFactorRequired());

		// Check if 2FA is Required: If isTwoFactorRequired is true
		if (request.isTwoFactorRequired()) {
			//Disable TwoFactorEnabled: Sets TwoFactorEnabled to false temporarily to handle new secret generation
			user.setTwoFactorEnabled(false);
			//Generate New Secret: Uses the tfaService to generate a new secret key for Google Authenticator or a similar 2FA app. The generated secret is stored in the googleAuthSecret field of the User object
			user.setGoogleAuthSecret(tfaService.generateNewSecret());
		}
                //After modifying the user object (either enabling or generating a new 2FA secret), the user is updated in the database using the userService
		userService.updateUser(user);
		
		//Generate JWT Access Token: The jwtService is called to generate a JWT (JSON Web Token) based on the user's information. This token is used for authenticating the user in subsequent requests
		var jwtToken = jwtService.generateToken(user.toString());
		//Initialize Refresh Token: A refresh token is also initialized as an empty string, likely intended to be filled later or unused in this specific scenario
		var refreshToken = "";
		
		//A new AuthenticationResponse object is created to hold the response details
		AuthenticationResponse response = new AuthenticationResponse();
		//Set QR Code URI for 2FA: If 2FA is enabled, a QR code URI is generated using the user's googleAuthSecret. This URI is intended to be scanned by a 2FA app (like Google Authenticator) to set up 2FA
		response.setSecretImageUri(tfaService.generateQrCodeImageUri(user.getGoogleAuthSecret()));
		
		//Set Access and Refresh Tokens: Adds the JWT token to the response and includes the refresh token
		response.setAccessToken(jwtToken);
		
		//Set Access and Refresh Tokens: Adds the JWT token to the response and includes the refresh token
		response.setRefreshToken(refreshToken);
		
		//Set MFA Status: Adds the status of whether MFA is enabled or not, as per the request
		response.setMfaEnabled(request.isTwoFactorRequired());

		return response;
	}

	public ResponseEntity<AuthenticationResponse> verifyCode(UserLoginRequest verificationRequest) {
		//create AuthenticationResponse object which will be used to hold the response data that will be return to the client
		AuthenticationResponse response = new AuthenticationResponse();
		
               //check if the user by given mail exist in system
		if (userService.getUserByEmail(verificationRequest.getEmailId()) == null) {
			//userService.getUserByEmail fetch the user object based on email id provided in the verificationRequest
			return new ResponseEntity<AuthenticationResponse>(response, HttpStatus.BAD_REQUEST);
		}
		//if user exist, the method retrieves the User object using the email ID from the verificationRequest
		User user = userService.getUserByEmail(verificationRequest.getEmailId());
		//tfaService.isOtpNotValid(...) is a method that verifies the provided OTP (One-Time Password) or 2FA code against the user's secret key (GoogleAuthSecret)
		if (tfaService.isOtpNotValid(user.getGoogleAuthSecret(), verificationRequest.getTwoFactorCode())) {
                //If the code is not valid, it immediately returns a BAD REQUEST response (HTTP status 400), indicating that the 2FA verification has failed
			return new ResponseEntity<AuthenticationResponse>(response, HttpStatus.BAD_REQUEST);
		}
		//If the 2FA code is valid, the method generates a new JWT (JSON Web Token) for the authenticated user
		//creates a token based on the user's name or other relevant information, which will be used for authenticating future requests
		var jwtToken = jwtService.generateToken(user.getName());
		
		//Generates and sets a QR code image URI for the user's secret key, which is useful for reconfiguring 2FA if needed
		response.setSecretImageUri(tfaService.generateQrCodeImageUri(user.getGoogleAuthSecret()));
		
		//Sets the newly generated JWT token in the response to be used by the client for future authentication
		response.setAccessToken(jwtToken);
		
		//Sets the mfaEnabled field in the response based on the user's current 2FA status
		response.setMfaEnabled(user.isTwoFactorEnabled());
		//The user's TwoFactorEnabled status is explicitly set to true, indicating that 2FA is now enabled for this user
		user.setTwoFactorEnabled(true);
		
		// Updates the user record in the database to reflect the change in the 2FA status
		userService.updateUser(user);

		return new ResponseEntity<AuthenticationResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> registerUser(RegisterUserRequestDto request) {

		LOG.info("Received request for register user");
                 //Creates a new CommonApiResponse object to store the response message and success status.
		CommonApiResponse response = new CommonApiResponse();
		
                //Checks if the registration request object (RegisterUserRequestDto) is null
		if (request == null) {
			response.setResponseMessage("user is null");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
               //Retrieves an existing user by their email address using userService.getUserByEmail.
		User existingUser = this.userService.getUserByEmail(request.getEmail());
		
              //If a user is found with the same email, returns a 400 BAD REQUEST response indicating that the email is already registered
		if (existingUser != null) {
			response.setResponseMessage("User with this Email Id already resgistered!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
		//Similarly checks if a user with the given username already exists.
		existingUser = this.userService.getUserByUsername(request.getUserName());
		
                //If a user is found, returns a 400 BAD REQUEST response indicating that the username is already taken
		if (this.userService.getUserByUsername(request.getUserName()) != null) {
			response.setResponseMessage("User with this User Name Id already resgistered!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                //Ensures that the user has provided a role
		if (request.getRoles() == null) {
			response.setResponseMessage("bad request ,Role is missing");
			response.setSuccess(false);
                        //If no role is provided, returns a 400 BAD REQUEST response indicating that the role is missing
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		Bank bank = null;
               //Converts the RegisterUserRequestDto into a User entity that can be stored in the database
		User user = RegisterUserRequestDto.toUserEntity(request);
		
                //Initializes variables for encoding the password, raw password, and account ID.
		String encodedPassword = "";

		String rawPassword = request.getPassword();
		String accountId = "";
		
		//Sets the initial account balance to zero
		user.setAccountBalance(BigDecimal.ZERO);
		
                //Sets the status to PENDING, marks the account as not linked, and indicates the profile is incomplete
		if (request.getRoles().equals(UserRole.ROLE_CUSTOMER.value())) {
			user.setStatus(UserStatus.PENDING.value());
			user.setIsAccountLinked(IsAccountLinked.NO.value());
			user.setProfileComplete(false);
			user.setUserName(request.getUserName());
			
                       //Generates a unique account ID.
			accountId = TransactionIdGenerator.generateAccountId();
			// rawPassword = TransactionIdGenerator.generatePassword();

			user.setAccountId(accountId);
                        //Encodes the raw password using passwordEncoder.
			encodedPassword = passwordEncoder.encode(rawPassword);

		}

		// in case of Bank, password will come from UI
		else {
			user.setStatus(UserStatus.ACTIVE.value());
			encodedPassword = passwordEncoder.encode(user.getPassword());
		}
                //Sets the encoded password to the user object.
		user.setPassword(encodedPassword);
		
                  //Registers the user by calling userService.registerUser
		existingUser = this.userService.registerUser(user);
		
              //If registration fails, returns a 400 BAD REQUEST response indicating the failure
		if (existingUser == null) {
			response.setResponseMessage("failed to register user");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
               //If the user is a customer, sends a confirmation email with the generated password.
		if (request.getRoles().equals(UserRole.ROLE_CUSTOMER.value())) {

			String subject = " Your Temporary Password for Bank Registration";

			sendPasswordGenerationMail(user, accountId, rawPassword, subject);
		}
               //Sets the success message and status for the response.
		response.setResponseMessage("User registered Successfully");
		response.setSuccess(true);

		// Attempts to convert the CommonApiResponse object to a JSON string (likely for debugging or logging purposes)
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
              // Returns a 200 OK response with the success message.
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> registerAdmin(RegisterUserRequestDto registerRequest) {
               //Creates an instance of CommonApiResponse to store the response message and success status
		CommonApiResponse response = new CommonApiResponse();
		
               //Checks if the registration request object (RegisterUserRequestDto) is null
		if (registerRequest == null) {
			response.setResponseMessage("user is null");
			response.setSuccess(true);
                      //If null, it returns a 400 BAD REQUEST response indicating that the user data is missing
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
                 //Checks if either the email or password is null
		if (registerRequest.getEmail() == null || registerRequest.getPassword() == null) {
			response.setResponseMessage("missing input");
			response.setSuccess(true);
                     // If any are missing, returns a 400 BAD REQUEST response indicating that the input data is incomplete
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
                //Uses userService.getUserByEmail to check if a user with the provided email already exists
		User existingUser = this.userService.getUserByEmail(registerRequest.getEmail());

		if (existingUser != null) {
			response.setResponseMessage("User already register with this Email");
			response.setSuccess(true);
                    // If an existing user is found, it returns a 400 BAD REQUEST response with a message that the email is already registered
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
              //Creates a new User object and sets its properties based on the registration request
		User user = new User();
		user.setUserName(registerRequest.getUserName());//userName is set to the username provided in the request
		user.setEmail(registerRequest.getEmail());//email is set to the email provided in the request
		user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));//password is encoded using passwordEncoder.encode to securely store it.
		user.setRoles(UserRole.ROLE_ADMIN.value());//roles is set to ROLE_ADMIN, indicating the user is an admin
		user.setStatus(UserStatus.ACTIVE.value());//status is set to ACTIVE, meaning the admin is active

		//Attempts to register the new user using userService.registerUser
		existingUser = this.userService.registerUser(user);
		
               //If the registration fails (e.g., due to database issues), it returns a 400 BAD REQUEST response indicating the failure
		if (existingUser == null) {
			response.setResponseMessage("failed to register admin");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
               // Sets the success message and status to indicate that the admin was registered successfully
		response.setResponseMessage("Admin registered Successfully");
		response.setSuccess(true);

		// Attempts to convert the CommonApiResponse object to a JSON string using objectMapper.
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
               //Prints the JSON string to the console (likely for debugging or logging purposes)
		System.out.println(jsonString);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<UserLoginResponse> login(UserLoginRequest loginRequest) {
		
               //Creates an instance of UserLoginResponse to hold the response data, including messages, success status, user details, and JWT token
		UserLoginResponse response = new UserLoginResponse();
		
                //Checks if the loginRequest object (of type UserLoginRequest) is null
		if (loginRequest == null) {
			response.setResponseMessage("Missing Input");
			response.setSuccess(false);
			//If null, it returns a 400 BAD REQUEST response indicating missing input
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}

		String jwtToken = null;
		User user = null;
              //Attempts to authenticate the user using the authenticationManager with the provided email and password.
		try {
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(loginRequest.getEmailId(), loginRequest.getPassword()));
		} 
			//If authentication fails (throws an exception), it enters the catch block to handle the error
		catch (Exception ex) {
                   //Retrieves a user by their email (or username) using userService.getUserByUsername
			User chekU = userService.getUserByUsername(loginRequest.getEmailId());

			//If a user is found (chekU != null), checks if the credentials match
			if (chekU != null) {
				//If they match, proceeds with the login process.
				if (loginRequest.getPassword().equals(chekU.getPassword())
						&& loginRequest.getEmailId().equals(chekU.getUserName())) {
				} 
					//If they don't match, returns a 400 BAD REQUEST response indicating an invalid email, username, or password
				else {
					response.setResponseMessage("Invalid email, username or password.");
					response.setSuccess(false);
					return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
				}
			} 
				//If no user is found, also returns a 400 BAD REQUEST response
			else {
				response.setResponseMessage("Invalid email, username or password.");
				response.setSuccess(false);
				return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
			}
		}

		UserDetails userDetails;
		//Checks if the EmailId contains the "@" character to differentiate between email and username:
		if (loginRequest.getEmailId().contains("@")) {
			//If it contains "@", treats it as an email and loads user details accordingly
			userDetails = customUserDetailsService.loadUserByUsername(loginRequest.getEmailId());
			user = userService.getUserByEmail(loginRequest.getEmailId());
		}
			//If not, treats it as a username
		else {
			//Retrieves the corresponding user details from the database
			userDetails = customUserDetailsService.loadUserByUsername(loginRequest.getEmailId());
			user = userService.getUserByUsername(loginRequest.getEmailId());
		}

		// if (user == null || !user.getStatus().equals(UserStatus.ACTIVE.value())) {
		// response.setResponseMessage("You have registered successfully, wait for
		// approval from admin side.");
		// response.setSuccess(false);
		// return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		// }
                  //Iterates through the user's roles (GrantedAuthority objects) to check if any match the requested role (loginRequest.getRole()).
		/*
		for (GrantedAuthority grantedAuthority : userDetails.getAuthorities()) {
			//If a match is found, generates a JWT token for the user using jwtService.generateToken
			if (grantedAuthority.getAuthority().equals(loginRequest.getRole())) {
				jwtToken = jwtService.generateToken(userDetails.getUsername());
			}
		}
		*/

		jwtToken = jwtService.generateToken(userDetails.getUsername());

		// If a JWT token was successfully generated (jwtToken != null), it sets the user details,success message, and token in the response and returns a 200 OK response.
		if (jwtToken != null) {
			response.setUser(user);
			response.setResponseMessage("Logged in successfully");
			response.setSuccess(true);
			response.setJwtToken(jwtToken);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} else {
			response.setResponseMessage("Failed to login");
			response.setSuccess(false);
			//If no token was generated, returns a 400 BAD REQUEST response indicating a failed login
			return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
		}
	}

	public ResponseEntity<UserListResponseDto> getUsersByRole(String role) {
		
          //Creates an instance of UserListResponseDto to hold the list of users, response messages, and a success flag
		UserListResponseDto response = new UserListResponseDto();
		
               //Declares an empty list of User objects named users
		List<User> users = new ArrayList<>();
		
		//Calls the userService.getUserByRoles(role) method to fetch users from the database whose roles match the provided role string
		//Assigns the result to the users list
		users = this.userService.getUserByRoles(role);
		
                 //Checks if the users list is not empty
		if (!users.isEmpty()) {
			//If the list has users, it sets the list in the response object using response.setUsers(users)
			response.setUsers(users);
		}
                //Sets a success message ("User Fetched Successfully") in the response.
		response.setResponseMessage("User Fetched Successfully");
		
		//Marks the operation as successful by setting response.setSuccess(true)
		response.setSuccess(true);

		// Attempts to convert the response object into a JSON string using objectMapper.writeValueAsString(response)
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} 
	        //If the conversion throws a JsonProcessingException, it catches the exception and prints the stack trace
		catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<UserListResponseDto> fetchBankManagers() {
		
              //Creates an instance of UserListResponseDto to hold the list of users, a response message, and a success flag.
		UserListResponseDto response = new UserListResponseDto();
		
                //Initializes an empty list users to store the users retrieved from the database.
		List<User> users = new ArrayList<>();

		//Calls userService.getUsersByRolesAndStatus(...) to fetch all users who have the role of "Bank Manager" (UserRole.ROLE_BANK.value()) and are currently active (UserStatus.ACTIVE.value()).
		//Assigns the result to the users list
		users = this.userService.getUsersByRolesAndStatus(UserRole.ROLE_BANK.value(), UserStatus.ACTIVE.value());
		
                //Checks if the users list is not empty
		if (!users.isEmpty()) {
			//If it contains users, it sets the list in the response object using response.setUsers(users)
			response.setUsers(users);
		}
                //If it contains users, it sets the list in the response object using response.setUsers(users)
		//Marks the operation as successful by setting response.setSuccess(true).
		response.setResponseMessage("User Fetched Successfully");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> updateUserStatus(UserStatusUpdateRequestDto request) {

		LOG.info("Received request for updating the user status");
		
               //Creates an instance of CommonApiResponse, which will hold the response data to be returned to the client
		CommonApiResponse response = new CommonApiResponse();
		
               //Checks if the request object is null. If it is, sets the response message to "bad request, missing data" and returns a 400 Bad Request HTTP status
		if (request == null) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		
               //Checks if the userId is 0 (which is considered invalid). If so, sets an appropriate response message and returns a 400 Bad Request HTTP status
		if (request.getUserId() == 0) {
			response.setResponseMessage("bad request, user id is missing");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User user = null;
		//Fetches the user by userId using a service (userService).
		user = this.userService.getUserById(request.getUserId());
		
               //Sets the user's status to the new status provided in the request.
		user.setStatus(request.getStatus());
		
		//Marks the user profile as incomplete (profileComplete set to false).
		user.setProfileComplete(false);
		
                //Attempts to update the user in the database with the new status.
		User updatedUser = this.userService.updateUser(user);
		
               //If the user was successfully updated (updatedUser is not null):
		if (updatedUser != null) {
			long a = userAccountDao.count() + 1;
			//Generates a new account number (AcNo) based on the current count of user accounts in the database
			String AcNo = "000000" + a;
			//Creates a new UserAccounts object and populates it with details like user ID, account balance (set to 0), account number, and status ("Active").
			UserAccounts userAccount = new UserAccounts();
			userAccount.setUserId(String.valueOf(user.getId()));
			userAccount.setAccountBalance(BigDecimal.ZERO);
			userAccount.setAccountNumber(AcNo);
			userAccount.setCurrency("");
			userAccount.setStatus("Active");
			List<Currency> currencies = currencyDao.findAll();
			// Set all currencies to non-default

			//Loops through the list of currencies and assigns the code of the default currency to the new user account.
			for (Currency cur : currencies) {
				if (cur.getIsDefault()) {
					userAccount.setCurrency(cur.getCode());
				}
			}
			//Saves the userAccount to the database
			userAccountDao.save(userAccount);
			// create defoult account
                        //Sets a success message indicating that the user's status has been updated successfully.
			response.setResponseMessage("User " + request.getStatus() + " Successfully!!!");
			response.setSuccess(true);
			//Returns a 200 OK HTTP status with the response.
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} else {
			//If the user update fails (updatedUser is null), sets a failure message
			response.setResponseMessage("Failed to " + request.getStatus() + " the user");
			response.setSuccess(true);
			//If the user update fails (updatedUser is null), sets a failure message
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	public ResponseEntity<UserListResponseDto> fetchBankCustomerByBankId(int bankId) {
                //Creates an instance of UserListResponseDto to hold the response data that will be sent back to the client
		UserListResponseDto response = new UserListResponseDto();
		
                //Initializes an empty list of User objects to store the fetched users who match certain criteria.
		List<User> users = new ArrayList<>();
		
                //Calls the userService to fetch users with the role of "customer" (UserRole.ROLE_CUSTOMER) and status "active" (UserStatus.ACTIVE).
		//The method getUsersByRolesAndStatus returns a list of users matching the provided role and status
		users = this.userService.getUsersByRolesAndStatus(UserRole.ROLE_CUSTOMER.value(), UserStatus.ACTIVE.value());
		
                //If the list of users is not empty, it sets this list in the response object (response).
		if (!users.isEmpty()) {
			response.setUsers(users);
		}
		
                //Sets a success message indicating that the users were fetched successfully.
		response.setResponseMessage("User Fetched Successfully");
		
		//Sets the success flag to true in the response object.
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	// public ResponseEntity<UserListResponseDto> searchBankCustomer(int bankId,
	// String customerName) {
	//
	// UserListResponseDto response = new UserListResponseDto();
	//
	// List<User> users = new ArrayList<>();
	//
	// users = this.userService.searchBankCustomerByNameAndRole(customerName,
	// bankId, UserRole.ROLE_CUSTOMER.value());
	//
	// if(!users.isEmpty()) {
	// response.setUsers(users);
	// }
	//
	// response.setResponseMessage("User Fetched Successfully");
	// response.setSuccess(true);
	//
	// // Convert the object to a JSON string
	// String jsonString = null;
	// try {
	// jsonString = objectMapper.writeValueAsString(response);
	// } catch (JsonProcessingException e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// }
	//
	// System.out.println(jsonString);
	//
	// return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	// }

	public ResponseEntity<UserListResponseDto> searchBankCustomer(String customerName) {
		
                //Creates an instance of UserListResponseDto to hold the response data, which will be sent back to the client
		UserListResponseDto response = new UserListResponseDto();
		
                //Initializes an empty list of User objects to store the results of the customer search
		List<User> users = new ArrayList<>();
                //Calls the userService method searchBankCustomerByNameAndRole to search for users whose names match the customerName parameter and have the role of "customer" (UserRole.ROLE_CUSTOMER)
		//The search is based on the customer's name and their role
		users = this.userService.searchBankCustomerByNameAndRole(customerName, UserRole.ROLE_CUSTOMER.value());

		//If the list of users is not empty, it sets this list in the response object.
		//If no users are found, the list remains empty, but the method will still return a response indicating success
		if (!users.isEmpty()) {
			response.setUsers(users);
		}
                //Sets a success message indicating that the search operation completed successfully, regardless of whether any users were found.
		response.setResponseMessage("User Fetched Successfully");
		//Sets the success flag to true in the response object
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	private void sendPasswordGenerationMail(User customer, String accountId, String rawPassord, String subject) {

		StringBuilder emailBody = new StringBuilder();
		emailBody.append("<html><body>");
		emailBody.append("<h3>Dear " + customer.getUserName() + ",</h3>");
		emailBody.append("<p>Welcome aboard! You are Register Successfully.</p>");
		emailBody.append("<p>Click on below link to login.</p>");
		emailBody.append("</br>");
		emailBody.append("<a href='http://localhost:3000/'>Login Here</a>");

		// emailBody.append("<p>Welcome aboard! We've generated a temporary password for
		// you.</p>");
		// emailBody.append("</br> Your Account Id is:<span><b>" + accountId +
		// "</b><span></p>");
		// emailBody.append("</br> Your Password is:<span><b>" + rawPassord +
		// "</b><span></p>");

		// emailBody.append("<p>Please use generated Password for login.</p>");
		emailBody.append("<p>use Account Id for KYC At Login time.</p>");

		emailBody.append("<p>Best Regards,<br/>Bank</p>");

		emailBody.append("</body></html>");

		this.emailService.sendEmail(customer.getEmail(), subject, emailBody.toString());
	}

	public ResponseEntity<UserListResponseDto> fetchPendingCustomers() {

		UserListResponseDto response = new UserListResponseDto();

		List<User> users = new ArrayList<>();
		users = this.userService.getUsersByRolesAndStatus(UserRole.ROLE_CUSTOMER.value(), UserStatus.PENDING.value());

		if (!users.isEmpty()) {
			response.setUsers(users);
		}

		response.setResponseMessage("Pending Customers Fetched Successful!!!");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	//Dev Tech : 28-03-25 : Fetch Active Customers for DropDown
	public ResponseEntity<UserListResponseDto> fetchActiveCustomers() {
		UserListResponseDto response = new UserListResponseDto();
		List<User> users = new ArrayList<>();
		users = this.userService.getUsersByRolesAndStatus(UserRole.ROLE_CUSTOMER.value(), UserStatus.ACTIVE.value());

		if (!users.isEmpty()) {
			List<User> filteredUsers = users.stream()
				.map(user -> {
					User filteredUser = new User();
					filteredUser.setId(user.getId());
					filteredUser.setUserName(user.getUserName());
					filteredUser.setName(user.getName());
					return filteredUser;
				})
				.collect(Collectors.toList());
			response.setUsers(filteredUsers);
		}

		response.setResponseMessage("Active Customers Fetched Successful!!!");
		response.setSuccess(true);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	
	public ResponseEntity<UserListResponseDto> fetchById(int id) {

		UserListResponseDto response = new UserListResponseDto();

		User user = this.userService.getUserById(id);

		response.setUsers(Arrays.asList(user));

		response.setResponseMessage("User Fetched Successfully");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserListResponseDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> updateUserprofile(RegisterUserRequestDto request) {

		LOG.info("Received request for update user profile");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getId() == 0) {
			response.setResponseMessage("bad request - missing input");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User existingUser = this.userService.getUserByEmail(request.getEmail());

		if (existingUser == null) {
			response.setResponseMessage("Customer Profile not found!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		existingUser.setCity(request.getCity());
		existingUser.setContact(request.getContact());

		if (org.apache.commons.lang3.StringUtils.isNotEmpty(request.getGender())) {
			existingUser.setGender(request.getGender());
		}

		existingUser.setName(request.getName());
		existingUser.setPincode(request.getPincode());
		existingUser.setStreet(request.getStreet());

		User updatedUser = this.userService.updateUser(existingUser);

		if (updatedUser == null) {
			response.setResponseMessage("failed to update the user profile");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		response.setResponseMessage("User Profile Updated Successful!!!");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> forgetPassword(UserLoginRequest request) {

		LOG.info("Received request for forget password");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getEmailId() == null) {
			response.setResponseMessage("bad request - missing input");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User existingUser = this.userService.getUserByEmail(request.getEmailId());

		if (existingUser == null) {
			response.setResponseMessage("User with this Email Id not registered, please register & login!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		}

		sendResetEmail(existingUser, "Reset Password - Online Banking");

		response.setResponseMessage("We have sent you reset password Link on your email id!!!");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	private void sendResetEmail(User user, String subject) {

		StringBuilder emailBody = new StringBuilder();
		emailBody.append("<html><body>");
		emailBody.append("<h3>Dear " + user.getName() + ",</h3>");
		emailBody.append("<p>You can reset the password by using the below link.</p>");
		emailBody.append("</br>");
		emailBody.append("<a href='http://localhost:3000/" + user.getId()
				+ "/reset-password'>Click me to reset the password</a>");

		emailBody.append("<p>Best Regards,<br/>Bank</p>");
		emailBody.append("</body></html>");

		this.emailService.sendEmail(user.getEmail(), subject, emailBody.toString());
	}

	public ResponseEntity<CommonApiResponse> resetPassword(UserLoginRequest request) {

		LOG.info("Received request for forget password");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null || request.getUserId() == 0 || request.getPassword() == null) {
			response.setResponseMessage("bad request - missing input");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User existingUser = this.userService.getUserById(request.getUserId());

		if (existingUser == null) {
			response.setResponseMessage("User with this Email Id not registered, please register & login!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		}

		existingUser.setPassword(passwordEncoder.encode(request.getPassword()));

		User updatedPassword = this.userService.updateUser(existingUser);

		if (updatedPassword == null) {
			response.setResponseMessage("Failed to Reset the password!!!");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
		}

		response.setResponseMessage("Password Reset Successful!!!");
		response.setSuccess(true);

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	// Add By Prince For Update Profile...
	public ResponseEntity<CommonApiResponse> updateUserData(UserProfileUpdateDto request) {

		LOG.info("Received request for update user profile");

		CommonApiResponse response = new CommonApiResponse();

		if (request == null) {
			response.setResponseMessage("bad request - missing input");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		User existingUser = this.userService.getUserByEmail(request.getEmail());

		if (existingUser == null) {
			response.setResponseMessage("Customer Profile not found!!!");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
		if (org.apache.commons.lang3.StringUtils.isNotEmpty(request.getGender())) {
			existingUser.setGender(request.getGender());
		}
		existingUser.setName(request.getLastName() == null ? request.getName()
				: request.getFirstName() + " " + request.getLastName());
		existingUser.setPincode(request.getPincode());
		existingUser.setStreet(request.getStreet());
		existingUser.setEmail(request.getEmail());
		existingUser.setRoles(request.getRoles());
		existingUser.setContact(request.getContact());
		existingUser.setIsAccountLinked(request.getIsAccountLinked());
		existingUser.setAccountId(request.getAccountId());
		existingUser.setStatus(request.getStatus());
		existingUser.setFirstName(request.getFirstName());
		existingUser.setLastName(request.getLastName());
		existingUser.setContactNumber(request.getContactNumber());
		existingUser.setGender(request.getGender());
		existingUser.setDefaultCurrency(request.getDefaultCurrency());
		existingUser.setDateOfBirth(request.getDateOfBirth());
		existingUser.setAddress(request.getAddress());
		existingUser.setAddress2(request.getAddress2());
		existingUser.setCity(request.getCity());
		existingUser.setState(request.getState());
		existingUser.setCountry(request.getCountry());
		existingUser.setIndividualOrCorporate(request.getIndividualOrCorporate());
		existingUser.setEmploymentStatus(request.getEmploymentStatus());
		existingUser.setRoleInCompany(request.getRoleInCompany());
		existingUser.setBusinessActivity(request.getBusinessActivity());
		existingUser.setEnterActivity(request.getEnterActivity());
		existingUser.setCompanyName(request.getCompanyName());
		existingUser.setCompanyRegistrationNumber(request.getCompanyRegistrationNumber());
		existingUser.setDateOfIncorporation(request.getDateOfIncorporation());
		existingUser.setCountryOfIncorporation(request.getCountryOfIncorporation());
		existingUser.setCompanyAddress(request.getCompanyAddress());
		existingUser.setNationality(request.getNationality());
		existingUser.setPlaceOfBirth(request.getPlaceOfBirth());
		existingUser.setIdType(request.getIdType());
		existingUser.setIdNumber(request.getIdNumber());
		existingUser.setIdExpiryDate(request.getIdExpiryDate());
		existingUser.setAccountNumber(request.getAccountNumber());
		existingUser.setProfileComplete(true);
		existingUser.setCommonBankAccounts(request.getCommonBankAccounts());

		User updatedUser = this.userService.updateUser(existingUser);

		if (updatedUser == null) {
			response.setResponseMessage("failed to update the user profile");
			response.setSuccess(true);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		response.setResponseMessage("User Profile Updated Successful!!!");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> uploadProfileImage(Long userId, MultipartFile image) {
		CommonApiResponse response = new CommonApiResponse();
		profileImageUploadDir = "C:\\Users\\sys1\\Desktop\\online-banking-system-frontend\\src\\customerPhotos";

		try {

			// Check if the image is not empty
			if (image.isEmpty()) {
				return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
			}

			// Ensure the directory exists, create if not
			Path directoryPath = Paths.get(profileImageUploadDir);
			Files.createDirectories(directoryPath);

			// Generate a unique filename for the uploaded image
			String filename = userId + "_" + image.getOriginalFilename();
			Path filePath = Paths.get(profileImageUploadDir, filename);

			User existingUser = this.userService.getUserById(Integer.valueOf(userId.toString()));
			if (existingUser == null) {
				response.setResponseMessage("User Dosn't Exist!!!");
				response.setSuccess(false);

				return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
			}
			existingUser.setProfileImg(filename);

			User updatedProfile = this.userService.updateUser(existingUser);

			if (updatedProfile == null) {
				response.setResponseMessage("Failed to  updated Profile!!!");
				response.setSuccess(false);

				return new ResponseEntity<CommonApiResponse>(response, HttpStatus.INTERNAL_SERVER_ERROR);
			}
			// Save the image to the file system
			Files.write(filePath, image.getBytes());

			// Optionally, you can save the file path or filename to the database for future
			// retrieval

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}
	}

	public ResponseEntity<UserAccountDto> findByUserId(String userId) {

		UserAccountDto response = new UserAccountDto();
		List<UserAccounts> accounts = new ArrayList<UserAccounts>();
		if (userId.equalsIgnoreCase("0")) {
			accounts = this.userAccountDao.findAll();
		} else {
			accounts = this.userAccountDao.findByUserId(userId);
		}
		response.setAccounts(accounts);

		// response.setResponseMessage("User Fetched Successfully");
		// response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserAccountDto>(response, HttpStatus.OK);
	}

	// public ResponseEntity<UserAccountDto> addAccount(UserAccountDto account) {
	//
	// UserAccountDto response = new UserAccountDto();
	//
	// List<UserAccounts> accounts = this.userAccountDao.findByUserId(userId);
	//
	// response.setAccounts(accounts);
	//
	//// response.setResponseMessage("User Fetched Successfully");
	//// response.setSuccess(true);
	//
	// // Convert the object to a JSON string
	// String jsonString = null;
	// try {
	// jsonString = objectMapper.writeValueAsString(response);
	// } catch (JsonProcessingException e) {
	// // TODO Auto-generated catch block
	// e.printStackTrace();
	// }
	//
	// System.out.println(jsonString);
	//
	// return new ResponseEntity<UserAccountDto>(response, HttpStatus.OK);
	// }

	// User Accounts
	public ResponseEntity<UserAccountDto> fetchPendingCustomersAccounts() {

		UserAccountDto response = new UserAccountDto();

		List<UserAccounts> users = new ArrayList<>();
		users = this.userAccountDao.findByStatus(UserStatus.PENDING.value());

		if (!users.isEmpty()) {
			response.setAccounts(users);
		}

		response.setResponseMessage("Pending Customers Fetched Successful!!!");
		response.setSuccess(true);

		// Convert the object to a JSON string
		String jsonString = null;
		try {
			jsonString = objectMapper.writeValueAsString(response);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		System.out.println(jsonString);

		return new ResponseEntity<UserAccountDto>(response, HttpStatus.OK);
	}

	public ResponseEntity<CommonApiResponse> updateAccountStatus(Map<String, String> request) {
		int userId = Integer.valueOf(request.get("userId").toString());
		String status = request.get("status").toString();
		LOG.info("Received request for updating the user status");
		CommonApiResponse response = new CommonApiResponse();
		if (request.isEmpty()) {
			response.setResponseMessage("bad request, missing data");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		if (userId == 0) {
			response.setResponseMessage("bad request, user id is missing");
			response.setSuccess(false);

			return new ResponseEntity<CommonApiResponse>(response, HttpStatus.BAD_REQUEST);
		}

		UserAccounts user = null;
		user = this.userAccountDao.findById(userId);
		user.setStatus(status);
		if (status.equalsIgnoreCase("Success")) {
			List<UserAccounts> list = userAccountDao.findByStatus(UserStatus.ACTIVE.value());
			long a = list.size() + 1;
			Currency obj = currencyDao.findByCode(request.get("currencyId").toString());
			String AcNo = obj.getId() + String.format("%06d", a);
			user.setStatus("Active");
			user.setAccountNumber(AcNo);

		}

		this.userAccountDao.save(user);
		response.setResponseMessage("User " + status + " Successfully!!!");
		response.setSuccess(true);
		return new ResponseEntity<CommonApiResponse>(response, HttpStatus.OK);

	}

}
