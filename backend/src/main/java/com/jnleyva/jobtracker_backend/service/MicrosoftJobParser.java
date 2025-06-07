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
 * Enhanced parser for Microsoft job postings with JavaScript rendering support.
 * 
 * Supports Microsoft career URLs including:
 * - careers.microsoft.com
 * - jobs.careers.microsoft.com  
 * - microsoft.com/careers
 * - microsoft.com/jobs
 * - jobs.microsoft.com
 * 
 * This parser first attempts to use JavaScript rendering when available,
 * with intelligent fallbacks to static HTML parsing for better compatibility.
 */
@Component
@Order(3)
public class MicrosoftJobParser implements JobParser {
    
    private static final Logger logger = LoggerFactory.getLogger(MicrosoftJobParser.class);
    private static final String PARSER_NAME = "MICROSOFT";
    
    private final WebScrapingUtils webScrapingUtils;
    private final JavaScriptWebScrapingService jsWebScrapingService;
    
    @Autowired
    public MicrosoftJobParser(WebScrapingUtils webScrapingUtils, JavaScriptWebScrapingService jsWebScrapingService) {
        this.webScrapingUtils = webScrapingUtils;
        this.jsWebScrapingService = jsWebScrapingService;
    }
    
    @Override
    public boolean canParse(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        url = url.trim().toLowerCase();
        return url.contains("careers.microsoft.com") || 
               url.contains("jobs.careers.microsoft.com") ||
               url.contains("microsoft.com/careers") ||
               url.contains("microsoft.com/jobs") ||
               url.contains("jobs.microsoft.com");
    }
    
    @Override
    public JobParseResult parse(String url) {
        try {
            logger.info("Parsing Microsoft job URL: {}", url);
            
            // Try JavaScript rendering first for Microsoft URLs
            Document doc = fetchDocumentWithBestMethod(url);
            
            // Analyze document quality
            DocumentAnalysis analysis = analyzeDocument(doc, url);
            
            if (!analysis.hasJobContent && analysis.appearJavaScriptRendered) {
                return createJavaScriptFailureResult(url, analysis);
            }
            
            // Extract job information
            String jobTitle = extractJobTitle(doc);
            String location = extractLocation(doc);
            String description = extractDescription(doc);
            WebScrapingUtils.CompensationInfo compensationInfo = extractCompensation(doc);
            String experienceLevel = extractExperienceLevel(doc, jobTitle, description);
            
            // Log extracted values for debugging
            logger.debug("Extracted job title: '{}'", jobTitle);
            logger.debug("Extracted location: '{}'", location);
            logger.debug("Extracted description length: {}", description != null ? description.length() : 0);
            logger.debug("Extracted compensation: {}", compensationInfo);
            
            if (jobTitle == null || jobTitle.trim().isEmpty()) {
                logger.warn("Could not extract job title from Microsoft job page. URL: {}", url);
                return JobParseResult.failure(PARSER_NAME, url, 
                    "Failed to extract job title. " + getRecommendedSolution(analysis));
            }
            
            JobParseResult.JobParseResultBuilder builder = JobParseResult.builder()
                    .successful(true)
                    .source(PARSER_NAME)
                    .originalUrl(url)
                    .company("Microsoft")
                    .jobTitle(truncateField(jobTitle, 255, "jobTitle"))
                    .location(truncateField(location, 255, "location"))
                    .description(truncateField(description, 10000, "description"))
                    .experienceLevel(experienceLevel);
            
            if (compensationInfo != null && compensationInfo.getAmount() != null) {
                builder.compensation(compensationInfo.getAmount())
                        .compensationType(compensationInfo.getType());
            }
            
            logger.info("Successfully parsed Microsoft job: {}", jobTitle);
            return builder.build();
            
        } catch (Exception e) {
            logger.error("Error parsing Microsoft job URL: {}", url, e);
            return JobParseResult.failure(PARSER_NAME, url, "Failed to parse Microsoft job: " + e.getMessage());
        }
    }
    
    @Override
    public String getParserName() {
        return PARSER_NAME;
    }
    
