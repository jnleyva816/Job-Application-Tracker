package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/debug")
public class DebugController {
    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/password-check/{username}")
    public ResponseEntity<?> checkPassword(@PathVariable String username, @RequestParam String password) {
        try {
            logger.info("=== Starting password check for user: {} ===", username);
            
            // Get user
            User user = userService.getUserByUsername(username);
            logger.info("Found user: {}", username);
            logger.info("User details:");
            logger.info("- ID: {}", user.getId());
            logger.info("- Username: {}", user.getUsername());
            logger.info("- Email: {}", user.getEmail());
            logger.info("- Role: {}", user.getRole());
            logger.info("- Account locked: {}", user.isAccountLocked());
            logger.info("- Failed login attempts: {}", user.getFailedLoginAttempts());
            logger.info("- Last login: {}", user.getLastLogin());
            logger.info("- Created at: {}", user.getCreatedAt());
            logger.info("- Updated at: {}", user.getUpdatedAt());
            
            // Log password details
            logger.info("Password check details:");
            logger.info("- Provided password length: {}", password.length());
            logger.info("- Stored password: {}", user.getPassword());
            
            // Test password with BCrypt directly
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            boolean matches1 = encoder.matches(password, user.getPassword());
            logger.info("BCrypt direct match result: {}", matches1);
            
            // Test with a new hash
            String newHash = encoder.encode(password);
            boolean matches2 = encoder.matches(password, newHash);
            logger.info("BCrypt test with new hash result: {}", matches2);
            logger.info("New hash: {}", newHash);
            
            // Test with injected PasswordEncoder
            boolean matches3 = passwordEncoder.matches(password, user.getPassword());
            logger.info("Injected PasswordEncoder match result: {}", matches3);
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("passwordMatches", matches3);
            response.put("bCryptDirectMatch", matches1);
            response.put("bCryptNewHashMatch", matches2);
            response.put("accountLocked", user.isAccountLocked());
            response.put("failedLoginAttempts", user.getFailedLoginAttempts());
            response.put("storedPassword", user.getPassword());
            response.put("newHashForComparison", newHash);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error checking password: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error checking password: " + e.getMessage()));
        }
    }
} 