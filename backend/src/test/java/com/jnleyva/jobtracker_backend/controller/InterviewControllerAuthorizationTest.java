package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.MyUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Transactional
public class InterviewControllerAuthorizationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User user1;
    private User user2;
    private Application user1Application;
    private Application user2Application;
    private Interview user1Interview;
    private Interview user2Interview;
    private String user1Token;
    private String user2Token;

    @BeforeEach
    void setUp() {
        // Initialize MockMvc with Spring Security
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Create test users
        user1 = new User();
        user1.setUsername("user1");
        user1.setEmail("user1@test.com");
        user1.setPassword(passwordEncoder.encode("password123"));
        user1.setRole("ROLE_USER");
        user1 = userRepository.save(user1);

        user2 = new User();
        user2.setUsername("user2");
        user2.setEmail("user2@test.com");
        user2.setPassword(passwordEncoder.encode("password123"));
        user2.setRole("ROLE_USER");
        user2 = userRepository.save(user2);

        // Create applications for each user
        user1Application = new Application();
        user1Application.setCompany("Company 1");
        user1Application.setJobTitle("Developer");
        user1Application.setUser(user1);
        user1Application.setApplicationDate(LocalDate.now());
        user1Application.setStatus("Applied");
        user1Application.setLocation("Remote");
        user1Application.setUrl("http://example.com");
        user1Application.setDescription("Test job");
        user1Application.setCompensation(100000.0);
        user1Application = applicationRepository.save(user1Application);

        user2Application = new Application();
        user2Application.setCompany("Company 2");
        user2Application.setJobTitle("Engineer");
        user2Application.setUser(user2);
        user2Application.setApplicationDate(LocalDate.now());
        user2Application.setStatus("Applied");
        user2Application.setLocation("Remote");
        user2Application.setUrl("http://example.com");
        user2Application.setDescription("Test job 2");
        user2Application.setCompensation(120000.0);
        user2Application = applicationRepository.save(user2Application);

        // Create interviews for each application
        user1Interview = new Interview();
        user1Interview.setType("Technical");
        user1Interview.setInterviewDate(LocalDateTime.now().plusDays(1));
        user1Interview.setNotes("Technical interview for user1");
        user1Interview.setApplication(user1Application);
        user1Interview = interviewRepository.save(user1Interview);

        user2Interview = new Interview();
        user2Interview.setType("Behavioral");
        user2Interview.setInterviewDate(LocalDateTime.now().plusDays(2));
        user2Interview.setNotes("Behavioral interview for user2");
        user2Interview.setApplication(user2Application);
        user2Interview = interviewRepository.save(user2Interview);

        // Generate JWT tokens for both users
        UserDetails user1Details = userDetailsService.loadUserByUsername(user1.getUsername());
        UserDetails user2Details = userDetailsService.loadUserByUsername(user2.getUsername());
        user1Token = jwtService.generateToken(user1Details);
        user2Token = jwtService.generateToken(user2Details);
    }

    @Test
    void getAllInterviews_ShouldReturnOwnInterviews_WhenOwner() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews", user1Application.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(user1Interview.getId()))
                .andExpect(jsonPath("$[0].type").value("Technical"))
                .andExpect(jsonPath("$[0].notes").value("Technical interview for user1"));
    }

    @Test
    void getAllInterviews_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews", user2Application.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getInterviewById_ShouldReturnOwnInterview_WhenOwner() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", 
                user1Application.getId(), user1Interview.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user1Interview.getId()))
                .andExpect(jsonPath("$.type").value("Technical"));
    }

    @Test
    void getInterviewById_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", 
                user2Application.getId(), user2Interview.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    void createInterview_ShouldCreateInterview_WhenOwner() throws Exception {
        Interview newInterview = new Interview();
        newInterview.setType("HR");
        newInterview.setInterviewDate(LocalDateTime.now().plusDays(3));
        newInterview.setNotes("HR interview");

        mockMvc.perform(post("/api/applications/{applicationId}/interviews", user1Application.getId())
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newInterview)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("HR"))
                .andExpect(jsonPath("$.notes").value("HR interview"));
    }

    @Test
    void createInterview_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        Interview newInterview = new Interview();
        newInterview.setType("HR");
        newInterview.setInterviewDate(LocalDateTime.now().plusDays(3));
        newInterview.setNotes("HR interview");

        mockMvc.perform(post("/api/applications/{applicationId}/interviews", user2Application.getId())
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newInterview)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateInterview_ShouldUpdateInterview_WhenOwner() throws Exception {
        Interview updatedInterview = new Interview();
        updatedInterview.setType("Updated Technical");
        updatedInterview.setInterviewDate(user1Interview.getInterviewDate());
        updatedInterview.setNotes("Updated notes");

        mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", 
                user1Application.getId(), user1Interview.getId())
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedInterview)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("Updated Technical"))
                .andExpect(jsonPath("$.notes").value("Updated notes"));
    }

    @Test
    void updateInterview_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        Interview updatedInterview = new Interview();
        updatedInterview.setType("Updated Technical");
        updatedInterview.setInterviewDate(user2Interview.getInterviewDate());
        updatedInterview.setNotes("Updated notes");

        mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", 
                user2Application.getId(), user2Interview.getId())
                .header("Authorization", "Bearer " + user1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedInterview)))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteInterview_ShouldDeleteInterview_WhenOwner() throws Exception {
        mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", 
                user1Application.getId(), user1Interview.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteInterview_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", 
                user2Application.getId(), user2Interview.getId())
                .header("Authorization", "Bearer " + user1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllInterviews_ShouldReturnUnauthorized_WhenNoToken() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews", user1Application.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllInterviews_ShouldReturnUnauthorized_WhenInvalidToken() throws Exception {
        mockMvc.perform(get("/api/applications/{applicationId}/interviews", user1Application.getId())
                .header("Authorization", "Bearer invalid_token"))
                .andExpect(status().isForbidden());
    }
} 