    /**
     * Fetch document using the best available method
     */
    private Document fetchDocumentWithBestMethod(String url) throws Exception {
        Document bestDoc = null;
        Exception lastException = null;
        
        // Strategy 1: Try JavaScript rendering first if available
        if (jsWebScrapingService.isJavaScriptRenderingAvailable()) {
            try {
                logger.debug("Attempting JavaScript rendering for Microsoft URL: {}", url);
                Document jsDoc = jsWebScrapingService.fetchDocumentWithJavaScript(url, 10); // Wait 10 seconds for Microsoft
                
                // Verify the JavaScript-rendered document is meaningful
                if (jsDoc.getAllElements().size() > 100 && jsDoc.text().length() > 1000) {
                    logger.debug("JavaScript rendering successful, found {} elements, {} text length", 
                               jsDoc.getAllElements().size(), jsDoc.text().length());
                    return jsDoc;
                } else {
                    logger.warn("JavaScript rendering produced minimal content: {} elements, {} text length", 
                               jsDoc.getAllElements().size(), jsDoc.text().length());
                    bestDoc = jsDoc; // Keep as fallback
                }
            } catch (Exception e) {
                logger.warn("JavaScript rendering failed for {}: {}", url, e.getMessage());
                lastException = e;
            }
        }
        
        // Strategy 2: Try different static HTML approaches
        try {
            logger.debug("Attempting static HTML fetching with enhanced headers for: {}", url);
            Document staticDoc = fetchWithEnhancedHeaders(url);
            
            if (staticDoc.getAllElements().size() > 50) {
                logger.debug("Enhanced static HTML fetch successful: {} elements, {} text length", 
                           staticDoc.getAllElements().size(), staticDoc.text().length());
                
                // If this is better than our JS result, use it
                if (bestDoc == null || staticDoc.getAllElements().size() > bestDoc.getAllElements().size()) {
                    bestDoc = staticDoc;
                }
            }
        } catch (Exception e) {
            logger.warn("Enhanced static HTML fetch failed for {}: {}", url, e.getMessage());
            if (lastException == null) {
                lastException = e;
            }
        }
        
        // Strategy 3: Try basic static HTML as last resort
        if (bestDoc == null || bestDoc.getAllElements().size() < 20) {
            try {
                logger.debug("Attempting basic static HTML fetching for: {}", url);
                Document basicDoc = webScrapingUtils.fetchDocument(url);
                
                if (bestDoc == null || basicDoc.getAllElements().size() > bestDoc.getAllElements().size()) {
                    bestDoc = basicDoc;
                }
            } catch (Exception e) {
                logger.warn("Basic static HTML fetch failed for {}: {}", url, e.getMessage());
                if (lastException == null) {
                    lastException = e;
                }
            }
        }
        
        // Return the best document we got, or throw the last exception
        if (bestDoc != null) {
            logger.debug("Returning best document with {} elements, {} text length", 
                        bestDoc.getAllElements().size(), bestDoc.text().length());
            return bestDoc;
        }
        
        throw lastException != null ? lastException : new Exception("All fetch strategies failed");
    }
    
    /**
     * Fetch document with enhanced headers to bypass some bot detection
     */
    private Document fetchWithEnhancedHeaders(String url) throws Exception {
        // Use JSoup with enhanced headers that mimic a real browser better
        return org.jsoup.Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept-Encoding", "gzip, deflate, br")
                .header("DNT", "1")
                .header("Connection", "keep-alive")
                .header("Upgrade-Insecure-Requests", "1")
                .header("Sec-Fetch-Dest", "document")
                .header("Sec-Fetch-Mode", "navigate")
                .header("Sec-Fetch-Site", "none")
                .header("Sec-Fetch-User", "?1")
                .header("sec-ch-ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Microsoft Edge\";v=\"120\"")
                .header("sec-ch-ua-mobile", "?0")
                .header("sec-ch-ua-platform", "\"Windows\"")
                .header("Cache-Control", "max-age=0")
                .referrer("https://www.google.com/")
                .followRedirects(true)
                .timeout(30000)
                .get();
    }
    
