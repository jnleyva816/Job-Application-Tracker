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

import com.jnleyva.jobtracker_backend.service.WebScrapingUtils;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.util.*;

import com.jnleyva.jobtracker_backend.service.JavaScriptWebScrapingService;

/**
 * Debug controller for testing URL structure and job parsers
 */
@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {
    private static final Logger logger = LoggerFactory.getLogger(DebugController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WebScrapingUtils webScrapingUtils;

    @Autowired(required = false)
    private JavaScriptWebScrapingService jsWebScrapingService;

    @Autowired
    private com.jnleyva.jobtracker_backend.service.JobParsingService jobParsingService;

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

    /**
     * Analyze URL structure for debugging
     */
    @PostMapping("/analyze-url")
    public ResponseEntity<Map<String, Object>> analyzeUrl(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            Document doc = webScrapingUtils.fetchDocument(url);
            Map<String, Object> analysis = new HashMap<>();
            
            analysis.put("url", url);
            analysis.put("title", doc.title());
            analysis.put("jobTitleSelectors", testJobTitleSelectors(doc));
            analysis.put("companySelectors", testCompanySelectors(doc));
            analysis.put("locationSelectors", testLocationSelectors(doc));
            analysis.put("descriptionSelectors", testDescriptionSelectors(doc));
            analysis.put("compensationSelectors", testCompensationSelectors(doc));
            analysis.put("documentStructure", getDocumentStructure(doc));
            analysis.put("textContent", doc.text().length() > 1000 ? 
                doc.text().substring(0, 1000) + "..." : doc.text());
            
            return ResponseEntity.ok(analysis);
            
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch URL: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }
    
    /**
     * Test current Greenhouse parser with a URL
     */
    @PostMapping("/test-greenhouse-parser")
    public ResponseEntity<Map<String, Object>> testGreenhouseParser(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("canParse", canParseGreenhouse(url));
        
        try {
            Document doc = webScrapingUtils.fetchDocument(url);
            
            // Test the same logic as GreenhouseJobParser
            result.put("jobTitle", extractJobTitle(doc));
            result.put("company", extractCompany(doc));
            result.put("location", extractLocation(doc));
            result.put("description", extractDescription(doc));
            result.put("compensation", extractCompensation(doc));
            result.put("fetchSuccess", true);
            result.put("errorMessage", null);
            
        } catch (Exception e) {
            // Still return the canParse result even if document fetch fails
            result.put("jobTitle", null);
            result.put("company", null);
            result.put("location", null);
            result.put("description", null);
            result.put("compensation", null);
            result.put("fetchSuccess", false);
            result.put("errorMessage", "Document fetch failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get raw HTML from a URL for debugging purposes
     */
    @PostMapping("/raw-html")
    public ResponseEntity<Map<String, Object>> getRawHtml(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            Document doc = webScrapingUtils.fetchDocument(url);
            String rawHtml = doc.html();
            
            Map<String, Object> result = new HashMap<>();
            result.put("successful", true);
            result.put("url", url);
            result.put("rawHtml", rawHtml);
            result.put("errorMessage", null);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("rawHtml", null);
            errorResult.put("errorMessage", "Failed to fetch HTML: " + e.getMessage());
            return ResponseEntity.unprocessableEntity().body(errorResult);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("rawHtml", null);
            errorResult.put("errorMessage", "Unexpected error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }
    
    /**
     * Parse job information using the generic job parsing service
     */
    @PostMapping("/parse-job")
    public ResponseEntity<Map<String, Object>> parseJob(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            // Use the existing job parsing service
            com.jnleyva.jobtracker_backend.model.JobParseResult result = jobParsingService.parseJobUrl(url);
            
            // Convert to Map format for JSON response
            Map<String, Object> response = new HashMap<>();
            response.put("successful", result.isSuccessful());
            response.put("jobTitle", result.getJobTitle());
            response.put("company", result.getCompany());
            response.put("location", result.getLocation());
            response.put("description", result.getDescription());
            response.put("compensation", result.getCompensation());
            response.put("compensationType", result.getCompensationType());
            response.put("experienceLevel", result.getExperienceLevel());
            response.put("originalUrl", result.getOriginalUrl());
            response.put("errorMessage", result.getErrorMessage());
            response.put("source", result.getSource());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("successful", false);
            errorResponse.put("originalUrl", url);
            errorResponse.put("errorMessage", "Parsing failed: " + e.getMessage());
            errorResponse.put("source", "UNKNOWN");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get plain text content from a URL for debugging purposes
     * This endpoint extracts clean, readable text without HTML tags
     */
    @PostMapping("/plain-text")
    public ResponseEntity<Map<String, Object>> getPlainText(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            Document doc = webScrapingUtils.fetchDocument(url);
            String plainText = doc.text(); // Extract only text content, no HTML tags
            
            Map<String, Object> result = new HashMap<>();
            result.put("successful", true);
            result.put("url", url);
            result.put("plainText", plainText);
            result.put("title", doc.title());
            result.put("textLength", plainText.length());
            result.put("errorMessage", null);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("plainText", null);
            errorResult.put("errorMessage", "Failed to fetch content: " + e.getMessage());
            return ResponseEntity.unprocessableEntity().body(errorResult);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("plainText", null);
            errorResult.put("errorMessage", "Unexpected error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }
    
    /**
     * Test JavaScript rendering capabilities
     */
    @PostMapping("/test-javascript-rendering")
    public ResponseEntity<Map<String, Object>> testJavaScriptRendering(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("jsRenderingAvailable", jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable());
        result.put("likelyRequiresJs", jsWebScrapingService != null && jsWebScrapingService.likelyRequiresJavaScript(url));
        
        try {
            // Test static HTML first
            Document staticDoc = webScrapingUtils.fetchDocument(url);
            result.put("staticFetchSuccess", true);
            result.put("staticElementCount", staticDoc.getAllElements().size());
            result.put("staticTitle", staticDoc.title());
            result.put("staticTextLength", staticDoc.text().length());
            
            // Test JavaScript rendering if available
            if (jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable()) {
                try {
                    Document jsDoc = jsWebScrapingService.fetchDocumentWithJavaScript(url, 5);
                    result.put("jsFetchSuccess", true);
                    result.put("jsElementCount", jsDoc.getAllElements().size());
                    result.put("jsTitle", jsDoc.title());
                    result.put("jsTextLength", jsDoc.text().length());
                    
                    // Compare quality
                    boolean jsIsBetter = jsDoc.getAllElements().size() > staticDoc.getAllElements().size() * 1.5;
                    result.put("javascriptProducedBetterResults", jsIsBetter);
                    
                } catch (Exception e) {
                    result.put("jsFetchSuccess", false);
                    result.put("jsErrorMessage", "JavaScript fetch failed: " + e.getMessage());
                }
            } else {
                result.put("jsFetchSuccess", false);
                result.put("jsErrorMessage", "JavaScript rendering not available (Selenium not configured)");
            }
            
        } catch (IOException e) {
            result.put("staticFetchSuccess", false);
            result.put("staticErrorMessage", "Static fetch failed: " + e.getMessage());
        } catch (Exception e) {
            result.put("staticFetchSuccess", false);
            result.put("staticErrorMessage", "Unexpected error: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Enhanced raw HTML endpoint that can use JavaScript rendering
     */
    @PostMapping("/enhanced-raw-html")
    public ResponseEntity<Map<String, Object>> getEnhancedRawHtml(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        String forceJavaScript = request.get("forceJavaScript"); // "true" to force JS rendering
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        boolean useJavaScript = "true".equals(forceJavaScript) || (jsWebScrapingService != null && jsWebScrapingService.likelyRequiresJavaScript(url));
        
        try {
            Document doc;
            String method;
            
            if (useJavaScript && jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable()) {
                doc = jsWebScrapingService.fetchDocumentWithJavaScript(url);
                method = "JavaScript";
            } else {
                doc = webScrapingUtils.fetchDocument(url);
                method = "Static HTML";
            }
            
            String rawHtml = doc.html();
            
            Map<String, Object> result = new HashMap<>();
            result.put("successful", true);
            result.put("url", url);
            result.put("rawHtml", rawHtml);
            result.put("method", method);
            result.put("elementCount", doc.getAllElements().size());
            result.put("title", doc.title());
            result.put("textLength", doc.text().length());
            result.put("errorMessage", null);
            
            return ResponseEntity.ok(result);
            
        } catch (IOException e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("rawHtml", null);
            errorResult.put("method", useJavaScript ? "JavaScript (failed)" : "Static HTML (failed)");
            errorResult.put("errorMessage", "Failed to fetch HTML: " + e.getMessage());
            return ResponseEntity.unprocessableEntity().body(errorResult);
        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("successful", false);
            errorResult.put("url", url);
            errorResult.put("rawHtml", null);
            errorResult.put("method", "Unknown");
            errorResult.put("errorMessage", "Unexpected error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }

    /**
     * Microsoft-specific debugging endpoint
     */
    @PostMapping("/test-microsoft-parser")
    public ResponseEntity<Map<String, Object>> testMicrosoftParser(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        
        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        
        // Check if this is a Microsoft URL
        boolean isMicrosoftUrl = url.toLowerCase().contains("microsoft.com") || url.toLowerCase().contains("careers.microsoft.com");
        result.put("isMicrosoftUrl", isMicrosoftUrl);
        result.put("jsRenderingAvailable", jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable());
        
        try {
            // Parse using the Microsoft parser
            com.jnleyva.jobtracker_backend.model.JobParseResult parseResult = jobParsingService.parseJobUrl(url);
            
            result.put("parseSuccessful", parseResult.isSuccessful());
            result.put("jobTitle", parseResult.getJobTitle());
            result.put("company", parseResult.getCompany());
            result.put("location", parseResult.getLocation());
            result.put("compensation", parseResult.getCompensation());
            result.put("source", parseResult.getSource());
            result.put("errorMessage", parseResult.getErrorMessage());
            
            if (parseResult.getDescription() != null) {
                String description = parseResult.getDescription();
                result.put("descriptionLength", description.length());
                result.put("descriptionPreview", description.length() > 200 ? 
                    description.substring(0, 200) + "..." : description);
            }
            
        } catch (Exception e) {
            result.put("parseSuccessful", false);
            result.put("errorMessage", "Parser test failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
    
    private boolean canParseGreenhouse(String url) {
        return url != null && (
            url.contains("greenhouse.io") ||
            url.contains("boards.greenhouse.io") ||
            url.contains("job-boards.greenhouse.io")
        );
    }
    
    private Map<String, String> testJobTitleSelectors(Document doc) {
        Map<String, String> results = new LinkedHashMap<>();
        
        String[] selectors = {
            ".job__title h1.section-header",  // New Greenhouse structure
            ".job__title h1",                // New structure fallback
            ".app-title",                    // Old structure
            "h1.posting-headline",           // Old structure
            "h1",                           // Generic fallback
            ".job-title",                   // Alternative
            ".posting-title",              // Alternative
            "[data-qa='job-title']"        // Data attribute
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            results.put(selector, element != null ? element.text().trim() : "NOT FOUND");
        }
        
        return results;
    }
    
    private Map<String, String> testCompanySelectors(Document doc) {
        Map<String, String> results = new LinkedHashMap<>();
        
        String[] selectors = {
            ".company-name",
            ".posting-company",
            ".company",
            "[data-qa='company-name']",
            ".employer-name"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            results.put(selector, element != null ? element.text().trim() : "NOT FOUND");
        }
        
        // Check page title for company extraction
        String title = doc.title();
        results.put("title_extraction", title.contains(" at ") ? 
            "Found ' at ' in title: " + title : "No ' at ' pattern in title");
        
        return results;
    }
    
    private Map<String, String> testLocationSelectors(Document doc) {
        Map<String, String> results = new LinkedHashMap<>();
        
        String[] selectors = {
            ".job__location div",        // New Greenhouse structure (excluding SVG)
            ".job__location",           // New structure container
            ".location",               // Old structure
            ".posting-location",       // Old structure
            ".job-location",          // Alternative
            "[data-qa='location']",   // Data attribute
            ".workplace-type"         // Alternative
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            results.put(selector, element != null ? element.text().trim() : "NOT FOUND");
        }
        
        // Check for common location keywords
        String[] locationKeywords = {"Remote", "United States", "San Francisco", "New York"};
        for (String keyword : locationKeywords) {
            Element element = doc.getElementsContainingOwnText(keyword).first();
            results.put("text_search_" + keyword.toLowerCase().replace(" ", "_"), 
                element != null ? element.text().trim() : "NOT FOUND");
        }
        
        return results;
    }
    
    private Map<String, Object> testDescriptionSelectors(Document doc) {
        Map<String, Object> results = new LinkedHashMap<>();
        
        String[] selectors = {
            ".job__description.body",      // New Greenhouse structure
            ".job__description div",       // New structure content
            ".job__description",          // New structure container
            "#content",                   // Old structure
            ".posting-description",       // Old structure
            ".content",                  // Alternative
            "main",                      // Fallback
            ".job-description",          // Alternative
            "[data-qa='job-description']" // Data attribute
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            if (element != null) {
                String text = element.text().trim();
                Map<String, Object> selectorResult = new HashMap<>();
                selectorResult.put("found", true);
                selectorResult.put("length", text.length());
                selectorResult.put("preview", text.length() > 100 ? text.substring(0, 100) + "..." : text);
                results.put(selector, selectorResult);
            } else {
                results.put(selector, Map.of("found", false));
            }
        }
        
        return results;
    }
    
    private Map<String, String> testCompensationSelectors(Document doc) {
        Map<String, String> results = new LinkedHashMap<>();
        
        String[] selectors = {
            ".salary",
            ".compensation",
            ".pay",
            ".wage",
            "[data-qa='salary']"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            results.put(selector, element != null ? element.text().trim() : "NOT FOUND");
        }
        
        // Look for dollar signs in job description (new structure)
        Element jobDescElement = doc.selectFirst(".job__description");
        if (jobDescElement != null) {
            Elements dollarElements = jobDescElement.getElementsContainingOwnText("$");
            for (Element element : dollarElements) {
                String text = element.text();
                if (text.contains("Annual Salary") || (text.contains("$") && 
                    (text.contains("—") || text.contains("-") || text.contains("to") || text.contains("USD")))) {
                    results.put("salary_in_job_description", text.trim());
                    break;
                }
            }
            if (!results.containsKey("salary_in_job_description")) {
                results.put("salary_in_job_description", "NOT FOUND");
            }
        }
        
        // Look for dollar signs in main content (fallback)
        Element contentElement = doc.selectFirst("#content");
        if (contentElement != null) {
            Element dollarElement = contentElement.getElementsContainingOwnText("$").first();
            results.put("dollar_sign_in_content", 
                dollarElement != null ? dollarElement.text().trim() : "NOT FOUND");
        }
        
        return results;
    }
    
    private Map<String, Object> getDocumentStructure(Document doc) {
        Map<String, Object> structure = new HashMap<>();
        
        // Get elements with classes
        Elements elementsWithClass = doc.select("[class]");
        List<String> classes = new ArrayList<>();
        int count = 0;
        for (Element element : elementsWithClass) {
            if (count >= 20) break;
            classes.add(element.tagName() + "." + element.className());
            count++;
        }
        structure.put("elementsWithClasses", classes);
        
        // Get elements with IDs
        Elements elementsWithId = doc.select("[id]");
        List<String> ids = new ArrayList<>();
        for (Element element : elementsWithId) {
            ids.add(element.tagName() + "#" + element.id());
        }
        structure.put("elementsWithIds", ids);
        
        // Get data attributes
        Elements elementsWithData = doc.select("[data-qa], [data-testid], [data-test]");
        List<String> dataAttrs = new ArrayList<>();
        for (Element element : elementsWithData) {
            String dataQa = element.attr("data-qa");
            String dataTestId = element.attr("data-testid");
            String dataTest = element.attr("data-test");
            StringBuilder sb = new StringBuilder(element.tagName());
            if (!dataQa.isEmpty()) sb.append(" data-qa=\"").append(dataQa).append("\"");
            if (!dataTestId.isEmpty()) sb.append(" data-testid=\"").append(dataTestId).append("\"");
            if (!dataTest.isEmpty()) sb.append(" data-test=\"").append(dataTest).append("\"");
            dataAttrs.add(sb.toString());
        }
        structure.put("elementsWithDataAttrs", dataAttrs);
        
        return structure;
    }
    
    // Copy the extraction methods from GreenhouseJobParser for testing
    private String extractJobTitle(Document doc) {
        // Try new Greenhouse structure first
        Element titleElement = doc.selectFirst(".job__title h1.section-header");
        
        // Fallback to older structure
        if (titleElement == null) {
            titleElement = doc.selectFirst(".app-title");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1.posting-headline");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1");
        }
        
        return titleElement != null ? webScrapingUtils.cleanText(titleElement.text()) : null;
    }
    
    private String extractCompany(Document doc) {
        Element companyElement = doc.selectFirst(".company-name");
        if (companyElement == null) {
            companyElement = doc.selectFirst(".posting-company");
        }
        if (companyElement == null) {
            String title = doc.title();
            if (title != null && title.contains(" at ")) {
                String[] parts = title.split(" at ");
                if (parts.length > 1) {
                    return webScrapingUtils.cleanText(parts[1].split(" - ")[0].trim());
                }
            }
        }
        
        return companyElement != null ? webScrapingUtils.cleanText(companyElement.text()) : "Unknown Company";
    }
    
    private String extractLocation(Document doc) {
        // Try new structure first: .job__location div (excluding SVG)
        Element locationElement = doc.selectFirst(".job__location div");
        
        // Fallback to older structures
        if (locationElement == null) {
            locationElement = doc.selectFirst(".location");
        }
        if (locationElement == null) {
            locationElement = doc.selectFirst(".posting-location");
        }
        if (locationElement == null) {
            Element element = doc.getElementsContainingOwnText("Remote").first();
            if (element == null) {
                element = doc.getElementsContainingOwnText("United States").first();
            }
            if (element == null) {
                element = doc.getElementsContainingOwnText("San Francisco").first();
            }
            locationElement = element;
        }
        
        return locationElement != null ? webScrapingUtils.cleanText(locationElement.text()) : null;
    }
    
    private String extractDescription(Document doc) {
        // Try new structure first: .job__description.body
        Element descElement = doc.selectFirst(".job__description.body");
        
        // If not found, try selecting the div inside .job__description
        if (descElement == null) {
            descElement = doc.selectFirst(".job__description div");
        }
        
        // Fallback to older structures
        if (descElement == null) {
            descElement = doc.selectFirst("#content");
        }
        if (descElement == null) {
            descElement = doc.selectFirst(".posting-description");
        }
        if (descElement == null) {
            descElement = doc.selectFirst(".content");
        }
        if (descElement == null) {
            descElement = doc.selectFirst("main");
        }
        
        return descElement != null ? webScrapingUtils.cleanText(descElement.text()) : null;
    }
    
    private Map<String, Object> extractCompensation(Document doc) {
        String salaryText = "";
        
        // First try to find salary in specific salary elements
        Element salaryElement = doc.selectFirst(".salary");
        if (salaryElement != null) {
            salaryText = salaryElement.text();
        }
        
        // Look in job description for salary information (new structure)
        if (salaryText.isEmpty()) {
            Element descElement = doc.selectFirst(".job__description");
            if (descElement != null) {
                // Look for elements containing dollar signs
                Elements dollarElements = descElement.getElementsContainingOwnText("$");
                for (Element element : dollarElements) {
                    String text = element.text();
                    // Look for salary ranges or annual salary mentions
                    if (text.contains("Annual Salary") || text.contains("$") && 
                        (text.contains("—") || text.contains("-") || text.contains("to") || text.contains("USD"))) {
                        salaryText = text;
                        break;
                    }
                }
            }
        }
        
        // Fallback to main content area
        if (salaryText.isEmpty()) {
            Element contentElement = doc.selectFirst("#content");
            if (contentElement != null) {
                Element dollarElement = contentElement.getElementsContainingOwnText("$").first();
                if (dollarElement != null) {
                    salaryText = dollarElement.text();
                }
            }
        }
        
        WebScrapingUtils.CompensationInfo compensation = webScrapingUtils.extractCompensation(salaryText);
        
        Map<String, Object> result = new HashMap<>();
        result.put("rawText", salaryText);
        result.put("amount", compensation.getAmount());
        result.put("type", compensation.getType());
        
        return result;
    }

    /**
     * Test basic connectivity to a URL
     */
    @GetMapping("/test-connectivity")
    public ResponseEntity<Map<String, Object>> testConnectivity(@RequestParam String url) {
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("timestamp", System.currentTimeMillis());
        
        try {
            // Test 1: Basic HTTP connectivity
            long startTime = System.currentTimeMillis();
            Document doc = webScrapingUtils.fetchDocument(url);
            long fetchTime = System.currentTimeMillis() - startTime;
            
            result.put("basicFetch", Map.of(
                "success", true,
                "fetchTimeMs", fetchTime,
                "elementCount", doc.getAllElements().size(),
                "textLength", doc.text().length(),
                "title", doc.title(),
                "hasJobContent", hasJobContent(doc),
                "hasJavaScriptIndicators", hasJavaScriptIndicators(doc)
            ));
            
        } catch (Exception e) {
            result.put("basicFetch", Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
        
        // Test 2: JavaScript rendering availability
        result.put("jsRenderingAvailable", jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable());
        
        // Test 3: JavaScript rendering if available
        if (jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable()) {
            try {
                long startTime = System.currentTimeMillis();
                Document jsDoc = jsWebScrapingService.fetchDocumentWithJavaScript(url, 5);
                long jsFetchTime = System.currentTimeMillis() - startTime;
                
                result.put("jsFetch", Map.of(
                    "success", true,
                    "fetchTimeMs", jsFetchTime,
                    "elementCount", jsDoc.getAllElements().size(),
                    "textLength", jsDoc.text().length(),
                    "title", jsDoc.title(),
                    "hasJobContent", hasJobContent(jsDoc),
                    "hasJavaScriptIndicators", hasJavaScriptIndicators(jsDoc)
                ));
                
            } catch (Exception e) {
                result.put("jsFetch", Map.of(
                    "success", false,
                    "error", e.getMessage()
                ));
            }
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get raw HTML content from a URL
     */
    @GetMapping("/raw-html")
    public ResponseEntity<Map<String, Object>> getRawHtml(@RequestParam String url) {
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        
        try {
            Document doc = webScrapingUtils.fetchDocument(url);
            String html = doc.html();
            
            result.put("success", true);
            result.put("htmlLength", html.length());
            result.put("title", doc.title());
            result.put("elementCount", doc.getAllElements().size());
            result.put("textLength", doc.text().length());
            
            // Show first 2000 characters of HTML for inspection
            result.put("htmlPreview", html.length() > 2000 ? html.substring(0, 2000) + "..." : html);
            
            // Show first 1000 characters of text content
            String text = doc.text();
            result.put("textPreview", text.length() > 1000 ? text.substring(0, 1000) + "..." : text);
            
            // Check for common error indicators
            result.put("containsAccessDenied", html.toLowerCase().contains("access denied") || 
                                               html.toLowerCase().contains("forbidden") ||
                                               html.toLowerCase().contains("blocked"));
            result.put("containsBotDetection", html.toLowerCase().contains("bot") ||
                                               html.toLowerCase().contains("captcha") ||
                                               html.toLowerCase().contains("cloudflare"));
            result.put("isRedirectPage", html.toLowerCase().contains("redirecting") ||
                                         html.toLowerCase().contains("please wait"));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("errorType", e.getClass().getSimpleName());
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Test different user agents
     */
    @GetMapping("/test-user-agents")
    public ResponseEntity<Map<String, Object>> testUserAgents(@RequestParam String url) {
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        
        String[] userAgents = {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
        };
        
        Map<String, Object> userAgentResults = new HashMap<>();
        
        for (int i = 0; i < userAgents.length; i++) {
            try {
                Document doc = org.jsoup.Jsoup.connect(url)
                        .userAgent(userAgents[i])
                        .timeout(15000)
                        .get();
                
                userAgentResults.put("userAgent" + (i + 1), Map.of(
                    "userAgent", userAgents[i],
                    "success", true,
                    "elementCount", doc.getAllElements().size(),
                    "textLength", doc.text().length(),
                    "title", doc.title()
                ));
                
            } catch (Exception e) {
                userAgentResults.put("userAgent" + (i + 1), Map.of(
                    "userAgent", userAgents[i],
                    "success", false,
                    "error", e.getMessage()
                ));
            }
        }
        
        result.put("results", userAgentResults);
        return ResponseEntity.ok(result);
    }
    
    private boolean hasJobContent(Document doc) {
        String text = doc.text().toLowerCase();
        return text.contains("qualifications") || 
               text.contains("responsibilities") || 
               text.contains("requirements") ||
               text.contains("salary") ||
               text.contains("experience") ||
               (text.contains("job") && text.contains("description"));
    }
    
    private boolean hasJavaScriptIndicators(Document doc) {
        String html = doc.html().toLowerCase();
        return html.contains("noscript") ||
               html.contains("javascript") ||
               html.contains("window.onload") ||
               html.contains("document.ready") ||
               doc.select("script").size() > 5;
    }

    /**
     * Get manual entry template for Microsoft jobs when parsing fails
     */
    @GetMapping("/microsoft-template")
    public ResponseEntity<Map<String, Object>> getMicrosoftJobTemplate(@RequestParam String url) {
        Map<String, Object> template = new HashMap<>();
        template.put("originalUrl", url);
        template.put("company", "Microsoft");
        
        // Extract job ID if possible
        String jobId = extractJobIdFromUrl(url);
        if (jobId != null) {
            template.put("jobId", jobId);
            template.put("searchInstructions", "Search for job ID '" + jobId + "' on Microsoft careers page");
        }
        
        // Provide helpful suggestions
        template.put("suggestions", Map.of(
            "title", "Copy the job title from the Microsoft careers page",
            "location", "Look for location information (Remote, Redmond, etc.)",
            "description", "Copy key qualifications and responsibilities",
            "experienceLevel", "Determine from title (Senior, Principal, etc.) or requirements",
            "alternativeSearch", "Try searching LinkedIn or Indeed for the same position"
        ));
        
        template.put("instructions", List.of(
            "1. Open the Microsoft URL in your browser",
            "2. Copy the job details manually",
            "3. Use the extracted information to create a job entry",
            "4. Consider searching other job boards for the same position"
        ));
        
        return ResponseEntity.ok(template);
    }
    
    /**
     * Extract job ID from Microsoft URL for helper purposes
     */
    private String extractJobIdFromUrl(String url) {
        if (url == null) return null;
        
        String[] parts = url.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if ("job".equals(parts[i]) && i + 1 < parts.length) {
                String jobId = parts[i + 1];
                if (jobId.matches("\\d+")) {
                    return jobId;
                }
            }
        }
        return null;
    }

    /**
     * Get Playwright queue status
     */
    @GetMapping("/playwright-queue-status")
    public ResponseEntity<Map<String, Object>> getPlaywrightQueueStatus() {
        try {
            Map<String, Object> response = new HashMap<>();
            
            if (jsWebScrapingService != null && jsWebScrapingService.isJavaScriptRenderingAvailable()) {
                var queueStatus = jsWebScrapingService.getQueueStatus();
                response.put("available", true);
                response.put("queueStatus", Map.of(
                    "activeInstances", queueStatus.getActiveInstances(),
                    "queuedRequests", queueStatus.getQueuedRequests(),
                    "maxConcurrentInstances", queueStatus.getMaxConcurrentInstances(),
                    "availableSlots", queueStatus.getAvailableSlots()
                ));
                response.put("engines", jsWebScrapingService.getAvailableJavaScriptEngines());
            } else {
                response.put("available", false);
                response.put("reason", jsWebScrapingService == null ? "JavaScript web scraping service not available" : "Playwright not available");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get queue status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 