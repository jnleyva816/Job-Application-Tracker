package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @GetMapping("/blacklist/size")
    public ResponseEntity<Map<String, Object>> getBlacklistSize() {
        logger.info("Getting blacklist size");
        int size = tokenBlacklistService.getBlacklistSize();
        Map<String, Object> response = new HashMap<>();
        response.put("size", size);
        logger.info("Current blacklist size: {}", size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blacklist/print")
    public ResponseEntity<Map<String, Object>> printBlacklist() {
        logger.info("Printing blacklist contents");
        tokenBlacklistService.printBlacklistContents();
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Blacklist contents printed to logs");
        response.put("size", tokenBlacklistService.getBlacklistSize());
        return ResponseEntity.ok(response);
    }
} 