    /**
     * Analyze document to determine its quality and whether it appears to be JavaScript-rendered
     */
    private DocumentAnalysis analyzeDocument(Document doc, String url) {
        DocumentAnalysis analysis = new DocumentAnalysis();
        
        analysis.title = doc.title();
        analysis.elementCount = doc.getAllElements().size();
        analysis.textContent = doc.text();
        
        // Look for actual job content
        Elements h1Elements = doc.select("h1");
        analysis.hasJobTitle = h1Elements.size() > 0 && 
                              h1Elements.stream().anyMatch(h1 -> {
                                  String text = h1.text().trim();
                                  return !text.isEmpty() && 
                                         !text.toLowerCase().contains("search") &&
                                         !text.toLowerCase().contains("careers") &&
                                         !text.toLowerCase().contains("microsoft");
                              });
        
        analysis.hasJobSections = doc.select("h3:contains(Overview), h3:contains(Qualifications), h3:contains(Responsibilities)").size() > 0;
        analysis.hasSalaryInfo = analysis.textContent.contains("Microsoft") && analysis.textContent.contains("$");
        analysis.hasJobContent = analysis.hasJobTitle || analysis.hasJobSections || analysis.hasSalaryInfo;
        
        // Detect JavaScript rendering indicators
        analysis.appearJavaScriptRendered = !analysis.hasJobContent && 
            (analysis.elementCount < 50 || 
             analysis.title.contains("Search Jobs") || 
             (analysis.title.contains("Microsoft Careers") && !analysis.title.contains("- Microsoft")));
        
        logger.debug("Document analysis for {}: hasJobContent={}, elementCount={}, title='{}'", 
                    url, analysis.hasJobContent, analysis.elementCount, analysis.title);
        
        return analysis;
    }
    
    /**
     * Create appropriate error result for JavaScript-rendered pages
     */
    private JobParseResult createJavaScriptFailureResult(String url, DocumentAnalysis analysis) {
        StringBuilder errorMessage = new StringBuilder();
        StringBuilder recommendations = new StringBuilder();
        
        // Check if this is the known problematic URL format
        boolean isComplexReactApp = url.contains("jobs.careers.microsoft.com") && 
                                   analysis.title.equals("Search Jobs | Microsoft Careers") &&
                                   analysis.elementCount < 50;
        
        if (isComplexReactApp) {
            errorMessage.append("Microsoft job page uses a complex React application that cannot be automatically parsed. ");
            recommendations.append("SOLUTIONS: ");
            recommendations.append("1) Try using the job ID directly: search for '1818936' on Microsoft careers page, ");
            recommendations.append("2) Use alternative Microsoft URL formats (try different region/language combinations), ");
            recommendations.append("3) Copy job details manually from your browser, ");
            recommendations.append("4) Look for the same job on other job boards (LinkedIn, Indeed, etc.). ");
            
            // Try to extract job ID for helpful message
            String jobId = extractJobIdFromUrl(url);
            if (jobId != null) {
                recommendations.append("Job ID ").append(jobId).append(" can be searched manually on Microsoft careers site. ");
            }
            
        } else if (jsWebScrapingService.isJavaScriptRenderingAvailable()) {
            errorMessage.append("Microsoft job page could not be parsed successfully. ");
            
            if (analysis.elementCount < 20) {
                errorMessage.append("The page appears to have strong anti-bot protection or is not loading properly. ");
                recommendations.append("Try: 1) Use a direct link to a specific job posting, ");
                recommendations.append("2) Copy the job details manually, ");
                recommendations.append("3) Check if the URL is correct and accessible in a browser. ");
            } else if (analysis.elementCount < 100) {
                errorMessage.append("The page loaded partially but lacks job-specific content. ");
                recommendations.append("Try: 1) Wait a few minutes and try again, ");
                recommendations.append("2) Use a different Microsoft job URL format, ");
                recommendations.append("3) Look for alternative job posting URLs on Microsoft's career site. ");
            } else {
                errorMessage.append("The page structure may have changed or contains unrecognized content. ");
                recommendations.append("Try: 1) Refresh the page and try again, ");
                recommendations.append("2) Check if this is a valid job posting URL, ");
                recommendations.append("3) Report this issue if the problem persists. ");
            }
        } else {
            errorMessage.append("Microsoft job page requires JavaScript rendering for full content access. ");
            recommendations.append("To improve parsing success: 1) Enable JavaScript rendering by adding Selenium WebDriver to your environment, ");
            recommendations.append("2) Try using direct job posting URLs instead of search pages, ");
            recommendations.append("3) Consider manual entry for Microsoft jobs until JavaScript support is available. ");
        }
        
        String fullMessage = errorMessage.toString() + recommendations.toString();
        
        logger.warn("Microsoft job parsing failed. URL: {}, Title: '{}', Elements: {}, HasJobContent: {}, Message: {}", 
                   url, analysis.title, analysis.elementCount, analysis.hasJobContent, fullMessage);
        
        return JobParseResult.failure(PARSER_NAME, url, fullMessage);
    }
    
