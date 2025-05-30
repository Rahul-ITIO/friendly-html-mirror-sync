//The WebConfig class configures CORS for the Spring Boot application. It creates a CORS filter with specific settings for allowed origins, headers, methods, and credentials, and registers this filter with a specific order. This configuration ensures that cross-origin requests from the specified origin (http://localhost:3000) are handled according to the defined rules, allowing for secure interaction between different domains
package com.webapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
