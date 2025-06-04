package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.service.StatisticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsController.class);

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics() {
        logger.info("=== Statistics endpoint called ===");
        try {
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            logger.info("Authenticated user: {}", username);
            
            // Check if user is admin
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            logger.info("User is admin: {}", isAdmin);
            
            logger.info("Calling statistics service...");
            Map<String, Object> statistics = statisticsService.getStatistics(username, isAdmin);
            logger.info("Statistics retrieved successfully: {}", statistics);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error in statistics controller: {}", e.getMessage(), e);
            throw e; // Re-throw to let GlobalExceptionHandler handle it
        }
    }
} 