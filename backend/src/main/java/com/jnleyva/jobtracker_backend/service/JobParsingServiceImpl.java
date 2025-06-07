package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of JobParsingService that orchestrates different job parsers
 * Currently supports Meta, Greenhouse, and Microsoft job parsers
 */
@Service
public class JobParsingServiceImpl implements JobParsingService {
    
    private static final Logger logger = LoggerFactory.getLogger(JobParsingServiceImpl.class);
    
    private final List<JobParser> jobParsers;
    
    @Autowired
    public JobParsingServiceImpl(List<JobParser> parsers) {
        this.jobParsers = parsers;
        
        logger.info("Initialized JobParsingService with {} parsers", jobParsers.size());
        
        if (logger.isDebugEnabled()) {
            logger.debug("Available parsers: {}", 
                    jobParsers.stream()
                            .map(JobParser::getParserName)
                            .collect(Collectors.joining(", ")));
        }
    }
    
    @Override
    public JobParseResult parseJobUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return JobParseResult.failure("UNKNOWN", url, "URL cannot be null or empty");
        }
        
        // Trim the URL to handle whitespace
        url = url.trim();
        
        logger.info("Attempting to parse job URL: {}", url);
        
        // Try each parser until one can handle the URL
        for (JobParser parser : jobParsers) {
            if (parser.canParse(url)) {
                logger.info("Using {} parser for URL: {}", parser.getParserName(), url);
                try {
                    JobParseResult result = parser.parse(url);
                    if (result.isSuccessful()) {
                        logger.info("Successfully parsed job information from {} using {} parser", 
                                url, parser.getParserName());
                    } else {
                        logger.warn("Failed to parse job information from {} using {} parser: {}", 
                                url, parser.getParserName(), result.getErrorMessage());
                    }
                    return result;
                } catch (Exception e) {
                    logger.error("Error parsing URL {} with {} parser", url, parser.getParserName(), e);
                    return JobParseResult.failure(parser.getParserName(), url, 
                            "Parser error: " + e.getMessage());
                }
            }
        }
        
        logger.warn("No suitable parser found for URL: {}. Available parsers: {}", url,
                jobParsers.stream().map(JobParser::getParserName).collect(Collectors.joining(", ")));
        return JobParseResult.failure("UNKNOWN", url, "No suitable parser found for this URL. Only Meta, Greenhouse, and Microsoft URLs are supported.");
    }
} 