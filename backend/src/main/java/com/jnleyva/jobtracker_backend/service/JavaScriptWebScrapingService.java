package com.jnleyva.jobtracker_backend.service;

import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Web scraping service that handles JavaScript-rendered pages using Playwright via a queue system.
 * This service now delegates to PlaywrightQueueService for better resource management.
 */
@Service
public class JavaScriptWebScrapingService {
    
    private static final Logger logger = LoggerFactory.getLogger(JavaScriptWebScrapingService.class);
    private static final int DEFAULT_WAIT_SECONDS = 5;
    
    @Autowired
    private PlaywrightQueueService playwrightQueueService;
    
    /**
     * Fetch document with JavaScript rendering using the Playwright queue system
     */
    public Document fetchDocumentWithJavaScript(String url) throws IOException {
        return fetchDocumentWithJavaScript(url, DEFAULT_WAIT_SECONDS);
    }
    
    /**
     * Fetch document with JavaScript rendering using the Playwright queue system
     * @param url The URL to fetch
     * @param waitSeconds How long to wait for JavaScript to render
     */
    public Document fetchDocumentWithJavaScript(String url, int waitSeconds) throws IOException {
        if (!playwrightQueueService.isPlaywrightAvailable()) {
            throw new IOException("Playwright not available - cannot render JavaScript");
        }
        
        logger.debug("Using Playwright queue service to fetch: {}", url);
        
        // Get queue status for logging
        PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
        logger.debug("Queue status before request: {}", status);
        
        try {
            Document doc = playwrightQueueService.fetchDocumentWithQueue(url, waitSeconds);
            
            logger.info("Successfully fetched content via queue - {} elements, {} text chars, title: '{}'", 
                       doc.getAllElements().size(), doc.text().length(), doc.title());
            
            return doc;
            
        } catch (IOException e) {
            logger.error("Error fetching with Playwright queue service: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Check if a URL likely requires JavaScript rendering
     */
    public boolean likelyRequiresJavaScript(String url) {
        if (url == null) return false;
        
        String lowerUrl = url.toLowerCase();
        
        // Known JavaScript-heavy sites
        return lowerUrl.contains("careers.microsoft.com") ||
               lowerUrl.contains("jobs.careers.microsoft.com") ||
               lowerUrl.contains("metacareers.com") ||
               lowerUrl.contains("careers.google.com") ||
               lowerUrl.contains("amazon.jobs") ||
               lowerUrl.contains("netflix.jobs") ||
               lowerUrl.contains("uber.com/careers") ||
               lowerUrl.contains("airbnb.com/careers");
    }
    
    /**
     * Check if JavaScript rendering is available
     */
    public boolean isJavaScriptRenderingAvailable() {
        return playwrightQueueService.isPlaywrightAvailable();
    }
    
    /**
     * Get information about available JavaScript rendering engines
     */
    public String getAvailableJavaScriptEngines() {
        if (playwrightQueueService.isPlaywrightAvailable()) {
            PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
            return String.format("Playwright (Queue: %s)", status);
        } else {
            return "None available";
        }
    }
    
    /**
     * Get current queue status
     */
    public PlaywrightQueueService.QueueStatus getQueueStatus() {
        return playwrightQueueService.getQueueStatus();
    }
    
    /**
     * Test if a URL can be successfully fetched with JavaScript rendering
     */
    public boolean testJavaScriptFetch(String url) {
        try {
            Document doc = fetchDocumentWithJavaScript(url, 3); // Short wait for testing
            return doc != null && doc.getAllElements().size() > 50;
        } catch (Exception e) {
            logger.debug("JavaScript fetch test failed for {}: {}", url, e.getMessage());
            return false;
        }
    }
} 