package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.service.WebScrapingUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Specific tests for plain text display functionality
 * Addresses the issue where url-tester.html shows weird characters instead of plain text
 */
@WebMvcTest(DebugController.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class PlainTextDisplayTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WebScrapingUtils webScrapingUtils;

    @MockBean
    private com.jnleyva.jobtracker_backend.service.UserService userService;

    @MockBean
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @MockBean
    private com.jnleyva.jobtracker_backend.service.JobParsingService jobParsingService;

    @MockBean
    private com.jnleyva.jobtracker_backend.service.JwtService jwtService;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @MockBean
    private com.jnleyva.jobtracker_backend.service.TokenBlacklistService tokenBlacklistService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test that the raw HTML endpoint returns actual HTML content, not analysis comments
     * This addresses the "weird characters" issue in url-tester.html
     */
    @Test
    public void testRawHtmlEndpoint_ShouldReturnActualHtml_NotAnalysisComments() throws Exception {
        // Given: A simple HTML document
        String testUrl = "https://example.com";
        String actualHtml = """
            <!DOCTYPE html>
            <html>
            <head><title>Test Page</title></head>
            <body>
                <h1>Welcome to Test Page</h1>
                <p>This is a simple test page with readable content.</p>
                <div class="content">
                    <p>The quick brown fox jumps over the lazy dog.</p>
                    <p>This text should be easily readable when displayed.</p>
                </div>
            </body>
            </html>
            """;
        
        Document mockDocument = Jsoup.parse(actualHtml);
        when(webScrapingUtils.fetchDocument(testUrl)).thenReturn(mockDocument);

        // When: Calling the raw HTML endpoint
        String requestBody = objectMapper.writeValueAsString(Map.of("url", testUrl));

        mockMvc.perform(post("/api/debug/raw-html")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Should return the actual HTML content
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successful").value(true))
                .andExpect(jsonPath("$.url").value(testUrl))
                .andExpect(jsonPath("$.rawHtml").value(containsString("<!doctype html")))
                .andExpect(jsonPath("$.rawHtml").value(containsString("Welcome to Test Page")))
                .andExpect(jsonPath("$.rawHtml").value(containsString("The quick brown fox")))
                .andExpect(jsonPath("$.rawHtml").value(not(containsString("<!-- HTML Analysis for"))))
                .andExpect(jsonPath("$.rawHtml").value(not(containsString("STRUCTURED ANALYSIS DATA"))))
                .andExpect(jsonPath("$.errorMessage").value(nullValue()));
    }

    /**
     * Test that the current url-tester.html implementation shows mixed content instead of plain text
     * This test documents the current problem behavior
     */
    @Test
    public void testCurrentUrlTesterImplementation_ShowsMixedContent_NotPlainText() throws Exception {
        // Given: A document with text content
        String testUrl = "https://example.com/job";
        String htmlContent = """
            <html>
            <head><title>Software Engineer at TechCorp</title></head>
            <body>
                <h1>Software Engineer</h1>
                <div class="company">TechCorp Inc.</div>
                <div class="location">San Francisco, CA</div>
                <div class="description">
                    We are looking for a talented software engineer to join our team.
                    The ideal candidate will have experience with Java, Spring Boot, and React.
                    This is a great opportunity to work on exciting projects.
                </div>
            </body>
            </html>
            """;
        
        Document mockDocument = Jsoup.parse(htmlContent);
        when(webScrapingUtils.fetchDocument(testUrl)).thenReturn(mockDocument);

        // When: Calling the analyze-url endpoint (used by url-tester.html)
        String requestBody = objectMapper.writeValueAsString(Map.of("url", testUrl));

        mockMvc.perform(post("/api/debug/analyze-url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Should return structured analysis data
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value(testUrl))
                .andExpect(jsonPath("$.title").value("Software Engineer at TechCorp"))
                .andExpect(jsonPath("$.textContent").exists())
                .andExpect(jsonPath("$.jobTitleSelectors").exists())
                .andExpect(jsonPath("$.companySelectors").exists())
                .andExpect(jsonPath("$.locationSelectors").exists())
                
                // The text content should be clean and readable
                .andExpect(jsonPath("$.textContent").value(containsString("Software Engineer")))
                .andExpect(jsonPath("$.textContent").value(containsString("TechCorp Inc.")))
                .andExpect(jsonPath("$.textContent").value(containsString("talented software engineer")));
    }

    /**
     * Test plain text extraction from HTML content
     * This should return clean, readable text without HTML tags
     */
    @Test
    public void testPlainTextExtraction_ShouldReturnCleanReadableText() throws Exception {
        // Given: HTML with various formatting
        String testUrl = "https://example.com/complex";
        String complexHtml = """
            <html>
            <head>
                <title>Complex Page with Formatting</title>
                <script>console.log('test');</script>
                <style>.hidden { display: none; }</style>
            </head>
            <body>
                <header>
                    <nav>Navigation Menu</nav>
                </header>
                <main>
                    <h1>Main Title</h1>
                    <p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
                    <ul>
                        <li>First item</li>
                        <li>Second item</li>
                        <li>Third item</li>
                    </ul>
                    <div class="hidden">This should not appear</div>
                    <div>
                        Regular content that should be visible.
                        Multiple sentences in the same div.
                    </div>
                </main>
                <footer>Footer content</footer>
            </body>
            </html>
            """;
        
        Document mockDocument = Jsoup.parse(complexHtml);
        when(webScrapingUtils.fetchDocument(testUrl)).thenReturn(mockDocument);

        // When: Analyzing the URL
        String requestBody = objectMapper.writeValueAsString(Map.of("url", testUrl));

        mockMvc.perform(post("/api/debug/analyze-url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Text content should be clean and readable
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.textContent").value(containsString("Main Title")))
                .andExpect(jsonPath("$.textContent").value(containsString("bold text and italic text")))
                .andExpect(jsonPath("$.textContent").value(containsString("First item Second item Third item")))
                .andExpect(jsonPath("$.textContent").value(containsString("Regular content")))
                .andExpect(jsonPath("$.textContent").value(not(containsString("<script>"))))
                .andExpect(jsonPath("$.textContent").value(not(containsString("<style>"))))
                .andExpect(jsonPath("$.textContent").value(not(containsString("console.log"))))
                .andExpect(jsonPath("$.textContent").value(not(containsString(".hidden"))));
    }

    /**
     * Test error handling for URL fetching issues
     */
    @Test
    public void testPlainTextDisplay_ErrorHandling_ShouldReturnErrorMessage() throws Exception {
        // Given: A URL that causes an exception
        String problematicUrl = "https://nonexistent.example.com";
        when(webScrapingUtils.fetchDocument(problematicUrl))
            .thenThrow(new java.io.IOException("Connection timeout"));

        // When: Attempting to get raw HTML
        String requestBody = objectMapper.writeValueAsString(Map.of("url", problematicUrl));

        mockMvc.perform(post("/api/debug/raw-html")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Should return error response
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.successful").value(false))
                .andExpect(jsonPath("$.url").value(problematicUrl))
                .andExpect(jsonPath("$.rawHtml").value(nullValue()))
                .andExpect(jsonPath("$.errorMessage").value(containsString("Failed to fetch HTML")))
                .andExpect(jsonPath("$.errorMessage").value(containsString("Connection timeout")));
    }

    /**
     * Test that empty or whitespace-only URLs are rejected
     */
    @Test
    public void testPlainTextDisplay_EmptyUrl_ShouldReturnBadRequest() throws Exception {
        // Given: Empty URL
        String requestBody = objectMapper.writeValueAsString(Map.of("url", ""));

        // When: Attempting to get raw HTML
        mockMvc.perform(post("/api/debug/raw-html")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Should return bad request
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("URL is required"));
    }

    /**
     * Test with a realistic job posting URL structure
     */
    @Test
    public void testPlainTextDisplay_JobPostingUrl_ShouldExtractJobContent() throws Exception {
        // Given: A realistic job posting HTML
        String jobUrl = "https://company.com/jobs/software-engineer";
        String jobHtml = """
            <html>
            <head><title>Software Engineer - Company Inc</title></head>
            <body>
                <div class="job-header">
                    <h1 class="job-title">Senior Software Engineer</h1>
                    <div class="company-name">Company Inc</div>
                    <div class="location">Remote - United States</div>
                </div>
                <div class="job-description">
                    <h2>About the Role</h2>
                    <p>We are seeking a talented Senior Software Engineer to join our growing engineering team.</p>
                    
                    <h2>What You'll Do</h2>
                    <ul>
                        <li>Design and implement scalable backend systems</li>
                        <li>Collaborate with product and design teams</li>
                        <li>Mentor junior developers</li>
                    </ul>
                    
                    <h2>Requirements</h2>
                    <ul>
                        <li>5+ years of software development experience</li>
                        <li>Strong proficiency in Java or Python</li>
                        <li>Experience with cloud platforms (AWS, GCP, Azure)</li>
                    </ul>
                    
                    <div class="compensation">
                        <p>Salary: $120,000 - $160,000 annually</p>
                    </div>
                </div>
            </body>
            </html>
            """;
        
        Document mockDocument = Jsoup.parse(jobHtml);
        when(webScrapingUtils.fetchDocument(jobUrl)).thenReturn(mockDocument);

        // When: Getting the text content
        String requestBody = objectMapper.writeValueAsString(Map.of("url", jobUrl));

        mockMvc.perform(post("/api/debug/analyze-url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                
                // Then: Should extract all job-related text cleanly
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.textContent").value(containsString("Senior Software Engineer")))
                .andExpect(jsonPath("$.textContent").value(containsString("Company Inc")))
                .andExpect(jsonPath("$.textContent").value(containsString("Remote - United States")))
                .andExpect(jsonPath("$.textContent").value(containsString("talented Senior Software Engineer")))
                .andExpect(jsonPath("$.textContent").value(containsString("Design and implement scalable")))
                .andExpect(jsonPath("$.textContent").value(containsString("5+ years of software development")))
                .andExpect(jsonPath("$.textContent").value(containsString("$120,000 - $160,000")))
                .andExpect(jsonPath("$.textContent").value(not(containsString("<h2>"))))
                .andExpect(jsonPath("$.textContent").value(not(containsString("<ul>"))))
                .andExpect(jsonPath("$.textContent").value(not(containsString("<li>"))));
    }
} 