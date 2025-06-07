package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.MyUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ApplicationController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
public class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ApplicationRepository applicationRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private MyUserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private User adminUser;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole("USER");

        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@example.com");
        adminUser.setRole("ADMIN");

        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Engineer");
        testApplication.setLocation("Remote");
        testApplication.setUrl("https://example.com/job");
        testApplication.setDescription("Test job description");
        testApplication.setCompensation(100000.0);
        testApplication.setStatus("APPLIED");
        testApplication.setApplicationDate(LocalDate.now());
        testApplication.setUser(testUser);
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void getAllApplications_AsUser_ShouldReturnUserApplications() throws Exception {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(Arrays.asList(testApplication));

        // Act & Assert
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].company").value("Test Company"))
                .andExpect(jsonPath("$[0].jobTitle").value("Software Engineer"));

        verify(userRepository).findByUsername("testuser");
        verify(applicationRepository).findByUserId(1L);
        verify(applicationRepository, never()).findAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getAllApplications_AsAdmin_ShouldReturnAllApplications() throws Exception {
        // Arrange
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(applicationRepository.findAll()).thenReturn(Arrays.asList(testApplication));

        // Act & Assert
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].company").value("Test Company"));

        verify(userRepository).findByUsername("admin");
        verify(applicationRepository).findAll();
        verify(applicationRepository, never()).findByUserId(anyLong());
    }

    @Test
    @WithMockUser(username = "nonexistent", roles = "USER")
    void getAllApplications_WithNonexistentUser_ShouldReturnUnauthorized() throws Exception {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized());

        verify(userRepository).findByUsername("nonexistent");
        verify(applicationRepository, never()).findByUserId(anyLong());
        verify(applicationRepository, never()).findAll();
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void getApplicationById_AsOwner_ShouldReturnApplication() throws Exception {
        // Arrange
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(get("/api/applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Test Company"))
                .andExpect(jsonPath("$.jobTitle").value("Software Engineer"));

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getApplicationById_AsAdmin_ShouldReturnApplication() throws Exception {
        // Arrange
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));

        // Act & Assert
        mockMvc.perform(get("/api/applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Test Company"));

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("admin");
    }

    @Test
    @WithMockUser(username = "otheruser", roles = "USER")
    void getApplicationById_AsNonOwner_ShouldReturnForbidden() throws Exception {
        // Arrange
        User otherUser = new User();
        otherUser.setId(3L);
        otherUser.setUsername("otheruser");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        // Act & Assert
        mockMvc.perform(get("/api/applications/1"))
                .andExpect(status().isForbidden());

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("otheruser");
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void getApplicationById_WithNonexistentApplication_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/applications/999"))
                .andExpect(status().isNotFound());

        verify(applicationRepository).findById(999L);
        verify(userRepository, never()).findByUsername(anyString());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void createApplication_WithValidData_ShouldCreateApplication() throws Exception {
        // Arrange
        Application newApplication = new Application();
        newApplication.setCompany("New Company");
        newApplication.setJobTitle("Developer");
        newApplication.setLocation("San Francisco");
        newApplication.setUrl("https://newcompany.com/job");
        newApplication.setDescription("New job description");
        newApplication.setCompensation(120000.0);
        newApplication.setStatus("APPLIED");
        newApplication.setApplicationDate(LocalDate.now());

        Application savedApplication = new Application();
        savedApplication.setId(2L);
        savedApplication.setCompany("New Company");
        savedApplication.setJobTitle("Developer");
        savedApplication.setUser(testUser);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.save(any(Application.class))).thenReturn(savedApplication);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newApplication)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2L))
                .andExpect(jsonPath("$.company").value("New Company"))
                .andExpect(jsonPath("$.jobTitle").value("Developer"));

        verify(userRepository).findByUsername("testuser");
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    @WithMockUser(username = "nonexistent", roles = "USER")
    void createApplication_WithNonexistentUser_ShouldReturnUnauthorized() throws Exception {
        // Arrange
        Application newApplication = new Application();
        newApplication.setCompany("New Company");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newApplication)))
                .andExpect(status().isUnauthorized());

        verify(userRepository).findByUsername("nonexistent");
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void updateApplication_AsOwner_ShouldUpdateApplication() throws Exception {
        // Arrange
        Application updateData = new Application();
        updateData.setCompany("Updated Company");
        updateData.setJobTitle("Senior Developer");
        updateData.setLocation("New York");
        updateData.setStatus("INTERVIEWING");

        Application updatedApplication = new Application();
        updatedApplication.setId(1L);
        updatedApplication.setCompany("Updated Company");
        updatedApplication.setJobTitle("Senior Developer");
        updatedApplication.setLocation("New York");
        updatedApplication.setStatus("INTERVIEWING");
        updatedApplication.setUser(testUser);

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.save(any(Application.class))).thenReturn(updatedApplication);

        // Act & Assert
        mockMvc.perform(put("/api/applications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Updated Company"))
                .andExpect(jsonPath("$.jobTitle").value("Senior Developer"));

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("testuser");
        verify(applicationRepository).save(any(Application.class));
    }

    @Test
    @WithMockUser(username = "otheruser", roles = "USER")
    void updateApplication_AsNonOwner_ShouldReturnForbidden() throws Exception {
        // Arrange
        User otherUser = new User();
        otherUser.setId(3L);
        otherUser.setUsername("otheruser");

        Application updateData = new Application();
        updateData.setCompany("Updated Company");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        // Act & Assert
        mockMvc.perform(put("/api/applications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isForbidden());

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("otheruser");
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void updateApplication_WithNonexistentApplication_ShouldReturnNotFound() throws Exception {
        // Arrange
        Application updateData = new Application();
        updateData.setCompany("Updated Company");

        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/applications/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isNotFound());

        verify(applicationRepository).findById(999L);
        verify(userRepository, never()).findByUsername(anyString());
        verify(applicationRepository, never()).save(any(Application.class));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void deleteApplication_AsOwner_ShouldDeleteApplication() throws Exception {
        // Arrange
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(delete("/api/applications/1"))
                .andExpect(status().isNoContent());

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("testuser");
        verify(applicationRepository).deleteById(1L);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void deleteApplication_AsAdmin_ShouldDeleteApplication() throws Exception {
        // Arrange
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));

        // Act & Assert
        mockMvc.perform(delete("/api/applications/1"))
                .andExpect(status().isNoContent());

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("admin");
        verify(applicationRepository).deleteById(1L);
    }

    @Test
    @WithMockUser(username = "otheruser", roles = "USER")
    void deleteApplication_AsNonOwner_ShouldReturnForbidden() throws Exception {
        // Arrange
        User otherUser = new User();
        otherUser.setId(3L);
        otherUser.setUsername("otheruser");

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(testApplication));
        when(userRepository.findByUsername("otheruser")).thenReturn(Optional.of(otherUser));

        // Act & Assert
        mockMvc.perform(delete("/api/applications/1"))
                .andExpect(status().isForbidden());

        verify(applicationRepository).findById(1L);
        verify(userRepository).findByUsername("otheruser");
        verify(applicationRepository, never()).deleteById(anyLong());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void deleteApplication_WithNonexistentApplication_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(applicationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(delete("/api/applications/999"))
                .andExpect(status().isNotFound());

        verify(applicationRepository).findById(999L);
        verify(userRepository, never()).findByUsername(anyString());
        verify(applicationRepository, never()).deleteById(anyLong());
    }

    @Test
    void getAllApplications_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized());

        verify(applicationRepository, never()).findAll();
        verify(applicationRepository, never()).findByUserId(anyLong());
    }

    @Test
    void createApplication_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        // Arrange
        Application newApplication = new Application();
        newApplication.setCompany("Test Company");

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newApplication)))
                .andExpect(status().isUnauthorized());

        verify(applicationRepository, never()).save(any(Application.class));
    }
} 