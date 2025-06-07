package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = AdminController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetBlacklistSize() throws Exception {
        // Arrange
        int expectedSize = 5;
        when(tokenBlacklistService.getBlacklistSize()).thenReturn(expectedSize);

        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/size")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size").value(expectedSize));

        verify(tokenBlacklistService).getBlacklistSize();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetBlacklistSizeWithZero() throws Exception {
        // Arrange
        when(tokenBlacklistService.getBlacklistSize()).thenReturn(0);

        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/size")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size").value(0));

        verify(tokenBlacklistService).getBlacklistSize();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testPrintBlacklist() throws Exception {
        // Arrange
        int expectedSize = 3;
        when(tokenBlacklistService.getBlacklistSize()).thenReturn(expectedSize);
        doNothing().when(tokenBlacklistService).printBlacklistContents();

        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/print")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Blacklist contents printed to logs"))
                .andExpect(jsonPath("$.size").value(expectedSize));

        verify(tokenBlacklistService).printBlacklistContents();
        verify(tokenBlacklistService).getBlacklistSize();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testPrintBlacklistWithEmptyList() throws Exception {
        // Arrange
        when(tokenBlacklistService.getBlacklistSize()).thenReturn(0);
        doNothing().when(tokenBlacklistService).printBlacklistContents();

        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/print")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Blacklist contents printed to logs"))
                .andExpect(jsonPath("$.size").value(0));

        verify(tokenBlacklistService).printBlacklistContents();
        verify(tokenBlacklistService).getBlacklistSize();
    }

    @Test
    void testGetBlacklistSizeWithoutAuthentication() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/size"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(tokenBlacklistService);
    }

    @Test
    void testPrintBlacklistWithoutAuthentication() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/print"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(tokenBlacklistService);
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetBlacklistSizeWithUserRole() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/size"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(tokenBlacklistService);
    }

    @Test
    @WithMockUser(roles = "USER")
    void testPrintBlacklistWithUserRole() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/blacklist/print"))
                .andExpect(status().isForbidden());

        verifyNoInteractions(tokenBlacklistService);
    }
} 