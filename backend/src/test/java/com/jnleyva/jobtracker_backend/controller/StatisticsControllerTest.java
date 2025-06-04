package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.service.StatisticsService;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatisticsController.class)
public class StatisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void getStatistics_AsUser_ShouldReturnUserStatistics() throws Exception {
        // Arrange
        Map<String, Object> mockStats = createMockStatistics();
        when(statisticsService.getStatistics("testuser", false)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.successRate").value(20.0))
                .andExpect(jsonPath("$.averageResponseTime").value(7))
                .andExpect(jsonPath("$.byStatus.Applied").value(2))
                .andExpect(jsonPath("$.byStatus.Interviewing").value(2))
                .andExpect(jsonPath("$.byStatus.Offered").value(1))
                .andExpect(jsonPath("$.byStatus.Rejected").value(0));

        verify(statisticsService).getStatistics("testuser", false);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void getStatistics_AsAdmin_ShouldReturnAllStatistics() throws Exception {
        // Arrange
        Map<String, Object> mockStats = createMockStatistics();
        mockStats.put("total", 25); // Admin sees more applications
        when(statisticsService.getStatistics("admin", true)).thenReturn(mockStats);

        // Act & Assert
        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.total").value(25));

        verify(statisticsService).getStatistics("admin", true);
    }

    @Test
    void getStatistics_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void getStatistics_WhenServiceThrowsException_ShouldReturnInternalServerError() throws Exception {
        // Arrange
        when(statisticsService.getStatistics(anyString(), anyBoolean()))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/statistics"))
                .andExpect(status().isInternalServerError());
    }

    private Map<String, Object> createMockStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", 5);
        stats.put("successRate", 20.0);
        stats.put("averageResponseTime", 7);

        Map<String, Integer> byStatus = new HashMap<>();
        byStatus.put("Applied", 2);
        byStatus.put("Interviewing", 2);
        byStatus.put("Offered", 1);
        byStatus.put("Rejected", 0);
        stats.put("byStatus", byStatus);

        Map<String, Integer> byMonth = new HashMap<>();
        byMonth.put("Jan 2024", 2);
        byMonth.put("Feb 2024", 3);
        stats.put("byMonth", byMonth);

        return stats;
    }
} 