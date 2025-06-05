package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Parser for Greenhouse job board URLs
 * Updated to handle the current Greenhouse HTML structure
 */
@Component
@Order(1) // Ensure this parser is checked before generic parser
public class GreenhouseJobParser implements JobParser {
    
    private static final Logger logger = LoggerFactory.getLogger(GreenhouseJobParser.class);
    private static final String PARSER_NAME = "GREENHOUSE";
    
    private final WebScrapingUtils webScrapingUtils;
    
    @Autowired
    public GreenhouseJobParser(WebScrapingUtils webScrapingUtils) {
        this.webScrapingUtils = webScrapingUtils;
    }
    
    @Override
    public boolean canParse(String url) {
        return url != null && (
            url.contains("greenhouse.io") ||
            url.contains("boards.greenhouse.io") ||
            url.contains("job-boards.greenhouse.io")
        );
    }
    
    @Override
    public JobParseResult parse(String url) {
        try {
            logger.info("Parsing Greenhouse job URL: {}", url);
            Document doc = webScrapingUtils.fetchDocument(url);
            
            JobParseResult result = JobParseResult.success(PARSER_NAME, url);
            
            // Extract job title
            String jobTitle = extractJobTitle(doc);
            result.setJobTitle(truncateField(webScrapingUtils.cleanText(jobTitle), 500, "jobTitle"));
            
            // Extract company
            String company = extractCompany(doc, url);
            result.setCompany(truncateField(webScrapingUtils.cleanText(company), 500, "company"));
            
            // Extract location
            String location = extractLocation(doc);
            result.setLocation(truncateField(webScrapingUtils.cleanText(location), 1000, "location"));
            
            // Extract description
            String description = extractDescription(doc);
            result.setDescription(webScrapingUtils.cleanText(description)); // TEXT field, no limit
            
            // Extract compensation
            WebScrapingUtils.CompensationInfo compensation = extractCompensation(doc);
            result.setCompensation(compensation.getAmount());
            result.setCompensationType(truncateField(compensation.getType(), 100, "compensationType"));
            
            // Extract experience level
            String experienceLevel = extractExperienceLevel(doc, jobTitle);
            result.setExperienceLevel(truncateField(experienceLevel, 100, "experienceLevel"));
            
            logger.info("Successfully parsed Greenhouse job: {} at {}", jobTitle, company);
            return result;
            
        } catch (Exception e) {
            logger.error("Error parsing Greenhouse job URL: {}", url, e);
            return JobParseResult.failure(PARSER_NAME, url, "Failed to parse Greenhouse job: " + e.getMessage());
        }
    }
    
    @Override
    public String getParserName() {
        return PARSER_NAME;
    }
    
    private String extractJobTitle(Document doc) {
        // Try current Greenhouse structure: .job__title h1.section-header
        Element titleElement = doc.selectFirst(".job__title h1.section-header");
        
        // Also try h1.section-header.section-header--large.font-primary
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1.section-header.section-header--large.font-primary");
        }
        
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
        
