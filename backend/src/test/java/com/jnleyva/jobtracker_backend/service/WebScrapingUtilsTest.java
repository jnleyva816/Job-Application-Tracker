package com.jnleyva.jobtracker_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class WebScrapingUtilsTest {

    private WebScrapingUtils webScrapingUtils;

    @BeforeEach
    void setUp() {
        webScrapingUtils = new WebScrapingUtils();
    }

    @Test
    void testCleanText_WithWhitespace() {
        String input = "  This   is    some   text  ";
        String result = webScrapingUtils.cleanText(input);
        assertEquals("This is some text", result);
    }

    @Test
    void testCleanText_WithNull() {
        String result = webScrapingUtils.cleanText(null);
        assertNull(result);
    }

    @Test
    void testCleanText_WithNewlines() {
        String input = "Line 1\n\nLine 2\n\nLine 3";
        String result = webScrapingUtils.cleanText(input);
        assertEquals("Line 1 Line 2 Line 3", result);
    }

    @Test
    void testExtractCompensation_AnnualSalary() {
        String input = "Salary: $100,000 per year";
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(100000.0, result.getAmount());
        assertEquals("ANNUAL", result.getType());
    }

    @Test
    void testExtractCompensation_AnnualSalaryWithK() {
        String input = "Salary: $100k annually";
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(100000.0, result.getAmount());
        assertEquals("ANNUAL", result.getType());
    }

    @Test
    void testExtractCompensation_HourlySalary() {
        String input = "Pay: $25 per hour";
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(25.0, result.getAmount());
        assertEquals("HOURLY", result.getType());
    }

    @Test
    void testExtractCompensation_SalaryRange() {
        String input = "Salary: $80,000 - $120,000 per year";
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(100000.0, result.getAmount()); // Average of range
        assertEquals("ANNUAL", result.getType());
    }

    @Test
    void testExtractCompensation_NoSalary() {
        String input = "This is a job description without salary information";
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertNull(result.getAmount());
        assertEquals("UNKNOWN", result.getType());
    }

    @Test
    void testExtractCompensation_GuessBasedOnAmount() {
        String input = "Pay: $15"; // Low amount, likely hourly
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(15.0, result.getAmount());
        assertEquals("HOURLY", result.getType());
    }

    @Test
    void testExtractCompensation_GuessBasedOnHighAmount() {
        String input = "Compensation: $90000"; // High amount, likely annual
        WebScrapingUtils.CompensationInfo result = webScrapingUtils.extractCompensation(input);
        
        assertEquals(90000.0, result.getAmount());
        assertEquals("ANNUAL", result.getType());
    }

    @Test
    void testExtractExperienceLevel_Senior() {
        String input = "Senior Software Engineer position";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("SENIOR", result);
    }

    @Test
    void testExtractExperienceLevel_Lead() {
        String input = "Lead Developer role available";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("SENIOR", result);
    }

    @Test
    void testExtractExperienceLevel_Junior() {
        String input = "Junior Developer - Entry Level";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("JUNIOR", result);
    }

    @Test
    void testExtractExperienceLevel_Associate() {
        String input = "Associate Software Engineer";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("JUNIOR", result);
    }

    @Test
    void testExtractExperienceLevel_Intern() {
        String input = "Summer Internship position";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("INTERN", result);
    }

    @Test
    void testExtractExperienceLevel_Mid() {
        String input = "Mid-level Software Engineer";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("MID", result);
    }

    @Test
    void testExtractExperienceLevel_Unknown() {
        String input = "Software Engineer position";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("MID", result); // Default to MID
    }

    @Test
    void testExtractExperienceLevel_WithNull() {
        String result = webScrapingUtils.extractExperienceLevel(null);
        assertNull(result);
    }

    @Test
    void testExtractExperienceLevel_Principal() {
        String input = "Principal Engineer - Architecture Team";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("SENIOR", result);
    }

    @Test
    void testExtractExperienceLevel_Staff() {
        String input = "Staff Software Engineer";
        String result = webScrapingUtils.extractExperienceLevel(input);
        assertEquals("SENIOR", result);
    }
} 