package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;

/**
 * Service for parsing job information from URLs
 */
public interface JobParsingService {
    
    /**
     * Parse job information from the given URL
     * This method will automatically determine the appropriate parser to use
     * 
     * @param url the job URL to parse
     * @return JobParseResult containing the parsed information
     */
    JobParseResult parseJobUrl(String url);
} 