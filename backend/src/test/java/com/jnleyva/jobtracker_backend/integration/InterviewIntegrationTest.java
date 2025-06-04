package com.jnleyva.jobtracker_backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.InterviewDTO;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
@DisplayName("Interview Integration Tests")
public class InterviewIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    private ObjectMapper objectMapper;
    private User testUser;
    private Application testApplication;
    private Long applicationId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Clean up
        interviewRepository.deleteAll();
        applicationRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setRole("ROLE_USER");
        testUser = userRepository.save(testUser);

        // Create test application
        testApplication = new Application();
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Engineer");
        testApplication.setStatus("APPLIED");
        testApplication.setApplicationDate(LocalDate.now());
        testApplication.setUser(testUser);
        testApplication = applicationRepository.save(testApplication);
        applicationId = testApplication.getId();
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should create interview successfully")
    void shouldCreateInterviewSuccessfully() throws Exception {
        InterviewDTO interviewDTO = new InterviewDTO();
        interviewDTO.setType("Technical");
        interviewDTO.setInterviewDate(LocalDateTime.now().plusDays(7));
        interviewDTO.setNotes("Initial technical screening");
        interviewDTO.setStatus("SCHEDULED");
        interviewDTO.setInterviewerName("John Doe");
        interviewDTO.setInterviewerEmail("john.doe@company.com");
        interviewDTO.setLocation("Virtual");
        interviewDTO.setDurationMinutes(60);

        mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interviewDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("Technical"))
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.interviewerName").value("John Doe"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should retrieve all interviews for application")
    void shouldRetrieveAllInterviewsForApplication() throws Exception {
        // Create test interview
        Interview interview = new Interview();
        interview.setType("Technical");
        interview.setInterviewDate(LocalDateTime.now().plusDays(7));
        interview.setNotes("Test interview");
        interview.setStatus("SCHEDULED");
        interview.setApplication(testApplication);
        interviewRepository.save(interview);

        mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].type").value("Technical"))
                .andExpect(jsonPath("$[0].status").value("SCHEDULED"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should update interview successfully")
    void shouldUpdateInterviewSuccessfully() throws Exception {
        // Create test interview
        Interview interview = new Interview();
        interview.setType("Technical");
        interview.setInterviewDate(LocalDateTime.now().plusDays(7));
        interview.setNotes("Test interview");
        interview.setStatus("SCHEDULED");
        interview.setApplication(testApplication);
        interview = interviewRepository.save(interview);

        InterviewDTO updateDTO = new InterviewDTO();
        updateDTO.setType("Final Round");
        updateDTO.setInterviewDate(LocalDateTime.now().plusDays(14));
        updateDTO.setNotes("Final interview with CEO");
        updateDTO.setStatus("SCHEDULED");
        updateDTO.setInterviewerName("Jane Smith");
        updateDTO.setInterviewerEmail("jane.smith@company.com");
        updateDTO.setLocation("On-site");
        updateDTO.setDurationMinutes(90);

        mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", 
                applicationId, interview.getId())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Final Round"))
                .andExpect(jsonPath("$.interviewerName").value("Jane Smith"));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should delete interview successfully")
    void shouldDeleteInterviewSuccessfully() throws Exception {
        // Create test interview
        Interview interview = new Interview();
        interview.setType("Technical");
        interview.setInterviewDate(LocalDateTime.now().plusDays(7));
        interview.setNotes("Test interview");
        interview.setStatus("SCHEDULED");
        interview.setApplication(testApplication);
        interview = interviewRepository.save(interview);

        mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", 
                applicationId, interview.getId())
                .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should return 404 when application not found")
    void shouldReturn404WhenApplicationNotFound() throws Exception {
        InterviewDTO interviewDTO = new InterviewDTO();
        interviewDTO.setType("Technical");
        interviewDTO.setInterviewDate(LocalDateTime.now().plusDays(7));
        interviewDTO.setNotes("Test interview");

        mockMvc.perform(post("/api/applications/{applicationId}/interviews", 999L)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interviewDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    @DisplayName("Should return 400 when validation fails")
    void shouldReturn400WhenValidationFails() throws Exception {
        InterviewDTO invalidDTO = new InterviewDTO();
        // Missing required fields (type and interviewDate)

        mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }
} 