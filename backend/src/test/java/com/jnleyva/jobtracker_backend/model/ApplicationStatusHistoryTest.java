package com.jnleyva.jobtracker_backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationStatusHistoryTest {

    private Application testApplication;
    private ApplicationStatusHistory statusHistory;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setCompany("Test Company");
    }

    @Test
    void testDefaultConstructor() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        
        assertNull(history.getId());
        assertNull(history.getApplication());
        assertNull(history.getStatus());
        assertNull(history.getChangedAt());
        assertNull(history.getChangedBy());
    }

    @Test
    void testParameterizedConstructor() {
        String status = "APPLIED";
        String changedBy = "testuser";
        
        ApplicationStatusHistory history = new ApplicationStatusHistory(testApplication, status, changedBy);
        
        assertEquals(testApplication, history.getApplication());
        assertEquals(status, history.getStatus());
        assertEquals(changedBy, history.getChangedBy());
        assertNotNull(history.getChangedAt());
        // Changed at should be very recent (within 1 second)
        assertTrue(history.getChangedAt().isAfter(LocalDateTime.now().minusSeconds(1)));
    }

    @Test
    void testGettersAndSetters() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        
        // Test ID
        history.setId(1L);
        assertEquals(1L, history.getId());
        
        // Test Application
        history.setApplication(testApplication);
        assertEquals(testApplication, history.getApplication());
        
        // Test Status
        String status = "INTERVIEW_SCHEDULED";
        history.setStatus(status);
        assertEquals(status, history.getStatus());
        
        // Test ChangedAt
        LocalDateTime now = LocalDateTime.now();
        history.setChangedAt(now);
        assertEquals(now, history.getChangedAt());
        
        // Test ChangedBy
        String changedBy = "admin";
        history.setChangedBy(changedBy);
        assertEquals(changedBy, history.getChangedBy());
    }

    @Test
    void testOnCreatePrePersist() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        
        // Ensure changedAt is null initially
        assertNull(history.getChangedAt());
        
        // Call the @PrePersist method
        history.onCreate();
        
        // Should set changedAt to current time
        assertNotNull(history.getChangedAt());
        assertTrue(history.getChangedAt().isAfter(LocalDateTime.now().minusSeconds(1)));
    }

    @Test
    void testOnCreatePrePersistWithExistingChangedAt() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        LocalDateTime existingTime = LocalDateTime.now().minusHours(1);
        history.setChangedAt(existingTime);
        
        // Call the @PrePersist method
        history.onCreate();
        
        // Should not modify existing changedAt
        assertEquals(existingTime, history.getChangedAt());
    }

    @Test
    void testStatusHistoryWithDifferentStatuses() {
        String[] statuses = {"APPLIED", "INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "OFFER_RECEIVED", "REJECTED"};
        
        for (String status : statuses) {
            ApplicationStatusHistory history = new ApplicationStatusHistory(testApplication, status, "testuser");
            assertEquals(status, history.getStatus());
            assertEquals(testApplication, history.getApplication());
        }
    }

    @Test
    void testStatusHistoryWithNullValues() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        
        // Test setting null values
        history.setApplication(null);
        history.setStatus(null);
        history.setChangedBy(null);
        history.setChangedAt(null);
        
        assertNull(history.getApplication());
        assertNull(history.getStatus());
        assertNull(history.getChangedBy());
        assertNull(history.getChangedAt());
    }

    @Test
    void testStatusHistoryWithEmptyStrings() {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        
        history.setStatus("");
        history.setChangedBy("");
        
        assertEquals("", history.getStatus());
        assertEquals("", history.getChangedBy());
    }

    @Test
    void testEqualsAndHashCodeFromLombok() {
        ApplicationStatusHistory history1 = new ApplicationStatusHistory(testApplication, "APPLIED", "user1");
        ApplicationStatusHistory history2 = new ApplicationStatusHistory(testApplication, "APPLIED", "user1");
        
        // Set same ID for both
        history1.setId(1L);
        history2.setId(1L);
        
        // Set same changedAt
        LocalDateTime now = LocalDateTime.now();
        history1.setChangedAt(now);
        history2.setChangedAt(now);
        
        // Test equals (provided by Lombok @Data)
        assertEquals(history1, history2);
        assertEquals(history1.hashCode(), history2.hashCode());
    }

    @Test
    void testToStringFromLombok() {
        ApplicationStatusHistory history = new ApplicationStatusHistory(testApplication, "APPLIED", "user1");
        history.setId(1L);
        
        String toString = history.toString();
        
        // Should contain class name and field values (provided by Lombok @Data)
        assertNotNull(toString);
        assertTrue(toString.contains("ApplicationStatusHistory"));
        assertTrue(toString.contains("APPLIED"));
        assertTrue(toString.contains("user1"));
    }
} 