package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;

/**
 * Interface for parsing job information from different platforms
 */
public interface JobParser {
    
    /**
     * Check if this parser can handle the given URL
     * 
     * @param url the job URL to check
     * @return true if this parser can handle the URL, false otherwise
     */
    boolean canParse(String url);
    
    /**
     * Parse job information from the given URL
     * 
     * @param url the job URL to parse
     * @return JobParseResult containing the parsed information
     */
    JobParseResult parse(String url);
    
    /**
     * Get the name of this parser (e.g., "META", "NETFLIX", etc.)
     * 
     * @return the parser name
     */
    String getParserName();
} 