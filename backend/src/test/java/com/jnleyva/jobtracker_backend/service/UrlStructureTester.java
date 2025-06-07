package com.jnleyva.jobtracker_backend.service;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.junit.jupiter.api.Test;

import java.io.IOException;

/**
 * URL Structure Tester for debugging job parsers
 * This utility helps analyze HTML structure of job posting URLs
 */
@SpringBootTest
@SpringJUnitConfig
public class UrlStructureTester {
    
    @Autowired
    private WebScrapingUtils webScrapingUtils;
    
    /**
     * Test method to analyze a specific URL structure
     * Replace the URL with the one you want to test
     */
    @Test
    public void testGreenhouseUrl() {
        // Replace this URL with the actual Greenhouse URL you want to test
        String testUrl = "https://boards.greenhouse.io/example/jobs/1234567";
        
        System.out.println("=== URL STRUCTURE TESTER ===");
        System.out.println("Testing URL: " + testUrl);
        System.out.println();
        
        try {
            analyzeUrl(testUrl);
        } catch (Exception e) {
            System.err.println("Error analyzing URL: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Analyze the HTML structure of a given URL
     */
    public void analyzeUrl(String url) throws IOException {
        Document doc = webScrapingUtils.fetchDocument(url);
        
        System.out.println("📄 DOCUMENT TITLE: " + doc.title());
        System.out.println("🔗 URL: " + url);
        System.out.println();
        
        // Test job title selectors
        testJobTitleSelectors(doc);
        
        // Test company selectors
        testCompanySelectors(doc);
        
        // Test location selectors
        testLocationSelectors(doc);
        
        // Test description selectors
        testDescriptionSelectors(doc);
        
        // Test compensation selectors
        testCompensationSelectors(doc);
        
        // Show general document structure
        showDocumentStructure(doc);
        
        // Show all text content for manual analysis
        showTextContent(doc);
    }
    
    private void testJobTitleSelectors(Document doc) {
        System.out.println("🏷️  === JOB TITLE SELECTORS ===");
        
        String[] selectors = {
            ".app-title",
            "h1.posting-headline", 
            "h1",
            ".job-title",
            ".posting-title",
            "[data-qa='job-title']"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            System.out.println("Selector: " + selector + " -> " + 
                (element != null ? "\"" + element.text().trim() + "\"" : "NOT FOUND"));
        }
        System.out.println();
    }
    
    private void testCompanySelectors(Document doc) {
        System.out.println("🏢 === COMPANY SELECTORS ===");
        
        String[] selectors = {
            ".company-name",
            ".posting-company",
            ".company",
            "[data-qa='company-name']",
            ".employer-name"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            System.out.println("Selector: " + selector + " -> " + 
                (element != null ? "\"" + element.text().trim() + "\"" : "NOT FOUND"));
        }
        
        // Check page title for company extraction
        String title = doc.title();
        System.out.println("Title extraction attempt: " + 
            (title.contains(" at ") ? 
                "Found ' at ' in title: \"" + title + "\"" : 
                "No ' at ' pattern in title"));
        System.out.println();
    }
    
    private void testLocationSelectors(Document doc) {
        System.out.println("📍 === LOCATION SELECTORS ===");
        
        String[] selectors = {
            ".location",
            ".posting-location",
            ".job-location",
            "[data-qa='location']",
            ".workplace-type"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            System.out.println("Selector: " + selector + " -> " + 
                (element != null ? "\"" + element.text().trim() + "\"" : "NOT FOUND"));
        }
        
        // Check for common location keywords
        String[] locationKeywords = {"Remote", "United States", "San Francisco", "New York"};
        for (String keyword : locationKeywords) {
            Element element = doc.getElementsContainingOwnText(keyword).first();
            System.out.println("Text search '" + keyword + "': " + 
                (element != null ? "\"" + element.text().trim() + "\"" : "NOT FOUND"));
        }
        System.out.println();
    }
    
    private void testDescriptionSelectors(Document doc) {
        System.out.println("📝 === DESCRIPTION SELECTORS ===");
        
        String[] selectors = {
            "#content",
            ".posting-description",
            ".content",
            "main",
            ".job-description",
            "[data-qa='job-description']"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            if (element != null) {
                String text = element.text().trim();
                System.out.println("Selector: " + selector + " -> Found (" + text.length() + " chars): \"" + 
                    (text.length() > 100 ? text.substring(0, 100) + "..." : text) + "\"");
            } else {
                System.out.println("Selector: " + selector + " -> NOT FOUND");
            }
        }
        System.out.println();
    }
    
    private void testCompensationSelectors(Document doc) {
        System.out.println("💰 === COMPENSATION SELECTORS ===");
        
        String[] selectors = {
            ".salary",
            ".compensation",
            ".pay",
            ".wage",
            "[data-qa='salary']"
        };
        
        for (String selector : selectors) {
            Element element = doc.selectFirst(selector);
            System.out.println("Selector: " + selector + " -> " + 
                (element != null ? "\"" + element.text().trim() + "\"" : "NOT FOUND"));
        }
        
        // Look for dollar signs in main content
        Element contentElement = doc.selectFirst("#content");
        if (contentElement != null) {
            Element dollarElement = contentElement.getElementsContainingOwnText("$").first();
            System.out.println("Dollar sign search in #content: " + 
                (dollarElement != null ? "\"" + dollarElement.text().trim() + "\"" : "NOT FOUND"));
        }
        System.out.println();
    }
    
    private void showDocumentStructure(Document doc) {
        System.out.println("🏗️  === DOCUMENT STRUCTURE ===");
        
        // Show all elements with class attributes
        Elements elementsWithClass = doc.select("[class]");
        System.out.println("Elements with classes (first 20):");
        int count = 0;
        for (Element element : elementsWithClass) {
            if (count >= 20) break;
            System.out.println("  " + element.tagName() + ".\"" + element.className() + "\"");
            count++;
        }
        
        // Show all IDs
        Elements elementsWithId = doc.select("[id]");
        System.out.println("\nElements with IDs:");
        for (Element element : elementsWithId) {
            System.out.println("  " + element.tagName() + "#" + element.id());
        }
        
        // Show data attributes
        Elements elementsWithData = doc.select("[data-qa], [data-testid], [data-test]");
        System.out.println("\nElements with data attributes:");
        for (Element element : elementsWithData) {
            String dataQa = element.attr("data-qa");
            String dataTestId = element.attr("data-testid");
            String dataTest = element.attr("data-test");
            System.out.println("  " + element.tagName() + 
                (dataQa.isEmpty() ? "" : " data-qa=\"" + dataQa + "\"") +
                (dataTestId.isEmpty() ? "" : " data-testid=\"" + dataTestId + "\"") +
                (dataTest.isEmpty() ? "" : " data-test=\"" + dataTest + "\""));
        }
        System.out.println();
    }
    
    private void showTextContent(Document doc) {
        System.out.println("📖 === FULL TEXT CONTENT (first 1000 chars) ===");
        String fullText = doc.text();
        System.out.println(fullText.length() > 1000 ? fullText.substring(0, 1000) + "..." : fullText);
        System.out.println();
        System.out.println("=== END ANALYSIS ===");
    }
    
    /**
     * Helper method to test a specific URL manually
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: UrlStructureTester <url>");
            System.out.println("Example: UrlStructureTester https://boards.greenhouse.io/company/jobs/123456");
            return;
        }
        
        // This would require Spring context setup for standalone execution
        System.out.println("To test a URL, use the testGreenhouseUrl() method in the test class");
        System.out.println("and replace the testUrl variable with your target URL.");
    }
} 