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
 * Parser for Meta/Facebook career pages
 * Updated to handle the current Meta careers HTML structure
 */
@Component
@Order(2)
public class MetaJobParser implements JobParser {
    
    private static final Logger logger = LoggerFactory.getLogger(MetaJobParser.class);
    private static final String PARSER_NAME = "META";
    
    private final WebScrapingUtils webScrapingUtils;
    
    @Autowired
    public MetaJobParser(WebScrapingUtils webScrapingUtils) {
        this.webScrapingUtils = webScrapingUtils;
    }
    
    @Override
    public boolean canParse(String url) {
        return url != null && (
            url.contains("metacareers.com") ||
            url.contains("facebook.com/careers") ||
            url.contains("meta.com/careers")
        );
    }
    
    @Override
    public JobParseResult parse(String url) {
        try {
            logger.info("Parsing Meta job URL: {}", url);
            Document doc = webScrapingUtils.fetchDocument(url);
            
            JobParseResult result = JobParseResult.success(PARSER_NAME, url);
            
            // Extract job title
            String jobTitle = extractJobTitle(doc);
            result.setJobTitle(truncateField(webScrapingUtils.cleanText(jobTitle), 500, "jobTitle"));
            
            // Set company
            result.setCompany(truncateField("Meta", 500, "company"));
            
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
            String experienceLevel = extractExperienceLevel(doc, jobTitle, description);
            result.setExperienceLevel(truncateField(experienceLevel, 100, "experienceLevel"));
            
            logger.info("Successfully parsed Meta job: {}", jobTitle);
            return result;
            
        } catch (Exception e) {
            logger.error("Error parsing Meta job URL: {}", url, e);
            return JobParseResult.failure(PARSER_NAME, url, "Failed to parse Meta job: " + e.getMessage());
        }
    }
    
    @Override
    public String getParserName() {
        return PARSER_NAME;
    }
    
