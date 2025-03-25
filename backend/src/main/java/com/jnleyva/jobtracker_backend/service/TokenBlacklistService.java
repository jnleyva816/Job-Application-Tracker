package com.jnleyva.jobtracker_backend.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.Date;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Service
public class TokenBlacklistService {
    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    public TokenBlacklistService() {
        // Schedule cleanup of expired tokens every hour
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS);
        logger.info("TokenBlacklistService initialized with hourly cleanup schedule");
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            String hashedToken = Base64.getEncoder().encodeToString(hash);
            logger.debug("Token hash generated: {}", hashedToken);
            return hashedToken;
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error hashing token: {}", e.getMessage());
            return null;
        }
    }

    public void blacklistToken(String token, long expirationTime) {
        if (token == null || token.isEmpty()) {
            logger.warn("Attempt to blacklist null or empty token");
            return;
        }

        logger.info("=== Starting token blacklist process ===");
        logger.info("Token to blacklist (first 10 chars): {}..., expiration: {}", 
            token.substring(0, Math.min(10, token.length())), 
            new Date(expirationTime));
        
        // Store the token hash instead of the full token
        String tokenHash = hashToken(token);
        if (tokenHash != null) {
            blacklistedTokens.put(tokenHash, expirationTime);
            logger.info("Token blacklisted successfully. Current blacklist size: {}", blacklistedTokens.size());
            
            // Debug: Print all blacklisted tokens
            printBlacklistContents();
        } else {
            logger.error("Failed to hash token for blacklisting");
        }
        logger.info("=== Completed token blacklist process ===");
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isEmpty()) {
            logger.warn("Checking blacklist status for null or empty token");
            return false;
        }

        logger.info("=== Starting blacklist check ===");
        logger.info("Token to check (first 10 chars): {}...", 
            token.substring(0, Math.min(10, token.length())));

        // Use token hash for lookup
        String tokenHash = hashToken(token);
        if (tokenHash == null) {
            logger.error("Failed to hash token for blacklist check");
            return false;
        }

        logger.info("Checking blacklist status for token hash: {}", tokenHash);

        Long expirationTime = blacklistedTokens.get(tokenHash);
        if (expirationTime == null) {
            logger.info("Token not found in blacklist");
            return false;
        }

        // If token is expired, remove it from blacklist and return false
        if (System.currentTimeMillis() > expirationTime) {
            logger.info("Token found but expired, removing from blacklist");
            blacklistedTokens.remove(tokenHash);
            return false;
        }

        logger.info("Token found in blacklist and still valid");
        logger.info("=== Completed blacklist check ===");
        return true;
    }

    private void cleanupExpiredTokens() {
        int sizeBefore = blacklistedTokens.size();
        long now = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> {
            boolean expired = entry.getValue() <= now;
            if (expired) {
                logger.debug("Removing expired token hash: {}", entry.getKey());
            }
            return expired;
        });
        int removed = sizeBefore - blacklistedTokens.size();
        if (removed > 0) {
            logger.info("Cleaned up {} expired tokens. Current blacklist size: {}", 
                removed, blacklistedTokens.size());
        }
    }

    // For admin endpoints
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }
    
    public void printBlacklistContents() {
        logger.info("=== Current blacklist contents ({} tokens) ===", blacklistedTokens.size());
        blacklistedTokens.forEach((tokenHash, expiry) -> 
            logger.info("Token hash: {}, expires at: {}", tokenHash, new Date(expiry)));
        logger.info("=== End of blacklist contents ===");
    }
} 