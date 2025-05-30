//The purpose of this configuration class (ApplicationConfig) is to set up a custom interceptor (RequestHeaderInterceptor) in a Spring Boot application. By implementing WebMvcConfigurer, the class provides a way to customize the default Spring MVC configuration. The interceptor is registered using the addInterceptors method, allowing it to handle or modify HTTP requests and responses globally across the application
package com.webapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.webapp.interceptor.RequestHeaderInterceptor;


// for interceptor
@Configuration
public class ApplicationConfig implements WebMvcConfigurer {
	
	@Autowired
	private RequestHeaderInterceptor requestHeaderInterceptor;
	
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(requestHeaderInterceptor);
	}

}
