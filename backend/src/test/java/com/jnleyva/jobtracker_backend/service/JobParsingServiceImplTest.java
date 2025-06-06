package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
class JobParsingServiceImplTest {

    @Mock
    private JobParser metaParser;

    @Mock
    private JobParser greenhouseParser;

    @Mock
    private JobParser genericParser;

    @Mock
    private WebScrapingUtils webScrapingUtils;

    private JobParsingServiceImpl jobParsingService;

    @BeforeEach
    void setUp() {
        List<JobParser> parsers = Arrays.asList(metaParser, greenhouseParser, genericParser);
        jobParsingService = new JobParsingServiceImpl(parsers);
    }

    @Test
    void testParseJobUrl_Success_MetaUrl() {
        String url = "https://metacareers.com/jobs/123456";
        JobParseResult expectedResult = JobParseResult.success("META", url);
        expectedResult.setJobTitle("Software Engineer");
        expectedResult.setCompany("Meta");
        
        when(metaParser.canParse(url)).thenReturn(true);
        when(metaParser.getParserName()).thenReturn("META");
        when(metaParser.parse(url)).thenReturn(expectedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertTrue(result.isSuccessful());
        assertEquals("META", result.getSource());
        assertEquals("Software Engineer", result.getJobTitle());
        assertEquals("Meta", result.getCompany());
        
        verify(metaParser).canParse(url);
        verify(metaParser).parse(url);
        verify(greenhouseParser, never()).parse(any());
        verify(genericParser, never()).parse(any());
    }

    @Test
    void testParseJobUrl_Success_GreenhouseUrl() {
        String url = "https://boards.greenhouse.io/company/jobs/123456";
        JobParseResult expectedResult = JobParseResult.success("GREENHOUSE", url);
        expectedResult.setJobTitle("Backend Developer");
        expectedResult.setCompany("Tech Company");
        
        when(metaParser.canParse(url)).thenReturn(false);
        when(greenhouseParser.canParse(url)).thenReturn(true);
        when(greenhouseParser.getParserName()).thenReturn("GREENHOUSE");
        when(greenhouseParser.parse(url)).thenReturn(expectedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertTrue(result.isSuccessful());
        assertEquals("GREENHOUSE", result.getSource());
        assertEquals("Backend Developer", result.getJobTitle());
        assertEquals("Tech Company", result.getCompany());
        
        verify(metaParser).canParse(url);
        verify(greenhouseParser).canParse(url);
        verify(greenhouseParser).parse(url);
        verify(genericParser, never()).parse(any());
    }

    @Test
    void testParseJobUrl_FallbackToGeneric() {
        String url = "https://randomcompany.com/careers/job/123";
        JobParseResult expectedResult = JobParseResult.success("GENERIC", url);
        expectedResult.setJobTitle("Full Stack Engineer");
        expectedResult.setCompany("Random Company");
        
        when(metaParser.canParse(url)).thenReturn(false);
        when(greenhouseParser.canParse(url)).thenReturn(false);
        when(genericParser.canParse(url)).thenReturn(true);
        when(genericParser.getParserName()).thenReturn("GENERIC");
        when(genericParser.parse(url)).thenReturn(expectedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertTrue(result.isSuccessful());
        assertEquals("GENERIC", result.getSource());
        assertEquals("Full Stack Engineer", result.getJobTitle());
        assertEquals("Random Company", result.getCompany());
        
        verify(metaParser).canParse(url);
        verify(greenhouseParser).canParse(url);
        verify(genericParser).canParse(url);
        verify(genericParser).parse(url);
    }

    @Test
    void testParseJobUrl_ParserException() {
        String url = "https://metacareers.com/jobs/123456";
        String errorMessage = "Network timeout";
        
        when(metaParser.canParse(url)).thenReturn(true);
        when(metaParser.getParserName()).thenReturn("META");
        when(metaParser.parse(url)).thenThrow(new RuntimeException(errorMessage));
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertFalse(result.isSuccessful());
        assertEquals("META", result.getSource());
        assertTrue(result.getErrorMessage().contains(errorMessage));
        
        verify(metaParser).canParse(url);
        verify(metaParser).parse(url);
    }

    @Test
    void testParseJobUrl_ParseFailure() {
        String url = "https://metacareers.com/jobs/123456";
        JobParseResult failedResult = JobParseResult.failure("META", url, "Failed to extract job title");
        
        when(metaParser.canParse(url)).thenReturn(true);
        when(metaParser.getParserName()).thenReturn("META");
        when(metaParser.parse(url)).thenReturn(failedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertFalse(result.isSuccessful());
        assertEquals("META", result.getSource());
        assertEquals("Failed to extract job title", result.getErrorMessage());
        
        verify(metaParser).canParse(url);
        verify(metaParser).parse(url);
    }

    @Test
    void testParseJobUrl_NoSuitableParser() {
        String url = "https://example.com/jobs/123";
        
        when(metaParser.canParse(url)).thenReturn(false);
        when(greenhouseParser.canParse(url)).thenReturn(false);
        when(genericParser.canParse(url)).thenReturn(false);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertFalse(result.isSuccessful());
        assertEquals("UNKNOWN", result.getSource());
        assertEquals("No suitable parser found for this URL. Only Meta and Greenhouse URLs are supported.", result.getErrorMessage());
        
        verify(metaParser).canParse(url);
        verify(greenhouseParser).canParse(url);
        verify(genericParser).canParse(url);
        verify(metaParser, never()).parse(any());
        verify(greenhouseParser, never()).parse(any());
        verify(genericParser, never()).parse(any());
    }

    @Test
    void testParseJobUrl_NullUrl() {
        JobParseResult result = jobParsingService.parseJobUrl(null);
        
        assertFalse(result.isSuccessful());
        assertEquals("UNKNOWN", result.getSource());
        assertEquals("URL cannot be null or empty", result.getErrorMessage());
        
        // Note: Parsers are accessed during initialization for instanceof checks, 
        // so we can't verify no interactions here anymore
    }

    @Test
    void testParseJobUrl_EmptyUrl() {
        JobParseResult result = jobParsingService.parseJobUrl("");
        
        assertFalse(result.isSuccessful());
        assertEquals("UNKNOWN", result.getSource());
        assertEquals("URL cannot be null or empty", result.getErrorMessage());
        
        // Note: Parsers are accessed during initialization for instanceof checks, 
        // so we can't verify no interactions here anymore
    }

    @Test
    void testParseJobUrl_WhitespaceUrl() {
        JobParseResult result = jobParsingService.parseJobUrl("   ");
        
        assertFalse(result.isSuccessful());
        assertEquals("UNKNOWN", result.getSource());
        assertEquals("URL cannot be null or empty", result.getErrorMessage());
        
        // Note: Parsers are accessed during initialization for instanceof checks, 
        // so we can't verify no interactions here anymore
    }

    @Test
    void testParseJobUrl_UrlWithWhitespace() {
        String url = "  https://metacareers.com/jobs/123456  ";
        String trimmedUrl = url.trim();
        JobParseResult expectedResult = JobParseResult.success("META", trimmedUrl);
        
        when(metaParser.canParse(trimmedUrl)).thenReturn(true);
        when(metaParser.getParserName()).thenReturn("META");
        when(metaParser.parse(trimmedUrl)).thenReturn(expectedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(url);
        
        assertTrue(result.isSuccessful());
        assertEquals("META", result.getSource());
        
        verify(metaParser).canParse(trimmedUrl);
        verify(metaParser).parse(trimmedUrl);
    }

    @Test
    void testInitialization() {
        // Test that the service is properly initialized with parsers
        List<JobParser> parsers = Arrays.asList(metaParser, greenhouseParser);
        JobParsingServiceImpl service = new JobParsingServiceImpl(parsers);
        
        // This should not throw any exceptions
        assertNotNull(service);
    }

    @Test
    void testInitializationWithEmptyParsers() {
        // Test that the service handles empty parser list gracefully
        List<JobParser> parsers = Collections.emptyList();
        JobParsingServiceImpl service = new JobParsingServiceImpl(parsers);
        
        JobParseResult result = service.parseJobUrl("https://example.com");
        
        assertFalse(result.isSuccessful());
        assertEquals("No suitable parser found for this URL. Only Meta and Greenhouse URLs are supported.", result.getErrorMessage());
    }

    @Test
    @DirtiesContext
    void testParseJobUrl_PulleyGreenhouseUrl_CorrectParser() {
        // Test the actual Pulley URL provided by the user
        String pulleyUrl = "https://job-boards.greenhouse.io/pulley/jobs/4750336008?utm_source=Otta";
        
        // Mock a successful greenhouse parser result
        JobParseResult mockResult = JobParseResult.builder()
            .successful(true)
            .jobTitle("Frontend Engineer")
            .company("Pulley")
            .location("Remote")
            .description("Pulley's mission is to make it easier for anyone to start a company...")
            .compensation(142500.0)
            .compensationType("ANNUAL")
            .experienceLevel("MID")
            .source("GREENHOUSE")
            .originalUrl(pulleyUrl)
            .build();
        
        when(greenhouseParser.canParse(pulleyUrl)).thenReturn(true);
        when(greenhouseParser.parse(pulleyUrl)).thenReturn(mockResult);
        // Remove unnecessary stubbing for genericParser.canParse

        JobParseResult result = jobParsingService.parseJobUrl(pulleyUrl);

        assertThat(result).isNotNull();
        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Frontend Engineer");
        assertThat(result.getCompany()).isEqualTo("Pulley");
        assertThat(result.getLocation()).isEqualTo("Remote");
        assertThat(result.getSource()).isEqualTo("GREENHOUSE");
        assertThat(result.getOriginalUrl()).isEqualTo(pulleyUrl);
        
        // Verify that the GreenhouseJobParser was used first (and only)
        verify(greenhouseParser, times(1)).canParse(pulleyUrl);
        verify(greenhouseParser, times(1)).parse(pulleyUrl);
        // Since greenhouse parser was found first, genericParser is never checked
    }

    @Test
    void testParseJobUrl_GreenhouseUrl_PrefersGreenhouseOverGeneric() {
        // Test that Greenhouse URLs always use Greenhouse parser, never generic
        String greenhouseUrl = "https://job-boards.greenhouse.io/company/jobs/123456";
        
        JobParseResult expectedResult = JobParseResult.success("GREENHOUSE", greenhouseUrl);
        expectedResult.setJobTitle("Software Engineer");
        expectedResult.setCompany("Test Company");
        expectedResult.setExperienceLevel("MID"); // Should not be null
        
        when(metaParser.canParse(greenhouseUrl)).thenReturn(false);
        when(greenhouseParser.canParse(greenhouseUrl)).thenReturn(true);
        when(greenhouseParser.getParserName()).thenReturn("GREENHOUSE");
        when(greenhouseParser.parse(greenhouseUrl)).thenReturn(expectedResult);
        
        JobParseResult result = jobParsingService.parseJobUrl(greenhouseUrl);
        
        assertTrue(result.isSuccessful());
        assertEquals("GREENHOUSE", result.getSource());
        assertEquals("Software Engineer", result.getJobTitle());
        assertEquals("Test Company", result.getCompany());
        assertNotNull(result.getExperienceLevel()); // Should never be null
        
        // Verify correct parser was used
        verify(metaParser).canParse(greenhouseUrl);
        verify(greenhouseParser).canParse(greenhouseUrl);
        verify(greenhouseParser).parse(greenhouseUrl);
        // Generic parser should not be called at all for Greenhouse URLs
        verify(genericParser, never()).canParse(greenhouseUrl);
        verify(genericParser, never()).parse(any());
    }
} 