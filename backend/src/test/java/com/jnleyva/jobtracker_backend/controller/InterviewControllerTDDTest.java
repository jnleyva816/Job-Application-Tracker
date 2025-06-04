package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.InterviewDTO;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import com.jnleyva.jobtracker_backend.service.InterviewService;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = InterviewController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
@DisplayName("Interview Controller TDD Tests")
public class InterviewControllerTDDTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InterviewService interviewService;

    @MockBean
    private ApplicationRepository applicationRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    private ObjectMapper objectMapper;
    private User testUser;
    private Application testApplication;
    private Interview testInterview;
    private InterviewDTO testInterviewDTO;
    private Long applicationId;
    private Long interviewId;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        
        applicationId = 1L;
        interviewId = 1L;

        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole("ROLE_USER");

        // Create test application
        testApplication = new Application();
        testApplication.setId(applicationId);
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Engineer");
        testApplication.setStatus("APPLIED");
        testApplication.setApplicationDate(LocalDate.now());
        testApplication.setUser(testUser);

        // Create test interview
        testInterview = new Interview();
        testInterview.setId(interviewId);
        testInterview.setType("Technical");
        testInterview.setInterviewDate(LocalDateTime.now().plusDays(7));
        testInterview.setNotes("Initial technical screening");
        testInterview.setStatus("SCHEDULED");
        testInterview.setInterviewerName("John Doe");
        testInterview.setInterviewerEmail("john.doe@company.com");
        testInterview.setLocation("Virtual");
        testInterview.setDurationMinutes(60);
        testInterview.setApplication(testApplication);

        // Create test interview DTO
        testInterviewDTO = new InterviewDTO();
        testInterviewDTO.setType("Technical");
        testInterviewDTO.setInterviewDate(LocalDateTime.now().plusDays(7));
        testInterviewDTO.setNotes("Initial technical screening");
        testInterviewDTO.setStatus("SCHEDULED");
        testInterviewDTO.setInterviewerName("John Doe");
        testInterviewDTO.setInterviewerEmail("john.doe@company.com");
        testInterviewDTO.setLocation("Virtual");
        testInterviewDTO.setDurationMinutes(60);
    }

    @Nested
    @DisplayName("Create Interview Tests")
    class CreateInterviewTests {

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should create interview successfully with DTO")
        void shouldCreateInterviewSuccessfullyWithDTO() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.createInterview(eq(applicationId), any(InterviewDTO.class))).thenReturn(testInterview);

            // When & Then
            mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testInterviewDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(interviewId))
                    .andExpect(jsonPath("$.type").value("Technical"))
                    .andExpect(jsonPath("$.status").value("SCHEDULED"))
                    .andExpect(jsonPath("$.interviewerName").value("John Doe"));

            verify(interviewService).createInterview(eq(applicationId), any(InterviewDTO.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should create interview successfully with legacy endpoint")
        void shouldCreateInterviewSuccessfullyWithLegacyEndpoint() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.createInterview(eq(applicationId), any(Interview.class))).thenReturn(testInterview);

            // When & Then
            mockMvc.perform(post("/api/applications/{applicationId}/interviews/legacy", applicationId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testInterview)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(interviewId))
                    .andExpect(jsonPath("$.type").value("Technical"));

            verify(interviewService).createInterview(eq(applicationId), any(Interview.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 400 when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            InterviewDTO invalidDTO = new InterviewDTO();
            // Missing required fields
            
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            // When & Then
            mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidDTO)))
                    .andExpect(status().isBadRequest());

            verify(interviewService, never()).createInterview(anyLong(), any(InterviewDTO.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 404 when application not found")
        void shouldReturn404WhenApplicationNotFound() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testInterviewDTO)))
                    .andExpect(status().isNotFound());

            verify(interviewService, never()).createInterview(anyLong(), any(InterviewDTO.class));
        }

        @Test
        @WithMockUser(username = "otheruser", roles = "USER")
        @DisplayName("Should return 403 when user doesn't own application")
        void shouldReturn403WhenUserDoesntOwnApplication() throws Exception {
            // Given
            User otherUser = new User();
            otherUser.setId(2L);
            otherUser.setUsername("otheruser");
            
            when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            // When & Then
            mockMvc.perform(post("/api/applications/{applicationId}/interviews", applicationId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testInterviewDTO)))
                    .andExpect(status().isForbidden());

            verify(interviewService, never()).createInterview(anyLong(), any(InterviewDTO.class));
        }
    }

    @Nested
    @DisplayName("Retrieve Interview Tests")
    class RetrieveInterviewTests {

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should retrieve all interviews successfully")
        void shouldRetrieveAllInterviewsSuccessfully() throws Exception {
            // Given
            Interview interview2 = new Interview();
            interview2.setId(2L);
            interview2.setType("HR");
            interview2.setApplication(testApplication);
            
            List<Interview> interviews = Arrays.asList(testInterview, interview2);
            
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.getAllInterviewsByApplicationId(applicationId)).thenReturn(interviews);

            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].type").value("Technical"))
                    .andExpect(jsonPath("$[1].type").value("HR"));

            verify(interviewService).getAllInterviewsByApplicationId(applicationId);
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should retrieve interview by ID successfully")
        void shouldRetrieveInterviewByIdSuccessfully() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.getInterviewById(applicationId, interviewId)).thenReturn(Optional.of(testInterview));

            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(interviewId))
                    .andExpect(jsonPath("$.type").value("Technical"))
                    .andExpect(jsonPath("$.interviewerName").value("John Doe"));

            verify(interviewService).getInterviewById(applicationId, interviewId);
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 404 when interview not found")
        void shouldReturn404WhenInterviewNotFound() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.getInterviewById(applicationId, interviewId)).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId))
                    .andExpect(status().isNotFound());

            verify(interviewService).getInterviewById(applicationId, interviewId);
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return empty list when no interviews exist")
        void shouldReturnEmptyListWhenNoInterviewsExist() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.getAllInterviewsByApplicationId(applicationId)).thenReturn(Arrays.asList());

            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(interviewService).getAllInterviewsByApplicationId(applicationId);
        }
    }

    @Nested
    @DisplayName("Update Interview Tests")
    class UpdateInterviewTests {

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should update interview successfully with DTO")
        void shouldUpdateInterviewSuccessfullyWithDTO() throws Exception {
            // Given
            InterviewDTO updateDTO = new InterviewDTO();
            updateDTO.setType("Final Round");
            updateDTO.setInterviewDate(LocalDateTime.now().plusDays(14));
            updateDTO.setNotes("Final interview with CEO");
            updateDTO.setStatus("SCHEDULED");
            updateDTO.setInterviewerName("Jane Smith");
            updateDTO.setInterviewerEmail("jane.smith@company.com");
            updateDTO.setLocation("On-site");
            updateDTO.setDurationMinutes(90);

            Interview updatedInterview = new Interview();
            updatedInterview.setId(interviewId);
            updatedInterview.setType("Final Round");
            updatedInterview.setInterviewerName("Jane Smith");

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.updateInterview(eq(applicationId), eq(interviewId), any(InterviewDTO.class)))
                    .thenReturn(updatedInterview);

            // When & Then
            mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(interviewId))
                    .andExpect(jsonPath("$.type").value("Final Round"))
                    .andExpect(jsonPath("$.interviewerName").value("Jane Smith"));

            verify(interviewService).updateInterview(eq(applicationId), eq(interviewId), any(InterviewDTO.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should update interview successfully with legacy endpoint")
        void shouldUpdateInterviewSuccessfullyWithLegacyEndpoint() throws Exception {
            // Given
            Interview updateInterview = new Interview();
            updateInterview.setType("Final Round");
            updateInterview.setNotes("Final interview with CEO");

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.updateInterview(eq(applicationId), eq(interviewId), any(Interview.class)))
                    .thenReturn(testInterview);

            // When & Then
            mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}/legacy", applicationId, interviewId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateInterview)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(interviewId));

            verify(interviewService).updateInterview(eq(applicationId), eq(interviewId), any(Interview.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 400 when validation fails during update")
        void shouldReturn400WhenValidationFailsDuringUpdate() throws Exception {
            // Given
            InterviewDTO invalidDTO = new InterviewDTO();
            // Missing required fields
            
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            // When & Then
            mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidDTO)))
                    .andExpect(status().isBadRequest());

            verify(interviewService, never()).updateInterview(anyLong(), anyLong(), any(InterviewDTO.class));
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 404 when interview not found during update")
        void shouldReturn404WhenInterviewNotFoundDuringUpdate() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.updateInterview(eq(applicationId), eq(interviewId), any(InterviewDTO.class)))
                    .thenThrow(new ResourceNotFoundException("Interview not found with id: " + interviewId + " for application: " + applicationId));

            // When & Then
            mockMvc.perform(put("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testInterviewDTO)))
                    .andExpect(status().isNotFound());

            verify(interviewService).updateInterview(eq(applicationId), eq(interviewId), any(InterviewDTO.class));
        }
    }

    @Nested
    @DisplayName("Delete Interview Tests")
    class DeleteInterviewTests {

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should delete interview successfully")
        void shouldDeleteInterviewSuccessfully() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            doNothing().when(interviewService).deleteInterview(applicationId, interviewId);

            // When & Then
            mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(interviewService).deleteInterview(applicationId, interviewId);
        }

        @Test
        @WithMockUser(username = "testuser", roles = "USER")
        @DisplayName("Should return 404 when interview not found during deletion")
        void shouldReturn404WhenInterviewNotFoundDuringDeletion() throws Exception {
            // Given
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            doThrow(new ResourceNotFoundException("Interview not found with id: " + interviewId + " for application: " + applicationId))
                    .when(interviewService).deleteInterview(applicationId, interviewId);

            // When & Then
            mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf()))
                    .andExpect(status().isNotFound());

            verify(interviewService).deleteInterview(applicationId, interviewId);
        }

        @Test
        @WithMockUser(username = "otheruser", roles = "USER")
        @DisplayName("Should return 403 when user doesn't own application during deletion")
        void shouldReturn403WhenUserDoesntOwnApplicationDuringDeletion() throws Exception {
            // Given
            User otherUser = new User();
            otherUser.setId(2L);
            otherUser.setUsername("otheruser");
            
            when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            // When & Then
            mockMvc.perform(delete("/api/applications/{applicationId}/interviews/{interviewId}", applicationId, interviewId)
                    .with(csrf()))
                    .andExpect(status().isForbidden());

            verify(interviewService, never()).deleteInterview(anyLong(), anyLong());
        }
    }

    @Nested
    @DisplayName("Authorization Tests")
    class AuthorizationTests {

        @Test
        @WithMockUser(username = "admin", roles = "ADMIN")
        @DisplayName("Should allow admin to access any application's interviews")
        void shouldAllowAdminToAccessAnyApplicationInterviews() throws Exception {
            // Given
            User adminUser = new User();
            adminUser.setId(999L);
            adminUser.setUsername("admin");
            adminUser.setRole("ROLE_ADMIN");
            
            when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewService.getAllInterviewsByApplicationId(applicationId)).thenReturn(Arrays.asList(testInterview));

            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));

            verify(interviewService).getAllInterviewsByApplicationId(applicationId);
        }

        @Test
        @DisplayName("Should return 401 when user not authenticated")
        void shouldReturn401WhenUserNotAuthenticated() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/applications/{applicationId}/interviews", applicationId))
                    .andExpect(status().isUnauthorized());

            verify(interviewService, never()).getAllInterviewsByApplicationId(anyLong());
        }
    }
} 