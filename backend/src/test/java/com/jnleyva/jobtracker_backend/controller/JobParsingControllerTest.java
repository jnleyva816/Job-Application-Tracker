package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.JobParseResult;
import com.jnleyva.jobtracker_backend.service.JobParsingService;
import com.jnleyva.jobtracker_backend.service.WebScrapingUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(JobParsingController.class)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class JobParsingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobParsingService jobParsingService;
    
    @MockBean
    private WebScrapingUtils webScrapingUtils;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testParseJobUrl_Success() throws Exception {
        String url = "https://metacareers.com/jobs/123456";
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest(url);
        
        JobParseResult mockResult = JobParseResult.success("META", url);
        mockResult.setJobTitle("Software Engineer");
        mockResult.setCompany("Meta");
        mockResult.setLocation("Remote");
        mockResult.setDescription("Great opportunity");
        mockResult.setCompensation(150000.0);
        mockResult.setCompensationType("ANNUAL");
        mockResult.setExperienceLevel("MID");
        
        when(jobParsingService.parseJobUrl(url)).thenReturn(mockResult);
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successful").value(true))
                .andExpect(jsonPath("$.source").value("META"))
                .andExpect(jsonPath("$.jobTitle").value("Software Engineer"))
                .andExpect(jsonPath("$.company").value("Meta"))
                .andExpect(jsonPath("$.location").value("Remote"))
                .andExpect(jsonPath("$.compensation").value(150000.0))
                .andExpect(jsonPath("$.compensationType").value("ANNUAL"))
                .andExpect(jsonPath("$.experienceLevel").value("MID"));
        
        verify(jobParsingService).parseJobUrl(url);
    }

    @Test
    void testParseJobUrl_Failure() throws Exception {
        String url = "https://invalid-url.com/jobs/123";
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest(url);
        
        JobParseResult mockResult = JobParseResult.failure("UNKNOWN", url, "No suitable parser found");
        
        when(jobParsingService.parseJobUrl(url)).thenReturn(mockResult);
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.successful").value(false))
                .andExpect(jsonPath("$.source").value("UNKNOWN"))
                .andExpect(jsonPath("$.errorMessage").value("No suitable parser found"));
        
        verify(jobParsingService).parseJobUrl(url);
    }

    @Test
    void testParseJobUrl_EmptyUrl() throws Exception {
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest("");
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.successful").value(false))
                .andExpect(jsonPath("$.errorMessage").value("URL is required"));
        
        verifyNoInteractions(jobParsingService);
    }

    @Test
    void testParseJobUrl_NullUrl() throws Exception {
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest(null);
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.successful").value(false))
                .andExpect(jsonPath("$.errorMessage").value("URL is required"));
        
        verifyNoInteractions(jobParsingService);
    }

    @Test
    void testParseJobUrl_WhitespaceUrl() throws Exception {
        String url = "   https://metacareers.com/jobs/123456   ";
        String trimmedUrl = url.trim();
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest(url);
        
        JobParseResult mockResult = JobParseResult.success("META", trimmedUrl);
        
        when(jobParsingService.parseJobUrl(trimmedUrl)).thenReturn(mockResult);
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successful").value(true));
        
        verify(jobParsingService).parseJobUrl(trimmedUrl);
    }

    @Test
    void testParseJobUrl_InvalidJsonRequest() throws Exception {
        mockMvc.perform(post("/api/job-parsing/parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid json"))
                .andExpect(status().isBadRequest());
        
        verifyNoInteractions(jobParsingService);
    }

    @Test
    void testParseJobUrl_MissingContentType() throws Exception {
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest("https://example.com");
        
        mockMvc.perform(post("/api/job-parsing/parse")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnsupportedMediaType());
        
        verifyNoInteractions(jobParsingService);
    }

    @Test
    void testJobUrlRequest_Constructor() {
        String url = "https://example.com";
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest(url);
        
        assertEquals(url, request.getUrl());
    }

    @Test
    void testJobUrlRequest_SettersAndGetters() {
        JobParsingController.JobUrlRequest request = new JobParsingController.JobUrlRequest();
        String url = "https://example.com";
        
        request.setUrl(url);
        assertEquals(url, request.getUrl());
    }
} 