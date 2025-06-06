package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import com.jnleyva.jobtracker_backend.service.InterviewService;
import com.jnleyva.jobtracker_backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = InterviewController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
public class InterviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InterviewService interviewService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private ApplicationRepository applicationRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Application application;
    private Interview interview;
    private User user;
    private Long applicationId;
    private Long interviewId;

    @BeforeEach
    void setUp() {
        applicationId = 1L;
        interviewId = 1L;

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        application = new Application();
        application.setId(applicationId);
        application.setUser(user);

        interview = new Interview();
        interview.setId(interviewId);
        interview.setType("Technical");
        interview.setInterviewDate(LocalDateTime.now());
        interview.setNotes("Test interview notes");
        interview.setApplication(application);

        // Mock the authorization dependencies
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getAllInterviews_ShouldReturnListOfInterviews() throws Exception {
        when(interviewService.getAllInterviewsByApplicationId(applicationId))
                .thenReturn(Arrays.asList(interview));

        mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(interviewId))
                .andExpect(jsonPath("$[0].type").value("Technical"))
                .andExpect(jsonPath("$[0].notes").value("Test interview notes"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getInterviewById_ShouldReturnInterview() throws Exception {
        when(interviewService.getInterviewById(applicationId, interviewId))
                .thenReturn(Optional.of(interview));

        mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(interviewId))
                .andExpect(jsonPath("$.type").value("Technical"))
                .andExpect(jsonPath("$.notes").value("Test interview notes"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getInterviewById_ShouldReturn404_WhenInterviewNotFound() throws Exception {
        when(interviewService.getInterviewById(applicationId, interviewId))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser")
    void createInterview_ShouldReturnCreatedInterview() throws Exception {
        when(interviewService.createInterview(eq(applicationId), any(Interview.class)))
                .thenReturn(interview);

        mockMvc.perform(post("/api/applications/{applicationId}/interviews/legacy", applicationId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interview)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(interviewId))
                .andExpect(jsonPath("$.type").value("Technical"))
                .andExpect(jsonPath("$.notes").value("Test interview notes"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updateInterview_ShouldReturnUpdatedInterview() throws Exception {
        when(interviewService.updateInterview(eq(applicationId), eq(interviewId), any(Interview.class)))
                .thenReturn(interview);

        mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}/legacy", applicationId, interviewId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interview)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(interviewId))
                .andExpect(jsonPath("$.type").value("Technical"))
                .andExpect(jsonPath("$.notes").value("Test interview notes"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void deleteInterview_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void unauthorizedAccess_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                .andExpect(status().isUnauthorized());
    }
} 