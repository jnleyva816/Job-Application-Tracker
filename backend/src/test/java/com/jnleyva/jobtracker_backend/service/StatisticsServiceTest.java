package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @InjectMocks
    private StatisticsServiceImpl statisticsService;

    private User testUser;
    private List<Application> testApplications;
    private List<Interview> testInterviews;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testApplications = Arrays.asList(
            createApplication(1L, "Applied", LocalDate.of(2024, 1, 15)),
            createApplication(2L, "Interviewing", LocalDate.of(2024, 1, 20)),
            createApplication(3L, "Offered", LocalDate.of(2024, 2, 5)),
            createApplication(4L, "Applied", LocalDate.of(2024, 2, 10)),
            createApplication(5L, "Rejected", LocalDate.of(2024, 2, 15))
        );

        testInterviews = Arrays.asList(
            createInterview(1L, "Technical", LocalDateTime.of(2024, 1, 25, 10, 0), "SCHEDULED", testApplications.get(1)),
            createInterview(2L, "HR", LocalDateTime.of(2024, 2, 1, 14, 0), "COMPLETED", testApplications.get(1)),
            createInterview(3L, "Final", LocalDateTime.of(2024, 2, 8, 16, 0), "COMPLETED", testApplications.get(2))
        );
    }

    @Test
    void getStatistics_AsRegularUser_ShouldReturnUserSpecificStatistics() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(testApplications);
        
        // Mock interview repository calls for each application
        when(interviewRepository.findByApplicationId(1L)).thenReturn(new ArrayList<>());
        when(interviewRepository.findByApplicationId(2L)).thenReturn(testInterviews.subList(0, 2)); // 2 interviews
        when(interviewRepository.findByApplicationId(3L)).thenReturn(testInterviews.subList(2, 3)); // 1 interview
        when(interviewRepository.findByApplicationId(4L)).thenReturn(new ArrayList<>());
        when(interviewRepository.findByApplicationId(5L)).thenReturn(new ArrayList<>());

        // Act
        Map<String, Object> result = statisticsService.getStatistics("testuser", false);

        // Assert
        assertEquals(5, result.get("total"));
        assertEquals(20.0, result.get("successRate")); // 1 offered out of 5 applications = 20%
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) result.get("byStatus");
        assertEquals(2, byStatus.get("Applied"));
        assertEquals(1, byStatus.get("Interviewing"));
        assertEquals(1, byStatus.get("Offered"));
        assertEquals(1, byStatus.get("Rejected"));

        @SuppressWarnings("unchecked")
        Map<String, Integer> byMonth = (Map<String, Integer>) result.get("byMonth");
        assertEquals(2, byMonth.get("Jan 2024"));
        assertEquals(3, byMonth.get("Feb 2024"));

        // Verify interview statistics are included
        assertNotNull(result.get("interviewStats"));
        @SuppressWarnings("unchecked")
        Map<String, Object> interviewStats = (Map<String, Object>) result.get("interviewStats");
        assertEquals(3, interviewStats.get("totalInterviews"));

        verify(userRepository).findByUsername("testuser");
        verify(applicationRepository).findByUserId(1L);
        verify(applicationRepository, never()).findAll();
        verify(interviewRepository, never()).findAll();
    }

    @Test
    void getStatistics_AsAdmin_ShouldReturnAllApplicationsStatistics() {
        // Arrange
        when(applicationRepository.findAll()).thenReturn(testApplications);
        when(interviewRepository.findAll()).thenReturn(testInterviews);

        // Act
        Map<String, Object> result = statisticsService.getStatistics("admin", true);

        // Assert
        assertEquals(5, result.get("total"));
        assertEquals(20.0, result.get("successRate"));
        
        // Verify interview statistics are included
        assertNotNull(result.get("interviewStats"));
        @SuppressWarnings("unchecked")
        Map<String, Object> interviewStats = (Map<String, Object>) result.get("interviewStats");
        assertEquals(3, interviewStats.get("totalInterviews"));
        
        verify(applicationRepository).findAll();
        verify(interviewRepository).findAll();
        verify(userRepository, never()).findByUsername(anyString());
        verify(applicationRepository, never()).findByUserId(anyLong());
    }

    @Test
    void getStatistics_WithNonexistentUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> statisticsService.getStatistics("nonexistent", false));
        
        assertEquals("User not found", exception.getMessage());
        
        verify(userRepository).findByUsername("nonexistent");
        verify(applicationRepository, never()).findByUserId(anyLong());
    }

    @Test
    void getStatistics_WithEmptyApplicationList_ShouldReturnZeroStats() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(Arrays.asList());

        // Act
        Map<String, Object> result = statisticsService.getStatistics("testuser", false);

        // Assert
        assertEquals(0, result.get("total"));
        assertEquals(0.0, result.get("successRate"));
        assertEquals(0, result.get("averageResponseTime"));
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) result.get("byStatus");
        assertEquals(0, byStatus.get("Applied"));
        assertEquals(0, byStatus.get("Interviewing"));
        assertEquals(0, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));

        // Verify interview statistics are included even with no data
        assertNotNull(result.get("interviewStats"));
        @SuppressWarnings("unchecked")
        Map<String, Object> interviewStats = (Map<String, Object>) result.get("interviewStats");
        assertEquals(0, interviewStats.get("totalInterviews"));
    }

    @Test
    void getStatistics_WithOnlyAppliedStatus_ShouldCalculateCorrectly() {
        // Arrange
        List<Application> appliedOnlyApplications = Arrays.asList(
            createApplication(1L, "Applied", LocalDate.of(2024, 1, 15)),
            createApplication(2L, "Applied", LocalDate.of(2024, 1, 20)),
            createApplication(3L, "Applied", LocalDate.of(2024, 2, 5))
        );
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(appliedOnlyApplications);
        when(interviewRepository.findByApplicationId(anyLong())).thenReturn(new ArrayList<>());

        // Act
        Map<String, Object> result = statisticsService.getStatistics("testuser", false);

        // Assert
        assertEquals(3, result.get("total"));
        assertEquals(0.0, result.get("successRate")); // No offers = 0% success rate
        assertEquals(0, result.get("averageResponseTime")); // No responses yet
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) result.get("byStatus");
        assertEquals(3, byStatus.get("Applied"));
        assertEquals(0, byStatus.get("Interviewing"));
        assertEquals(0, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));
    }

    @Test
    void getStatistics_WithAllOffered_ShouldShowHundredPercentSuccess() {
        // Arrange
        List<Application> allOfferedApplications = Arrays.asList(
            createApplication(1L, "Offered", LocalDate.of(2024, 1, 15)),
            createApplication(2L, "Offered", LocalDate.of(2024, 1, 20))
        );
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(allOfferedApplications);
        when(interviewRepository.findByApplicationId(anyLong())).thenReturn(new ArrayList<>());

        // Act
        Map<String, Object> result = statisticsService.getStatistics("testuser", false);

        // Assert
        assertEquals(2, result.get("total"));
        assertEquals(100.0, result.get("successRate")); // All applications offered = 100%
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) result.get("byStatus");
        assertEquals(0, byStatus.get("Applied"));
        assertEquals(0, byStatus.get("Interviewing"));
        assertEquals(2, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));
    }

    @Test
    void getStatistics_ShouldIncludeInterviewStatistics() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(testApplications);
        
        // Mock interview repository calls for each application
        when(interviewRepository.findByApplicationId(1L)).thenReturn(new ArrayList<>());
        when(interviewRepository.findByApplicationId(2L)).thenReturn(testInterviews.subList(0, 2)); // 2 interviews
        when(interviewRepository.findByApplicationId(3L)).thenReturn(testInterviews.subList(2, 3)); // 1 interview
        when(interviewRepository.findByApplicationId(4L)).thenReturn(new ArrayList<>());
        when(interviewRepository.findByApplicationId(5L)).thenReturn(new ArrayList<>());

        // Act
        Map<String, Object> result = statisticsService.getStatistics("testuser", false);

        // Assert interview statistics
        @SuppressWarnings("unchecked")
        Map<String, Object> interviewStats = (Map<String, Object>) result.get("interviewStats");
        
        assertNotNull(interviewStats);
        assertEquals(3, interviewStats.get("totalInterviews"));
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> byType = (Map<String, Integer>) interviewStats.get("byType");
        assertEquals(1, byType.get("Technical"));
        assertEquals(1, byType.get("HR"));
        assertEquals(1, byType.get("Final"));
        
        // Should calculate conversion rate (2 applications with interviews out of 5 = 40%)
        assertEquals(40.0, interviewStats.get("conversionRate"));
        
        // Should calculate average interviews per application with interviews (3 interviews / 2 apps = 1.5)
        assertEquals(1.5, interviewStats.get("averagePerApplication"));
    }

    private Application createApplication(Long id, String status, LocalDate applicationDate) {
        Application app = new Application();
        app.setId(id);
        app.setCompany("Test Company " + id);
        app.setJobTitle("Software Engineer");
        app.setStatus(status);
        app.setApplicationDate(applicationDate);
        app.setUser(testUser);
        app.setInterviews(new ArrayList<>()); // Initialize empty interviews list
        return app;
    }

    private Interview createInterview(Long id, String type, LocalDateTime interviewDate, String status, Application application) {
        Interview interview = new Interview();
        interview.setId(id);
        interview.setType(type);
        interview.setInterviewDate(interviewDate);
        interview.setStatus(status);
        interview.setApplication(application);
        
        // Add interview to application's interview list
        application.getInterviews().add(interview);
        
        return interview;
    }
} 