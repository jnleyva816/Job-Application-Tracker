package com.jnleyva.jobtracker_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
public class DatabaseHealthCheck {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseHealthCheck.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void checkDatabaseConnection() {
        try {
            // Try to get a connection
            try (Connection connection = dataSource.getConnection()) {
                logger.info("Database connection successful!");
                
                // Test the connection with a simple query
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                logger.info("Database query test successful!");
            }
        } catch (SQLException e) {
            String errorMessage = e.getMessage().toLowerCase();
            if (errorMessage.contains("connection refused")) {
                logger.error("Database connection failed: Database server is unreachable. Please check if the database is running and accessible.");
            } else if (errorMessage.contains("authentication failed")) {
                logger.error("Database connection failed: Invalid credentials. Please check your database username and password.");
            } else if (errorMessage.contains("database") && errorMessage.contains("does not exist")) {
                logger.error("Database connection failed: Database does not exist. Please create the database first.");
            } else {
                logger.error("Database connection failed: {}", e.getMessage());
            }
            throw new RuntimeException("Database connection failed", e);
        }
    }
} 