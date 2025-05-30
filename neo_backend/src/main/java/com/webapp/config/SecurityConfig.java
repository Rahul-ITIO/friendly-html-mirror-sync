//The SecurityConfig class configures various aspects of security in a Spring Boot application. It sets up authentication and authorization rules, integrates a custom JWT filter for authentication, and specifies how user credentials are managed. This class ensures that only authenticated and authorized users can access specific endpoints, and it manages how user credentials are verified and encoded
package com.webapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.List;

import com.webapp.filter.JwtAuthFilter;
import com.webapp.utility.Constants.UserRole;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter authFilter;

    public SecurityConfig(JwtAuthFilter authFilter) {
        this.authFilter = authFilter;
    }
    

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/authurl/test3dsecureauthentication/**")
                .disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/user/tfa",
                        "/api/s2s","/api/authurl/{transID}","/api/authurl/auth_3ds/{transID}","/api/authurl/s2s/{transID}","/api/authurl/test3dsecureauthentication/{transID}",
                        "/api/authurl/test3dsecureauthentication/**",
                        "/api/user/fetchusername/{userName}","/api/terminals/search/merid/{merId}",
                        "/api/status/webhook/{defaultConnector}","/api/status/s2s/transid/{transID}","/api/status/transid/{transID}",
                        "/api/currency-exchange/{gateway}/{fromCurrency}/{toCurrency}/{getAmount}",
                        "/api/transactions/refund-request",
                        "/api/user/verify", "/api/user/login",
                        "/api/user/admin/register", "/api/user/register", "/api/transaction/update/status",
                        "/api/user/fetch/userId", "/api/transaction/fetch/customer/transactions/all", "/api/user/fetch/id",
                        "/api/user/send/reset-password/mail", "/api/user/addAccount", "/api/user/deleteAccount/acno",
                        "/api/user/reset-password", "/api/user/update-profile", "/api/user/upload-profile-image",
                        "/api/fee/detail/fetch/type", "/api/currencies/add", "/api/currencies/fatch",
                        "/api/currencies/fatchAccount", "/api/currencies/fatchHostDetail", "/api/currencies/delete/id",
                        "/api/currencies/deleteAccount/id", "/api/currencies/updateHostDetail",
                        "/api/currencies/fatchHostDetail", "/api/currencies/fatchAdminAccount",
                        "/api/create-checkout-session/card", "/api/create-checkout-session/bank",
                        "/api/transaction/accountTransfer/internal", "/api/transaction/accountTransfer")
                    .permitAll()

                .requestMatchers("/api/bank/register", "/api/bank/fetch/all", "/api/bank/fetch/user",
                        "/api/bank/account/fetch/all", "/api/bank/transaction/all", "/api/currencies/add")
                    .hasAuthority(UserRole.ROLE_ADMIN.value())

                .requestMatchers("/api/bank/account/add", "/api/bank/account/fetch/bankwise",
                        "/api/bank/account/fetch/id", "/api/bank/account/search", "/api/bank/transaction/deposit",
                        "/api/bank/transaction/withdraw", "/api/bank/transaction/customer/fetch",
                        "/api/bank/transaction/customer/fetch/timerange",
                        "/api/bank/transaction/all/customer/fetch/timerange",
                        "/api/bank/transaction/all/customer/fetch", "/api/user/bank/customer/search")
                    .hasAuthority(UserRole.ROLE_BANK.value())

                .requestMatchers("/api/bank/transaction/account/transfer",
                        "/api/bank/transaction/history/timerange", "/api/transaction/addMoney",
                        "/api/transaction/accountTransfer/internal")
                    .hasAuthority(UserRole.ROLE_CUSTOMER.value())

                .requestMatchers("/api/bank/account/fetch/user", "/api/bank/transaction/history",
                        "/api/user/update-profile")
                    .hasAnyAuthority(UserRole.ROLE_BANK.value(), UserRole.ROLE_CUSTOMER.value(), UserRole.ROLE_ADMIN.value())

                .requestMatchers("/api/bank/account/search/all")
                    .hasAnyAuthority(UserRole.ROLE_BANK.value(), UserRole.ROLE_ADMIN.value())

                .requestMatchers("/api/bank/fetch/id", "/api/bank/transaction/statement/download")
                    .hasAnyAuthority(UserRole.ROLE_BANK.value(), UserRole.ROLE_ADMIN.value(), UserRole.ROLE_CUSTOMER.value())

                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
		// TODO Auto-generated method stub
		return null;
	}

	@Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:3000")); // Change to frontend URL in production
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService());
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new CustomUserDetailsService();
    }
}
