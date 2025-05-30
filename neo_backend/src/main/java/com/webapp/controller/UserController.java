package com.webapp.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
import com.webapp.entity.User;
import com.webapp.entity.UserAccounts;
import com.webapp.resource.UserResource;
import com.webapp.service.UserServiceImpl;
import com.webapp.utility.Constants.UserStatus;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("api/user/")
@CrossOrigin
public class UserController {

	@Autowired
	private UserResource userResource;

	@Autowired
	private UserAccountDao userAccountDao;

	@Autowired
	private UserServiceImpl userServiceImpl;

	/****************** Start Api For Two Fector Authontication *******************/
	@PostMapping("tfa")
	@Operation(summary = "Api to register customer or bank user")
	public AuthenticationResponse twoFectorAthontication(@RequestBody UserLoginRequest request) {
		return this.userResource.TFA(request);
	}

	@PostMapping("verify")
	public ResponseEntity<?> verifyCode(@RequestBody UserLoginRequest verificationRequest) {
		return userResource.verifyCode(verificationRequest);
	}

	/********* End Api For Two Fector Authontication *********/

	// for customer and bank register
	@PostMapping("register")
	@Operation(summary = "Api to register customer or bank user")
	public ResponseEntity<CommonApiResponse> registerUser(@RequestBody RegisterUserRequestDto request) {
		return this.userResource.registerUser(request);
	}

	// RegisterUserRequestDto, we will set only email, password & role from UI
	@PostMapping("/admin/register")
	public ResponseEntity<CommonApiResponse> registerAdmin(@RequestBody RegisterUserRequestDto request) {
		return userResource.registerAdmin(request);
	}

	@PostMapping("login")
	@Operation(summary = "Api to login any User")
	public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest userLoginRequest) {
		return userResource.login(userLoginRequest);
	}

	@GetMapping("/fetch/role")
	@Operation(summary = "Api to get Users By Role")
	public ResponseEntity<UserListResponseDto> fetchAllBankUsers(@RequestParam("role") String role) {
		return userResource.getUsersByRole(role);
	}

	@GetMapping("/fetch/id")
	@Operation(summary = "Api to get Users By id")
	public ResponseEntity<UserListResponseDto> fetchById(@RequestParam("id") int id) {
		return userResource.fetchById(id);
	}

	@GetMapping("/fetch/customer/pending/request")
	@Operation(summary = "Api to get Users By Role")
	public ResponseEntity<UserListResponseDto> fetchPendingCustomers() {
		return userResource.fetchPendingCustomers();
	}

	//Dev Tech : 28-03-25 : Fetch Active Customers for DropDown
	@GetMapping("/fetch/customer/active/request")
	@Operation(summary = "Api to get Active Users By Role")
	public ResponseEntity<UserListResponseDto> fetchActiveCustomers() {
		return userResource.fetchActiveCustomers();
	}

	@GetMapping("/fetch/bank/managers")
	@Operation(summary = "Api to get Bank Managers who is not assigned to any other Bank")
	public ResponseEntity<UserListResponseDto> fetchBankManagers() {
		return userResource.fetchBankManagers();
	}

	@PostMapping("update/status")
	@Operation(summary = "Api to update the user status")
	public ResponseEntity<CommonApiResponse> updateUserStatus(@RequestBody UserStatusUpdateRequestDto request) {
		return userResource.updateUserStatus(request);
	}

	@GetMapping("/bank/customers")
	@Operation(summary = "Api to get Bank Customers by bank id")
	public ResponseEntity<UserListResponseDto> fetchAllBankCustomersByBankId(@RequestParam("bankId") int bankId) {
		return userResource.fetchBankCustomerByBankId(bankId);
	}

	// @GetMapping("/bank/customer/search")
	// @Operation(summary = "Api to get Bank Customers by bank id")
	// public ResponseEntity<UserListResponseDto>
	// searchBankCustomer(@RequestParam("bankId") int bankId,
	// @RequestParam("customerName") String customerName) {
	// return userResource.searchBankCustomer(bankId, customerName);
	// }

	@GetMapping("/all/customer/search")
	@Operation(summary = "Api to get all Bank Customers by customer name")
	public ResponseEntity<UserListResponseDto> searchBankCustomer(@RequestParam("customerName") String customerName) {
		return userResource.searchBankCustomer(customerName);
	}

	@PutMapping("/update/profile")
	@Operation(summary = "Api to update the user profile")
	public ResponseEntity<CommonApiResponse> updateProfile(@RequestBody RegisterUserRequestDto request) {
		return this.userResource.updateUserprofile(request);
	}

	@PostMapping("/send/reset-password/mail")
	public ResponseEntity<CommonApiResponse> forgetPassword(@RequestBody UserLoginRequest request) {
		return userResource.forgetPassword(request);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<CommonApiResponse> resetPassword(@RequestBody UserLoginRequest request) {
		return userResource.resetPassword(request);
	}

	// Add By Prince
	@PostMapping("/update-profile")
	public ResponseEntity<CommonApiResponse> updateUserData(@RequestBody UserProfileUpdateDto request) {
		System.out.println(" hallo");
		return userResource.updateUserData(request);
	}

	@PostMapping("/upload-profile-image")
	public ResponseEntity<CommonApiResponse> uploadProfileImage(@RequestParam("userId") Long userId,
			@RequestParam("image") MultipartFile image) {
		return userResource.uploadProfileImage(userId, image);
	}

	// for multiple account of a user..........

	@GetMapping("/fetch/userId")
	@Operation(summary = "Api to get Users By id")
	public ResponseEntity<UserAccountDto> fetchById(@RequestParam("userId") String userId) {
		return userResource.findByUserId(userId);
	}

	// Fetch by userName 
	@GetMapping("/fetchusername/{userName}")
	@Operation(summary = "Api to get Users By id")
	public User fetchByUserName(@PathVariable String userName) {
		return userServiceImpl.getUserByUsername(userName);
	}

	@PostMapping("addAccount")
	public ResponseEntity<CommonApiResponse> addAccount(@RequestBody Map<String, String> accountData) {
		// long a=userAccountDao.count()+1;
		// String AcNo=accountData.get("currencyId").toString()+String.format("%06d",
		// a);
		UserAccounts userAccount = new UserAccounts();
		userAccount.setUserId(accountData.get("userId").toString());
		userAccount.setAccountBalance(BigDecimal.ZERO);
		userAccount.setAccountNumber("");
		userAccount.setCurrency(accountData.get("currency").toString());
		userAccount.setStatus(UserStatus.PENDING.value());
		userAccountDao.save(userAccount);

		return ResponseEntity.ok().build();
	}

	@PostMapping("/deleteAccount/acno")
	public ResponseEntity<CommonApiResponse> delete(@RequestParam("acno") String acno) {
		UserAccounts userAccount = userAccountDao.findByAccountNumber(acno);
		if (userAccount != null) {
			userAccount.setStatus("Closed");
			userAccountDao.save(userAccount);
		} else {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok().build();
	}

	@GetMapping("/fetch/customerAccounts/pending/request")
	@Operation(summary = "Api to get Users By Role")
	public ResponseEntity<UserAccountDto> fetchPendingCustomersAccounts() {
		return userResource.fetchPendingCustomersAccounts();
	}

	@PostMapping("update/accountStatus")
	@Operation(summary = "Api to update the user status")
	public ResponseEntity<CommonApiResponse> updateAccountStatus(@RequestBody Map<String, String> accountData) {
		return userResource.updateAccountStatus(accountData);
	}
}