        return titleElement != null ? titleElement.text() : null;
    }
    
    private String extractCompany(Document doc, String url) {
        // Try to extract company name from various selectors
        Element companyElement = doc.selectFirst(".company-name");
        if (companyElement == null) {
            companyElement = doc.selectFirst(".posting-company");
        }
        
        // Try to extract from URL path (job-boards.greenhouse.io/COMPANY/jobs/...)
        if (companyElement == null && url != null) {
            try {
                if (url.contains("job-boards.greenhouse.io/")) {
                    String[] parts = url.split("job-boards\\.greenhouse\\.io/");
                    if (parts.length > 1) {
                        String[] pathParts = parts[1].split("/");
                        if (pathParts.length > 0 && !pathParts[0].isEmpty()) {
                            // Capitalize first letter of company name
                            String companyName = pathParts[0];
                            return Character.toUpperCase(companyName.charAt(0)) + companyName.substring(1);
                        }
                    }
                }
                
                if (url.contains("boards.greenhouse.io/")) {
                    String[] parts = url.split("boards\\.greenhouse\\.io/");
                    if (parts.length > 1) {
                        String[] pathParts = parts[1].split("/");
                        if (pathParts.length > 0 && !pathParts[0].isEmpty()) {
                            String companyName = pathParts[0];
                            return Character.toUpperCase(companyName.charAt(0)) + companyName.substring(1);
                        }
                    }
                }
            } catch (Exception e) {
                logger.debug("Failed to extract company from URL: {}", url, e);
            }
        }
        
        // Try to extract from page title
        if (companyElement == null) {
            String title = doc.title();
            if (title != null && title.contains(" at ")) {
                String[] parts = title.split(" at ");
                if (parts.length > 1) {
                    return parts[1].split(" - ")[0].trim();
                }
            }
        }
        
        return companyElement != null ? companyElement.text() : "Unknown Company";
    }
    
    private String extractLocation(Document doc) {
        // Try current structure: .job__location div (excluding SVG)
        Element locationContainer = doc.selectFirst(".job__location");
        if (locationContainer != null) {
            // Get all div elements in job__location and find the one with text content
            Elements divElements = locationContainer.select("div");
            for (Element div : divElements) {
                String text = div.ownText(); // Only get direct text, not nested elements
                if (text != null && !text.trim().isEmpty() && !text.equals("Remote")) {
                    // Skip if it's just an SVG or icon-related content
                    if (!text.contains("svg") && !text.contains("icon")) {
                        return text.trim();
                    }
                }
            }
            // If no specific div found, try getting text content excluding SVG
            String locationText = locationContainer.text();
            if (locationText != null && !locationText.isEmpty()) {
                // Clean up any SVG-related text
                locationText = locationText.replaceAll("\\s+", " ").trim();
                return locationText;
            }
        }
        
        // Fallback to older structures
        Element locationElement = doc.selectFirst(".location");
        if (locationElement == null) {
            locationElement = doc.selectFirst(".posting-location");
        }
        
        // Look for common location patterns if no specific element found
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
        
        return locationElement != null ? locationElement.text() : null;
    }
    
    private String extractDescription(Document doc) {
        // Try current structure: .job__description.body
        Element descElement = doc.selectFirst(".job__description.body");
        
        // If not found, try selecting the div inside .job__description
        if (descElement == null) {
            descElement = doc.selectFirst(".job__description div");
        }
        
        // Try the main job description container
        if (descElement == null) {
            descElement = doc.selectFirst(".job__description");
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
        
        if (descElement != null) {
            // Clean up the description text
            String description = descElement.text();
            if (description != null && !description.trim().isEmpty()) {
                // Remove any application form related text that might be included
                description = description.replaceAll("(?i)apply for this job.*", "").trim();
                description = description.replaceAll("(?i)submit application.*", "").trim();
                return description;
            }
        }
        
        return null;
    }
    
    private WebScrapingUtils.CompensationInfo extractCompensation(Document doc) {
        String salaryText = "";
        
        // First try to find salary in specific salary elements
        Element salaryElement = doc.selectFirst(".salary");
        if (salaryElement != null) {
            salaryText = salaryElement.text();
        }
        
        // Look in job description for salary information
        if (salaryText.isEmpty()) {
            Element descElement = doc.selectFirst(".job__description");
            if (descElement != null) {
                // Look for elements containing dollar signs
                Elements dollarElements = descElement.getElementsContainingOwnText("$");
                for (Element element : dollarElements) {
                    String text = element.text();
                    // Look for salary ranges or annual salary mentions
                    if (text.contains("Annual Salary") || (text.contains("$") && 
                        (text.contains("—") || text.contains("-") || text.contains("to") || text.contains("USD")))) {
                        salaryText = text;
                        break;
                    }
                }
                
                // If no explicit salary found, look for salary range patterns
                if (salaryText.isEmpty()) {
                    String descText = descElement.text();
                    // Look for patterns like "$105,000—$180,000 USD"
                    if (descText.contains("$") && (descText.contains("—") || descText.contains("–"))) {
                        int dollarIndex = descText.indexOf("$");
                        if (dollarIndex != -1) {
                            // Extract a reasonable substring around the dollar sign
                            int start = Math.max(0, dollarIndex - 20);
                            int end = Math.min(descText.length(), dollarIndex + 50);
                            String potentialSalary = descText.substring(start, end);
                            if (potentialSalary.matches(".*\\$[\\d,]+.*")) {
                                salaryText = potentialSalary;
                            }
                        }
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
        
        return webScrapingUtils.extractCompensation(salaryText);
    }
    
    private String extractExperienceLevel(Document doc, String jobTitle) {
        // First try to extract from job title
        String experienceLevel = webScrapingUtils.extractExperienceLevel(jobTitle);
        
        if (experienceLevel != null && experienceLevel.equals("MID")) {
            // Look for experience information in the description
            Element contentElement = doc.selectFirst(".job__description");
            if (contentElement == null) {
                contentElement = doc.selectFirst("#content");
            }
            
            if (contentElement != null) {
                String contentText = contentElement.text();
                experienceLevel = webScrapingUtils.extractExperienceLevel(contentText);
            }
        }
        
        return experienceLevel;
    }
    
    /**
     * Truncates a field to the specified maximum length and logs if truncation occurs
     */
    private String truncateField(String value, int maxLength, String fieldName) {
        if (value == null) {
            return null;
        }
        
        if (value.length() > maxLength) {
            logger.warn("Field '{}' exceeds maximum length of {}, truncating from {} to {} characters", 
                       fieldName, maxLength, value.length(), maxLength);
            return value.substring(0, maxLength);
        }
        
        return value;
    }
} 