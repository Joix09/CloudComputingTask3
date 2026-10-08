package com.josh.rental.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI rentalOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Equipment Rental API")
                .description("Public API for managing rentable items, accounts and rentals.")
                .version("v1"));
    }
}