    /**
     * Extract job ID from Microsoft URL for user reference
     */
    private String extractJobIdFromUrl(String url) {
        if (url == null) return null;
        
        // Pattern: jobs.careers.microsoft.com/global/en/job/{ID}/title
        String[] parts = url.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if ("job".equals(parts[i]) && i + 1 < parts.length) {
                String jobId = parts[i + 1];
                if (jobId.matches("\\d+")) { // Only numeric IDs
                    return jobId;
                }
            }
        }
        return null;
    }
    
    /**
     * Get recommended solution based on document analysis
     */
    private String getRecommendedSolution(DocumentAnalysis analysis) {
        if (analysis.appearJavaScriptRendered) {
            if (jsWebScrapingService.isJavaScriptRenderingAvailable()) {
                if (analysis.elementCount < 20) {
                    return "The page may have anti-bot protection. Try a different Microsoft job URL or wait before retrying.";
                } else {
                    return "The page structure may have changed. Please verify this is a valid job posting URL.";
                }
            } else {
                return "Enable JavaScript rendering support for better Microsoft job parsing, or try manual entry.";
            }
        }
        return "The page structure may have changed, the job posting may no longer be available, or the URL may be incorrect.";
    }
    
    /**
     * Inner class to hold document analysis results
     */
    private static class DocumentAnalysis {
        String title;
        int elementCount;
        String textContent;
        boolean hasJobTitle;
        boolean hasJobSections;
        boolean hasSalaryInfo;
        boolean hasJobContent;
        boolean appearJavaScriptRendered;
    }
    
    private String extractJobTitle(Document doc) {
        // First, try to extract from the page title which seems to have the correct format
        String pageTitle = doc.title();
        if (pageTitle != null && !pageTitle.trim().isEmpty()) {
            // Microsoft format: "Principal Group SWE Manager | Microsoft Careers"
            if (pageTitle.contains(" | Microsoft Careers")) {
                String jobTitle = pageTitle.replace(" | Microsoft Careers", "").trim();
                if (!jobTitle.isEmpty() && 
                    !jobTitle.toLowerCase().contains("search jobs") && 
                    !jobTitle.toLowerCase().equals("microsoft careers")) {
                    logger.debug("Extracted job title from page title: '{}'", jobTitle);
                    return jobTitle;
                }
            }
        }
        
        // Try specific Microsoft job title selectors, but avoid the "Job you selected" placeholder
        Element titleElement = null;
        
        // Most common Microsoft job title pattern - h1 with specific styling
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1[style*='font-weight'][style*='font-size']");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null; // Ignore the placeholder
            }
        }
        
        // Try Microsoft-specific class-based selectors
        if (titleElement == null) {
            titleElement = doc.selectFirst(".SearchJobDetailsCard h1");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null;
            }
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst(".ms-DocumentCard h1");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null;
            }
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("div[role='group'] h1");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null;
            }
        }
        
        // Try any h1 that's not a page title or placeholder
        if (titleElement == null) {
            Elements h1Elements = doc.select("h1");
            for (Element h1 : h1Elements) {
                String text = h1.text().trim();
                // Skip common page titles and the placeholder
                if (!text.toLowerCase().contains("search") && 
                    !text.toLowerCase().contains("careers") && 
                    !text.toLowerCase().contains("microsoft") &&
                    !text.equals("Job you selected") &&
                    text.length() > 5) {
                    titleElement = h1;
                    break;
                }
            }
        }
        
        // Look for job title in alternative locations like data attributes or aria-labels
        if (titleElement == null) {
            titleElement = doc.selectFirst("[data-automation-id*='jobTitle']");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("[aria-label*='job title']");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("*[data-testid*='job-title']");
        }
        
        // Generic fallback selectors (but still avoid placeholder)
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1[data-testid='job-title']");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null;
            }
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1.job-title");
            if (titleElement != null && titleElement.text().trim().equals("Job you selected")) {
                titleElement = null;
            }
        }
        
        // Last resort: try any h1 that's not the placeholder
        if (titleElement == null) {
            Element h1 = doc.selectFirst("h1");
            if (h1 != null && !h1.text().trim().equals("Job you selected")) {
                titleElement = h1;
            }
        }
        
        String extractedTitle = titleElement != null ? titleElement.text().trim() : null;
        
        // Final validation - if we still got the placeholder, try to use page title as fallback
        if ("Job you selected".equals(extractedTitle) && pageTitle != null) {
            if (pageTitle.contains(" | Microsoft Careers")) {
                String fallbackTitle = pageTitle.replace(" | Microsoft Careers", "").trim();
                if (!fallbackTitle.isEmpty() && !fallbackTitle.toLowerCase().contains("search jobs")) {
                    logger.debug("Using page title as fallback for job title: '{}'", fallbackTitle);
                    return fallbackTitle;
                }
            }
        }
        
        return extractedTitle;
    }
    
    private String extractLocation(Document doc) {
        Element locationElement = null;
        
        // Look for Microsoft-specific location patterns - try different approaches
        
        // Try paragraphs with common Microsoft styling
        if (locationElement == null) {
            Elements pElements = doc.select("p[style*='font-size: 14px']");
            for (Element p : pElements) {
                String text = p.text().trim();
                // Check if this looks like a location (contains common location indicators)
                if (text.contains(",") && (text.contains("United States") || text.contains("Washington") || 
                    text.contains("Remote") || text.contains("WA") || text.length() < 100)) {
                    locationElement = p;
                    break;
                }
            }
        }
        
        // Alternative Microsoft location selectors
        if (locationElement == null) {
            locationElement = doc.selectFirst(".ms-Stack-inner p");
        }
        
        // Look for any paragraph containing location-like text
        if (locationElement == null) {
            Elements allParagraphs = doc.select("p");
            for (Element p : allParagraphs) {
                String text = p.text().trim();
                if ((text.contains("Redmond") || text.contains("Seattle") || text.contains("Washington") ||
                     text.contains("United States") || text.contains("Remote")) && text.length() < 100) {
                    locationElement = p;
                    break;
                }
            }
        }
        
        // Look for common location patterns in text using getElementsContainingOwnText
        if (locationElement == null) {
            Element element = doc.getElementsContainingOwnText("Redmond, Washington").first();
            if (element == null) {
                element = doc.getElementsContainingOwnText("Seattle, Washington").first();
            }
            if (element == null) {
                element = doc.getElementsContainingOwnText("Remote").first();
            }
            if (element == null) {
                element = doc.getElementsContainingOwnText("United States").first();
            }
            locationElement = element;
        }
        
        // Generic fallback selectors
        if (locationElement == null) {
            locationElement = doc.selectFirst("[data-testid='job-location']");
        }
        if (locationElement == null) {
            locationElement = doc.selectFirst(".job-location");
        }
        
        return locationElement != null ? locationElement.text().trim() : null;
    }
    
    private String extractDescription(Document doc) {
        StringBuilder description = new StringBuilder();
        
        // Look for Microsoft-specific job description structure
        
        // Try to find Overview section
        Element overviewSection = doc.selectFirst("h3:contains(Overview)");
        if (overviewSection != null) {
            Element overviewContent = overviewSection.nextElementSibling();
            if (overviewContent != null) {
                description.append("Overview:\n").append(overviewContent.text()).append("\n\n");
            }
        }
        
        // Try to find Qualifications section
        Element qualificationsSection = doc.selectFirst("h3:contains(Qualifications)");
        if (qualificationsSection != null) {
            Element qualificationsContent = qualificationsSection.nextElementSibling();
            if (qualificationsContent != null) {
                description.append("Qualifications:\n").append(qualificationsContent.text()).append("\n\n");
            }
        }
        
        // Try to find Responsibilities section
        Element responsibilitiesSection = doc.selectFirst("h3:contains(Responsibilities)");
        if (responsibilitiesSection != null) {
            Element responsibilitiesContent = responsibilitiesSection.nextElementSibling();
            if (responsibilitiesContent != null) {
                description.append("Responsibilities:\n").append(responsibilitiesContent.text()).append("\n\n");
            }
        }
        
        // If structured content wasn't found, try generic selectors
        if (description.length() == 0) {
            // Try main content areas
            Element descElement = doc.selectFirst(".ms-DocumentCard");
            if (descElement == null) {
                descElement = doc.selectFirst("main[id='main-content']");
            }
            if (descElement == null) {
                descElement = doc.selectFirst("[data-testid='job-description']");
            }
            if (descElement == null) {
                descElement = doc.selectFirst(".job-description");
            }
            if (descElement == null) {
                descElement = doc.selectFirst("main");
            }
            
            if (descElement != null) {
                // Extract text content while preserving some structure
                Elements sections = descElement.select("h3, p, ul, ol, div[class*='description']");
                for (Element section : sections) {
                    String text = section.text().trim();
                    if (!text.isEmpty() && text.length() > 10) { // Filter out short/empty elements
                        description.append(text).append("\n\n");
                    }
                }
                
                // If sections approach didn't work, get all text
                if (description.length() == 0) {
                    description.append(descElement.text());
                }
            }
        }
        
        return description.length() > 0 ? description.toString().trim() : null;
    }
    
    private WebScrapingUtils.CompensationInfo extractCompensation(Document doc) {
        String salaryText = "";
        
        // Look for salary information in Microsoft job pages
        Element salaryElement = doc.selectFirst("[data-testid='salary']");
        if (salaryElement != null) {
            salaryText = salaryElement.text();
        } else {
            // Look for compensation patterns in the entire document text
            String fullText = doc.text();
            
            // Look for Microsoft-specific salary patterns with improved regex matching
            if (fullText.contains("$") && (fullText.contains("per year") || fullText.contains("/year") || 
                fullText.contains("annually") || fullText.contains("USD"))) {
                
                // Try to extract salary ranges like "USD $161,600 - $286,200 per year"
                String[] sentences = fullText.split("\\.");
                for (String sentence : sentences) {
                    if (sentence.contains("$") && sentence.contains("USD") && sentence.contains("-") && 
                        (sentence.contains("per year") || sentence.contains("year"))) {
                        salaryText = sentence.trim();
                        break;
                    }
                }
                
                // If no range found, look for any sentence with salary info
                if (salaryText.isEmpty()) {
                    for (String sentence : sentences) {
                        if (sentence.contains("$") && (sentence.contains("per year") || sentence.contains("/year") || 
                            sentence.contains("annually") || sentence.contains("USD"))) {
                            salaryText = sentence.trim();
                            break;
                        }
                    }
                }
            }
            
            // Alternative approach: look in specific content areas
            if (salaryText.isEmpty()) {
                Element contentElement = doc.selectFirst("main");
                if (contentElement == null) {
                    contentElement = doc.selectFirst(".ms-DocumentCard");
                }
                if (contentElement == null) {
                    contentElement = doc.selectFirst("body");
                }
                
                if (contentElement != null) {
                    String contentText = contentElement.text();
                    
                    // Look for ranges like "USD $161,600 - $286,200"
                    if (contentText.contains("USD") && contentText.contains("$") && contentText.contains("-")) {
                        String[] lines = contentText.split("\\n");
                        for (String line : lines) {
                            if (line.contains("USD") && line.contains("$") && line.contains("-")) {
                                salaryText = line.trim();
                                break;
                            }
                        }
                    }
                }
            }
            
            // Generic fallback
            if (salaryText.isEmpty()) {
                Elements dollarElements = doc.getElementsContainingOwnText("$");
                for (Element element : dollarElements) {
                    String text = element.text();
                    // Make sure it looks like salary information
                    if ((text.contains("USD") || text.contains("year") || text.contains("annual")) &&
                        text.contains("$")) {
                        salaryText = text;
                        break;
                    }
                }
            }
        }
        
        logger.debug("Extracted salary text: '{}'", salaryText);
        return webScrapingUtils.extractCompensation(salaryText);
    }
    
    private String extractExperienceLevel(Document doc, String jobTitle, String description) {
        // First try to extract from job title
        String experienceLevel = webScrapingUtils.extractExperienceLevel(jobTitle);
        
        if (experienceLevel != null && experienceLevel.equals("MID")) {
            // Look for experience information in the description
            if (description != null) {
                experienceLevel = webScrapingUtils.extractExperienceLevel(description);
            } else {
                Element descElement = doc.selectFirst("main");
                if (descElement != null) {
                    String descText = descElement.text();
                    experienceLevel = webScrapingUtils.extractExperienceLevel(descText);
                }
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