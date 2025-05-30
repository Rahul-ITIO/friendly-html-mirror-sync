//The SwaggerConfig class configures Swagger OpenAPI for the Spring Boot application. By defining the OpenAPI bean, it specifies metadata about the API (title, description, version, and license) and adds external documentation links. This configuration helps generate and serve interactive API documentation, which can be accessed via the Swagger UI at the specified URL
package com.webapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {
	@Bean
	public OpenAPI springShopOpenAPI() {
		return new OpenAPI()
				.info(new Info().title("Online Banking Application")
						.description("Online Banking Application using Spring Boot 3")
						.version("v0.0.1")
						.license(new License()
								.name("Apache 2.0")
								.url("http://springdoc.org")))
				.externalDocs(new ExternalDocumentation().description("")
						.url(""));
	}
	

}
