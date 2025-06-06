package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.ApplicationStatusHistory;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationStatusHistoryRepository;
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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StatusProgressionStatisticsTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @InjectMocks
    private StatisticsServiceImpl statisticsService;

    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
    }

    @Test
    void testStatusProgression_NewApplicationAdded_AppliedGetsPlus1() {
        // Given: A new application is created with "Applied" status
        Application app = createApplication("Company A", "Applied");
        app.setId(1L);
        List<Application> applications = Arrays.asList(app);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(applications);
        when(interviewRepository.findByApplicationId(1L)).thenReturn(Collections.emptyList());

        // When: Statistics are calculated
        Map<String, Object> stats = statisticsService.getStatistics("testuser", false);

        // Then: Applied count should be 1, others 0
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) stats.get("byStatus");
        
        assertEquals(1, byStatus.get("Applied"));
        assertEquals(0, byStatus.get("Interviewing"));
        assertEquals(0, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));
    }

    @Test
    void testStatusProgression_AppliedToInterviewing_AppliedDoesNotDecrease() {
        // Given: An application that changed from Applied to Interviewing
        Application app = createApplication("Company A", "Interviewing");
        app.setId(1L);
        
        // Add status history showing it was previously Applied
        ApplicationStatusHistory appliedHistory = new ApplicationStatusHistory(app, "Applied", "testuser");
        appliedHistory.setChangedAt(LocalDateTime.now().minusDays(5));
        app.addStatusHistory(appliedHistory);
        
        ApplicationStatusHistory interviewingHistory = new ApplicationStatusHistory(app, "Interviewing", "testuser");
        interviewingHistory.setChangedAt(LocalDateTime.now());
        app.addStatusHistory(interviewingHistory);

        List<Application> applications = Arrays.asList(app);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(applications);
        when(interviewRepository.findByApplicationId(1L)).thenReturn(Collections.emptyList());

        // When: Statistics are calculated
        Map<String, Object> stats = statisticsService.getStatistics("testuser", false);

        // Then: Both Applied and Interviewing should be 1 (progression tracking)
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) stats.get("byStatus");
        
        assertEquals(1, byStatus.get("Applied"), "Applied should still be 1 (not decremented)");
        assertEquals(1, byStatus.get("Interviewing"), "Interviewing should be 1 (incremented)");
        assertEquals(0, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));
    }

    @Test
    void testStatusProgression_InterviewingBackToApplied_NoDoubleCountingForApplied() {
        // Given: An application that went Applied -> Interviewing -> Applied
        Application app = createApplication("Company A", "Applied");
        app.setId(1L);
        
        // Add status history showing the progression
        ApplicationStatusHistory appliedHistory1 = new ApplicationStatusHistory(app, "Applied", "testuser");
        appliedHistory1.setChangedAt(LocalDateTime.now().minusDays(10));
        app.addStatusHistory(appliedHistory1);
        
        ApplicationStatusHistory interviewingHistory = new ApplicationStatusHistory(app, "Interviewing", "testuser");
        interviewingHistory.setChangedAt(LocalDateTime.now().minusDays(5));
        app.addStatusHistory(interviewingHistory);
        
        ApplicationStatusHistory appliedHistory2 = new ApplicationStatusHistory(app, "Applied", "testuser");
        appliedHistory2.setChangedAt(LocalDateTime.now());
        app.addStatusHistory(appliedHistory2);

        List<Application> applications = Arrays.asList(app);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(applications);
        when(interviewRepository.findByApplicationId(1L)).thenReturn(Collections.emptyList());

        // When: Statistics are calculated
        Map<String, Object> stats = statisticsService.getStatistics("testuser", false);

        // Then: Applied should be 1 (not 2), Interviewing should be 1
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) stats.get("byStatus");
        
        assertEquals(1, byStatus.get("Applied"), "Applied should be 1 (no double counting)");
        assertEquals(1, byStatus.get("Interviewing"), "Interviewing should be 1 (reached this status)");
        assertEquals(0, byStatus.get("Offered"));
        assertEquals(0, byStatus.get("Rejected"));
    }

    @Test
    void testStatusProgression_MultipleApplicationsWithDifferentProgressions() {
        // Given: Multiple applications with different status progressions
        
        // App 1: Applied only
        Application app1 = createApplication("Company A", "Applied");
        app1.setId(1L);
        ApplicationStatusHistory app1History = new ApplicationStatusHistory(app1, "Applied", "testuser");
        app1.addStatusHistory(app1History);
        
        // App 2: Applied -> Interviewing
        Application app2 = createApplication("Company B", "Interviewing");
        app2.setId(2L);
        ApplicationStatusHistory app2Applied = new ApplicationStatusHistory(app2, "Applied", "testuser");
        app2Applied.setChangedAt(LocalDateTime.now().minusDays(5));
        app2.addStatusHistory(app2Applied);
        ApplicationStatusHistory app2Interviewing = new ApplicationStatusHistory(app2, "Interviewing", "testuser");
        app2.addStatusHistory(app2Interviewing);
        
        // App 3: Applied -> Interviewing -> Offered
        Application app3 = createApplication("Company C", "Offered");
        app3.setId(3L);
        ApplicationStatusHistory app3Applied = new ApplicationStatusHistory(app3, "Applied", "testuser");
        app3Applied.setChangedAt(LocalDateTime.now().minusDays(10));
        app3.addStatusHistory(app3Applied);
        ApplicationStatusHistory app3Interviewing = new ApplicationStatusHistory(app3, "Interviewing", "testuser");
        app3Interviewing.setChangedAt(LocalDateTime.now().minusDays(5));
        app3.addStatusHistory(app3Interviewing);
        ApplicationStatusHistory app3Offered = new ApplicationStatusHistory(app3, "Offered", "testuser");
        app3.addStatusHistory(app3Offered);
        
        // App 4: Applied -> Rejected
        Application app4 = createApplication("Company D", "Rejected");
        app4.setId(4L);
        ApplicationStatusHistory app4Applied = new ApplicationStatusHistory(app4, "Applied", "testuser");
        app4Applied.setChangedAt(LocalDateTime.now().minusDays(3));
        app4.addStatusHistory(app4Applied);
        ApplicationStatusHistory app4Rejected = new ApplicationStatusHistory(app4, "Rejected", "testuser");
        app4.addStatusHistory(app4Rejected);

        List<Application> applications = Arrays.asList(app1, app2, app3, app4);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(applications);
        when(interviewRepository.findByApplicationId(1L)).thenReturn(Collections.emptyList());
        when(interviewRepository.findByApplicationId(2L)).thenReturn(Collections.emptyList());
        when(interviewRepository.findByApplicationId(3L)).thenReturn(Collections.emptyList());
        when(interviewRepository.findByApplicationId(4L)).thenReturn(Collections.emptyList());

        // When: Statistics are calculated
        Map<String, Object> stats = statisticsService.getStatistics("testuser", false);

        // Then: Counts should reflect progression
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) stats.get("byStatus");
        
        assertEquals(4, byStatus.get("Applied"), "All 4 apps reached Applied status");
        assertEquals(2, byStatus.get("Interviewing"), "Apps 2 and 3 reached Interviewing status");
        assertEquals(1, byStatus.get("Offered"), "App 3 reached Offered status");
        assertEquals(1, byStatus.get("Rejected"), "App 4 reached Rejected status");
    }

    @Test
    void testStatusProgression_RejectedFromInterviewing() {
        // Given: An application that went Applied -> Interviewing -> Rejected
        Application app = createApplication("Company A", "Rejected");
        app.setId(1L);
        
        ApplicationStatusHistory appliedHistory = new ApplicationStatusHistory(app, "Applied", "testuser");
        appliedHistory.setChangedAt(LocalDateTime.now().minusDays(10));
        app.addStatusHistory(appliedHistory);
        
        ApplicationStatusHistory interviewingHistory = new ApplicationStatusHistory(app, "Interviewing", "testuser");
        interviewingHistory.setChangedAt(LocalDateTime.now().minusDays(5));
        app.addStatusHistory(interviewingHistory);
        
        ApplicationStatusHistory rejectedHistory = new ApplicationStatusHistory(app, "Rejected", "testuser");
        app.addStatusHistory(rejectedHistory);

        List<Application> applications = Arrays.asList(app);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(applicationRepository.findByUserId(1L)).thenReturn(applications);
        when(interviewRepository.findByApplicationId(1L)).thenReturn(Collections.emptyList());

        // When: Statistics are calculated
        Map<String, Object> stats = statisticsService.getStatistics("testuser", false);

        // Then: Should count all statuses reached
        @SuppressWarnings("unchecked")
        Map<String, Integer> byStatus = (Map<String, Integer>) stats.get("byStatus");
        
        assertEquals(1, byStatus.get("Applied"), "App reached Applied status");
        assertEquals(1, byStatus.get("Interviewing"), "App reached Interviewing status");
        assertEquals(0, byStatus.get("Offered"), "App never reached Offered status");
        assertEquals(1, byStatus.get("Rejected"), "App reached Rejected status");
    }

    @Test
    void testApplicationService_StatusHistoryTracking() {
        // Given: A new application is created
        Application newApp = createApplication("Company A", "Applied");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(applicationRepository.save(any(Application.class))).thenReturn(newApp);

        // When: Application is created
        Application result = applicationService.createApplication(newApp, 1L);

        // Then: Status history should be tracked
        verify(statusHistoryRepository).save(any(ApplicationStatusHistory.class));
    }

    @Test
    void testApplicationService_StatusChangeTracking() {
        // Given: An existing application with status change
        Application existingApp = createApplication("Company A", "Applied");
        existingApp.setId(1L);
        existingApp.setUser(testUser);
        
        Application updatedApp = createApplication("Company A", "Interviewing");
        
        when(applicationRepository.findById(1L)).thenReturn(Optional.of(existingApp));
        when(applicationRepository.save(any(Application.class))).thenReturn(updatedApp);

        // When: Application status is updated
        Application result = applicationService.updateApplication(1L, updatedApp);

        // Then: Status history should be tracked for the change
        verify(statusHistoryRepository).save(any(ApplicationStatusHistory.class));
    }

    private Application createApplication(String company, String status) {
        Application app = new Application();
        app.setCompany(company);
        app.setJobTitle("Software Developer");
        app.setStatus(status);
        app.setApplicationDate(LocalDate.now());
        app.setUser(testUser);
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());
        return app;
    }
} 