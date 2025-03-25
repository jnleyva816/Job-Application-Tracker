package com.jnleyva.jobtracker_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
@Order(1) // This configuration will be evaluated before the main security config
public class DebugSecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(DebugSecurityConfig.class);

    @Bean
    public SecurityFilterChain debugSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/debug/**") // Only apply to debug endpoints
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.disable())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Allow all requests to debug endpoints
            );

        logger.info("Debug security configuration initialized - all debug endpoints are accessible");
        return http.build();
    }
} 