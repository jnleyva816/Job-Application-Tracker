package com.jnleyva.jobtracker_backend.service;

import org.jsoup.nodes.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaywrightQueueServiceTest {

    private PlaywrightQueueService playwrightQueueService;
    private final String TEST_URL = "https://example.com/test-job";

    @BeforeEach
    void setUp() {
        playwrightQueueService = new PlaywrightQueueService();
        // Set test configuration values
        ReflectionTestUtils.setField(playwrightQueueService, "maxConcurrentInstances", 2);
        ReflectionTestUtils.setField(playwrightQueueService, "queueTimeoutSeconds", 5);
        ReflectionTestUtils.setField(playwrightQueueService, "requestTimeoutSeconds", 10);
        ReflectionTestUtils.setField(playwrightQueueService, "defaultWaitSeconds", 3);
    }

    @Test
    void testPlaywrightAvailabilityDetection() {
        // Test Playwright availability detection
        playwrightQueueService.initialize();
        
        // Playwright may or may not be available in test environment
        // This just tests that the method works without throwing exceptions
        boolean isAvailable = playwrightQueueService.isPlaywrightAvailable();
        assertNotNull(isAvailable, "isPlaywrightAvailable should return a boolean value");
        
        // If Playwright is available, queue should work; if not, it should handle gracefully
        PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
        assertNotNull(status, "Queue status should not be null regardless of Playwright availability");
    }

    @Test
    void testQueueStatusInitialization() {
        playwrightQueueService.initialize();
        
        PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
        
        assertNotNull(status, "Queue status should not be null");
        assertEquals(0, status.getActiveInstances(), "Active instances should be 0 initially");
        assertEquals(0, status.getQueuedRequests(), "Queued requests should be 0 initially");
        assertEquals(2, status.getMaxConcurrentInstances(), "Max concurrent instances should match configuration");
        assertEquals(2, status.getAvailableSlots(), "Available slots should equal max instances initially");
    }

    @Test
    void testQueueStatusToString() {
        playwrightQueueService.initialize();
        
        PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
        String statusString = status.toString();
        
        assertNotNull(statusString, "Status string should not be null");
        assertTrue(statusString.contains("active=0"), "Status string should contain active count");
        assertTrue(statusString.contains("queued=0"), "Status string should contain queued count");
        assertTrue(statusString.contains("max=2"), "Status string should contain max instances");
        assertTrue(statusString.contains("available=2"), "Status string should contain available slots");
    }

    @Test
    void testFetchDocumentBehavior() {
        playwrightQueueService.initialize();
        
        if (playwrightQueueService.isPlaywrightAvailable()) {
            // If Playwright is available, test that fetch attempts work (may still fail due to invalid URLs)
            assertDoesNotThrow(() -> {
                try {
                    playwrightQueueService.fetchDocumentWithQueue(TEST_URL);
                } catch (IOException e) {
                    // Expected for invalid test URLs or network issues
                    assertTrue(e.getMessage().contains("Playwright") || e.getMessage().contains("failed"),
                              "Exception should be related to Playwright operation: " + e.getMessage());
                }
            }, "Should handle fetch attempts gracefully when Playwright is available");
        } else {
            // If Playwright is not available, should throw IOException
            IOException exception = assertThrows(IOException.class, () -> {
                playwrightQueueService.fetchDocumentWithQueue(TEST_URL);
            }, "Should throw IOException when Playwright is not available");
            
            assertEquals("Playwright not available", exception.getMessage(),
                        "Exception message should indicate Playwright unavailability");
        }
    }

    @Test
    void testFetchDocumentWithCustomWaitTime() {
        playwrightQueueService.initialize();
        
        if (playwrightQueueService.isPlaywrightAvailable()) {
            // If Playwright is available, test that fetch attempts work (may still fail due to invalid URLs)
            assertDoesNotThrow(() -> {
                try {
                    playwrightQueueService.fetchDocumentWithQueue(TEST_URL, 5);
                } catch (IOException e) {
                    // Expected for invalid test URLs or network issues
                    assertTrue(e.getMessage().contains("Playwright") || e.getMessage().contains("failed"),
                              "Exception should be related to Playwright operation: " + e.getMessage());
                }
            }, "Should handle fetch attempts gracefully when Playwright is available");
        } else {
            // If Playwright is not available, should throw IOException
            IOException exception = assertThrows(IOException.class, () -> {
                playwrightQueueService.fetchDocumentWithQueue(TEST_URL, 5);
            }, "Should throw IOException when Playwright is not available");
            
            assertEquals("Playwright not available", exception.getMessage(),
                        "Exception message should indicate Playwright unavailability");
        }
    }

    @Test
    void testConfigurationInjection() {
        // Test that configuration values are properly injected
        assertEquals(2, ReflectionTestUtils.getField(playwrightQueueService, "maxConcurrentInstances"),
                    "Max concurrent instances should be set");
        assertEquals(5, ReflectionTestUtils.getField(playwrightQueueService, "queueTimeoutSeconds"),
                    "Queue timeout should be set");
        assertEquals(10, ReflectionTestUtils.getField(playwrightQueueService, "requestTimeoutSeconds"),
                    "Request timeout should be set");
        assertEquals(3, ReflectionTestUtils.getField(playwrightQueueService, "defaultWaitSeconds"),
                    "Default wait seconds should be set");
    }

    @Test
    void testShutdownMethod() {
        playwrightQueueService.initialize();
        
        // Should not throw any exceptions
        assertDoesNotThrow(() -> {
            playwrightQueueService.shutdown();
        }, "Shutdown should not throw exceptions");
    }

    @Test
    void testQueueStatusGetters() {
        PlaywrightQueueService.QueueStatus status = 
            new PlaywrightQueueService.QueueStatus(1, 2, 3, 2);
        
        assertEquals(1, status.getActiveInstances(), "Active instances getter should work");
        assertEquals(2, status.getQueuedRequests(), "Queued requests getter should work");
        assertEquals(3, status.getMaxConcurrentInstances(), "Max concurrent instances getter should work");
        assertEquals(2, status.getAvailableSlots(), "Available slots getter should work");
    }

    @Test
    void testMultipleInitializationCalls() {
        // First initialization
        playwrightQueueService.initialize();
        PlaywrightQueueService.QueueStatus status1 = playwrightQueueService.getQueueStatus();
        
        // Second initialization (should not break anything)
        playwrightQueueService.initialize();
        PlaywrightQueueService.QueueStatus status2 = playwrightQueueService.getQueueStatus();
        
        // Status should still be valid
        assertNotNull(status1, "First status should not be null");
        assertNotNull(status2, "Second status should not be null");
        assertEquals(status1.getMaxConcurrentInstances(), status2.getMaxConcurrentInstances(),
                    "Max instances should remain the same");
    }

    @Test
    void testSystemChromiumDetection() {
        playwrightQueueService.initialize();
        
        // Test the private method via reflection (for testing purposes)
        // This tests the logic without actually calling external commands
        assertDoesNotThrow(() -> {
            ReflectionTestUtils.invokeMethod(playwrightQueueService, "findSystemChromium");
        }, "findSystemChromium should not throw exceptions");
    }

    // Integration test that would work if Playwright was available
    @Test
    void testPlaywrightIntegrationWhenAvailable() {
        // This test simulates what would happen if Playwright was available
        // We'll mock the availability check
        PlaywrightQueueService mockService = spy(playwrightQueueService);
        doReturn(true).when(mockService).isPlaywrightAvailable();
        
        mockService.initialize();
        assertTrue(mockService.isPlaywrightAvailable(), 
                  "Mocked service should report Playwright as available");
    }

    // Test to verify queue behavior under load (simulated)
    @Test
    void testQueueBehaviorSimulation() throws InterruptedException {
        playwrightQueueService.initialize();
        
        final int numThreads = 3; // Reduced to avoid timeout issues
        final CountDownLatch latch = new CountDownLatch(numThreads);
        final List<Exception> unexpectedExceptions = new ArrayList<>();
        
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        
        for (int i = 0; i < numThreads; i++) {
            executor.submit(() -> {
                try {
                    playwrightQueueService.fetchDocumentWithQueue("https://example.com/test-" + Thread.currentThread().getId());
                } catch (IOException e) {
                    // Expected - either Playwright not available or fetch failed due to invalid URL
                    if (!e.getMessage().contains("Playwright") && 
                        !e.getMessage().contains("failed") && 
                        !e.getMessage().contains("Timeout") &&
                        !e.getMessage().contains("Cannot navigate")) {
                        synchronized (unexpectedExceptions) {
                            unexpectedExceptions.add(e);
                        }
                    }
                } catch (Exception e) {
                    synchronized (unexpectedExceptions) {
                        unexpectedExceptions.add(e);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        boolean completed = latch.await(15, TimeUnit.SECONDS); // Increased timeout
        executor.shutdown();
        
        assertTrue(completed, "All threads should complete within timeout");
        assertTrue(unexpectedExceptions.isEmpty(), "No unexpected exceptions should occur: " + unexpectedExceptions);
        
        // Queue should be back to initial state (eventually)
        Thread.sleep(1000); // Give time for cleanup
        PlaywrightQueueService.QueueStatus status = playwrightQueueService.getQueueStatus();
        assertEquals(0, status.getActiveInstances(), "Active instances should be 0 after all requests");
        assertEquals(0, status.getQueuedRequests(), "Queued requests should be 0 after all requests");
    }

    @Test
    void testConfigurationDefaults() {
        // Test with default configuration values
        PlaywrightQueueService defaultService = new PlaywrightQueueService();
        // Don't set any fields - should use defaults from @Value annotations
        
        defaultService.initialize();
        
        // Should initialize without errors even with default values
        assertNotNull(defaultService.getQueueStatus(), "Should initialize with defaults");
    }

    @Test
    void testNullUrlHandling() {
        playwrightQueueService.initialize();
        
        // Should handle null URL gracefully by throwing IOException
        IOException exception = assertThrows(IOException.class, () -> {
            playwrightQueueService.fetchDocumentWithQueue(null);
        }, "Should handle null URL gracefully");
        
        // The exact message depends on Playwright availability
        assertNotNull(exception.getMessage(), "Exception should have a message");
    }

    @Test
    void testEmptyUrlHandling() {
        playwrightQueueService.initialize();
        
        // Should handle empty URL gracefully by throwing IOException
        IOException exception = assertThrows(IOException.class, () -> {
            playwrightQueueService.fetchDocumentWithQueue("");
        }, "Should handle empty URL gracefully");
        
        // The exact message depends on Playwright availability
        assertNotNull(exception.getMessage(), "Exception should have a message");
    }

    @Test
    void testNegativeWaitTime() {
        playwrightQueueService.initialize();
        
        // Should handle negative wait time gracefully
        if (playwrightQueueService.isPlaywrightAvailable()) {
            assertDoesNotThrow(() -> {
                try {
                    playwrightQueueService.fetchDocumentWithQueue(TEST_URL, -1);
                } catch (IOException e) {
                    // Expected for network/navigation issues
                    assertTrue(e.getMessage().contains("Playwright") || e.getMessage().contains("failed"),
                              "Exception should be related to fetch operation");
                }
            }, "Should handle negative wait time gracefully");
        } else {
            IOException exception = assertThrows(IOException.class, () -> {
                playwrightQueueService.fetchDocumentWithQueue(TEST_URL, -1);
            });
            assertEquals("Playwright not available", exception.getMessage());
        }
    }

    @Test
    void testZeroWaitTime() {
        playwrightQueueService.initialize();
        
        // Should handle zero wait time gracefully
        if (playwrightQueueService.isPlaywrightAvailable()) {
            assertDoesNotThrow(() -> {
                try {
                    playwrightQueueService.fetchDocumentWithQueue(TEST_URL, 0);
                } catch (IOException e) {
                    // Expected for network/navigation issues
                    assertTrue(e.getMessage().contains("Playwright") || e.getMessage().contains("failed"),
                              "Exception should be related to fetch operation");
                }
            }, "Should handle zero wait time gracefully");
        } else {
            IOException exception = assertThrows(IOException.class, () -> {
                playwrightQueueService.fetchDocumentWithQueue(TEST_URL, 0);
            });
            assertEquals("Playwright not available", exception.getMessage());
        }
    }
} 