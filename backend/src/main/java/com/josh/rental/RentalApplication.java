package com.josh.rental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import java.util.TimeZone;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

// VIA_DTO gives pages a stable JSON shape: { "content": [...], "page": { size, number, totalElements, totalPages } }
@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class RentalApplication {
    public static void main(String[] args) {
        // The JDBC driver sends the JVM timezone to Postgres; legacy IDs like "Europe/Kiev" are rejected, so pin UTC (same as Azure)
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(RentalApplication.class, args);
    }
}
