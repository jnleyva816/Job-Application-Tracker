package com.jnleyva.jobtracker_backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("!test") // Exclude this configuration from test profile
public class EnvConfig {
    
    static {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // Don't fail if .env file is missing
                    .load();
            dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
        } catch (Exception e) {
            System.out.println("Warning: Could not load .env file: " + e.getMessage());
        }
    }
    
    @PostConstruct
    public void validateEnv() {
        if (System.getProperty("DB_URL") == null || 
            System.getProperty("DB_USERNAME") == null || 
            System.getProperty("DB_PASSWORD") == null) {
            throw new RuntimeException("Required environment variables are not set");
        }
    }
} 