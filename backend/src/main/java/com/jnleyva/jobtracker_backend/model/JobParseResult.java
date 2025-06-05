package com.jnleyva.jobtracker_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing the result of parsing a job URL
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobParseResult {
    
    private String jobTitle;
    private String company;
    private String location;
    private String description;
    private Double compensation;
    private String compensationType; // "ANNUAL", "HOURLY", "UNKNOWN"
    private String experienceLevel;
    private String originalUrl;
    private boolean successful;
    private String errorMessage;
    private String source; // "META", "GREENHOUSE"
    
    /**
     * Creates a successful parse result
     */
    public static JobParseResult success(String source, String originalUrl) {
        return JobParseResult.builder()
                .successful(true)
                .source(source)
                .originalUrl(originalUrl)
                .build();
    }
    
    /**
     * Creates a failed parse result
     */
    public static JobParseResult failure(String source, String originalUrl, String errorMessage) {
        return JobParseResult.builder()
                .successful(false)
                .source(source)
                .originalUrl(originalUrl)
                .errorMessage(errorMessage)
                .build();
    }
} 