    private String extractJobTitle(Document doc) {
        // Try Meta-specific selectors first
        Element titleElement = doc.selectFirst("._army"); // Current Meta structure
        
        // Fallback selectors
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1[data-testid='job-title']");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1.job-title");
        }
        if (titleElement == null) {
            titleElement = doc.selectFirst("h1");
        }
        
        return titleElement != null ? titleElement.text() : null;
    }
    
    private String extractLocation(Document doc) {
        // Try Meta-specific location selectors
        Elements locationElements = doc.select("._careersV2RefreshJobDetailPage__location2024");
        
        if (!locationElements.isEmpty()) {
            StringBuilder locations = new StringBuilder();
            for (Element element : locationElements) {
                String locationText = element.text();
                if (locationText != null && !locationText.trim().isEmpty()) {
                    // Clean up the location text (remove separators)
                    locationText = locationText.replaceAll("\\s*•\\s*$", "").trim();
                    if (!locationText.isEmpty()) {
                        if (locations.length() > 0) {
                            locations.append(", ");
                        }
                        locations.append(locationText);
                    }
                }
            }
            if (locations.length() > 0) {
                return locations.toString();
            }
        }
        
        // Fallback selectors
        Element locationElement = doc.selectFirst("[data-testid='job-location']");
        if (locationElement == null) {
            locationElement = doc.selectFirst(".job-location");
        }
        if (locationElement == null) {
            // Look for common location patterns
            Element element = doc.getElementsContainingOwnText("Remote").first();
            if (element == null) {
                element = doc.getElementsContainingOwnText("CA").first();
            }
            if (element == null) {
                element = doc.getElementsContainingOwnText("United States").first();
            }
            locationElement = element;
        }
        
        return locationElement != null ? locationElement.text() : null;
    }
    
    private String extractDescription(Document doc) {
        StringBuilder description = new StringBuilder();
        
        // Try to extract structured content from Meta career pages
        
        // Look for the main job description area
        Element contentContainer = doc.selectFirst("._8muv._ar_h");
        if (contentContainer != null) {
            // Get the main description paragraph
            Element mainDesc = contentContainer.selectFirst("._1n-_._6hy-._94t2");
            if (mainDesc != null) {
                description.append(mainDesc.text()).append("\n\n");
            }
            
            // Get responsibilities section
            Element responsibilitiesSection = contentContainer.selectFirst("._1n-z._6hy-._8lfs");
            if (responsibilitiesSection != null && responsibilitiesSection.text().contains("Responsibilities")) {
                description.append("Responsibilities:\n");
                Element responsibilitiesList = responsibilitiesSection.nextElementSibling();
                if (responsibilitiesList != null) {
                    Elements listItems = responsibilitiesList.select("._1n-_._6hy-._8lf-");
                    for (Element item : listItems) {
                        description.append("• ").append(item.text()).append("\n");
                    }
                    description.append("\n");
                }
            }
            
            // Get minimum qualifications
            Elements qualificationsSections = contentContainer.select("._1n-z._6hy-._8lfs");
            for (Element section : qualificationsSections) {
                if (section.text().contains("Minimum Qualifications")) {
                    description.append("Minimum Qualifications:\n");
                    Element qualificationsList = section.nextElementSibling();
                    if (qualificationsList != null) {
                        Elements listItems = qualificationsList.select("._1n-_._6hy-._8lf-");
                        for (Element item : listItems) {
                            description.append("• ").append(item.text()).append("\n");
                        }
                        description.append("\n");
                    }
                    break;
                }
            }
            
            // Get preferred qualifications
            for (Element section : qualificationsSections) {
                if (section.text().contains("Preferred Qualifications")) {
                    description.append("Preferred Qualifications:\n");
                    Element qualificationsList = section.nextElementSibling();
                    if (qualificationsList != null) {
                        Elements listItems = qualificationsList.select("._1n-_._6hy-._8lf-");
                        for (Element item : listItems) {
                            description.append("• ").append(item.text()).append("\n");
                        }
                        description.append("\n");
                    }
                    break;
                }
            }
        }
        
        // Fallback to generic selectors if structured extraction failed
        if (description.length() == 0) {
            Element descElement = doc.selectFirst("[data-testid='job-description']");
            if (descElement == null) {
                descElement = doc.selectFirst(".job-description");
            }
            if (descElement == null) {
                descElement = doc.selectFirst("div[role='main']");
            }
            if (descElement == null) {
                descElement = doc.selectFirst("main");
            }
            
            if (descElement != null) {
                return descElement.text();
            }
        }
        
        return description.length() > 0 ? description.toString().trim() : null;
    }
    
    private WebScrapingUtils.CompensationInfo extractCompensation(Document doc) {
        String salaryText = "";
        
        // Look for salary information in the content
        Element salaryElement = doc.selectFirst("[data-testid='salary']");
        if (salaryElement != null) {
            salaryText = salaryElement.text();
        } else {
            // Look for compensation in the job description content
            Element contentElement = doc.selectFirst("._8muv._ar_h");
            if (contentElement != null) {
                String contentText = contentElement.text();
                // Look for salary patterns in the text
                if (contentText.contains("$") && (contentText.contains("/hour") || contentText.contains("/year") || contentText.contains("bonus") || contentText.contains("equity"))) {
                    // Extract the line containing salary information
                    String[] lines = contentText.split("\\n");
                    for (String line : lines) {
                        if (line.contains("$") && (line.contains("/hour") || line.contains("/year") || line.contains("bonus") || line.contains("equity"))) {
                            salaryText = line;
                            break;
                        }
                    }
                }
            }
            
            // Generic fallback
            if (salaryText.isEmpty()) {
                Element element = doc.getElementsContainingOwnText("$").first();
                if (element != null) {
                    salaryText = element.text();
                }
            }
        }
        
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
                Element descElement = doc.selectFirst("[data-testid='job-description']");
                if (descElement == null) {
                    descElement = doc.selectFirst("._8muv._ar_h");
                }
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