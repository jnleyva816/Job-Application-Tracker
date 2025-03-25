package com.jnleyva.jobtracker_backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class EnvConfig {
    
    static {
        Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
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