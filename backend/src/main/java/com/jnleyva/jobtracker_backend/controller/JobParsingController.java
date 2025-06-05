package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.JobParseResult;
import com.jnleyva.jobtracker_backend.service.JobParsingService;
import com.jnleyva.jobtracker_backend.service.WebScrapingUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * REST controller for job parsing operations
 */
@RestController
@RequestMapping("/api/job-parsing")
@CrossOrigin(origins = "http://localhost:3000")
public class JobParsingController {
    
    private final JobParsingService jobParsingService;
    private final WebScrapingUtils webScrapingUtils;
    
    @Autowired
    public JobParsingController(JobParsingService jobParsingService, WebScrapingUtils webScrapingUtils) {
        this.jobParsingService = jobParsingService;
        this.webScrapingUtils = webScrapingUtils;
    }
    
    /**
     * Parse job information from a URL
     */
    @PostMapping("/parse")
    public ResponseEntity<JobParseResult> parseJobUrl(@RequestBody JobUrlRequest request) {
        if (request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                JobParseResult.failure("UNKNOWN", null, "URL is required")
            );
        }
        
        JobParseResult result = jobParsingService.parseJobUrl(request.getUrl().trim());
        
        if (result.isSuccessful()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.unprocessableEntity().body(result);
        }
    }
    
    /**
     * Get raw HTML from a URL for testing purposes
     */
    @PostMapping("/raw-html")
    public ResponseEntity<RawHtmlResult> getRawHtml(@RequestBody JobUrlRequest request) {
        if (request.getUrl() == null || request.getUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                new RawHtmlResult(false, null, null, "URL is required")
            );
        }
        
        try {
            String url = request.getUrl().trim();
            org.jsoup.nodes.Document document = webScrapingUtils.fetchDocument(url);
            String rawHtml = document.html();
            
            return ResponseEntity.ok(new RawHtmlResult(true, url, rawHtml, null));
        } catch (IOException e) {
            return ResponseEntity.unprocessableEntity().body(
                new RawHtmlResult(false, request.getUrl().trim(), null, 
                    "Failed to fetch HTML: " + e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                new RawHtmlResult(false, request.getUrl().trim(), null, 
                    "Unexpected error: " + e.getMessage())
            );
        }
    }
    
    /**
     * Handle malformed JSON requests
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<JobParseResult> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(
            JobParseResult.failure("UNKNOWN", null, "Invalid JSON request")
        );
    }
    
    /**
     * Handle unsupported media type
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<JobParseResult> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e) {
        return ResponseEntity.status(415).body(
            JobParseResult.failure("UNKNOWN", null, "Unsupported media type")
        );
    }
    
    /**
     * Request body for job URL parsing
     */
    public static class JobUrlRequest {
        private String url;
        
        public JobUrlRequest() {}
        
        public JobUrlRequest(String url) {
            this.url = url;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
    }
    
    /**
     * Response body for raw HTML results
     */
    public static class RawHtmlResult {
        private boolean successful;
        private String url;
        private String rawHtml;
        private String errorMessage;
        
        public RawHtmlResult() {}
        
        public RawHtmlResult(boolean successful, String url, String rawHtml, String errorMessage) {
            this.successful = successful;
            this.url = url;
            this.rawHtml = rawHtml;
            this.errorMessage = errorMessage;
        }
        
        public boolean isSuccessful() {
            return successful;
        }
        
        public void setSuccessful(boolean successful) {
            this.successful = successful;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public String getRawHtml() {
            return rawHtml;
        }
        
        public void setRawHtml(String rawHtml) {
            this.rawHtml = rawHtml;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
} 