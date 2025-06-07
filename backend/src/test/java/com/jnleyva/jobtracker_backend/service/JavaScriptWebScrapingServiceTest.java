package com.jnleyva.jobtracker_backend.service;

import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JavaScriptWebScrapingServiceTest {

    @Mock
    private PlaywrightQueueService playwrightQueueService;

    private JavaScriptWebScrapingService jsWebScrapingService;

    @BeforeEach
    void setUp() {
        jsWebScrapingService = new JavaScriptWebScrapingService();
        // Inject the mock using reflection since it's @Autowired
        ReflectionTestUtils.setField(jsWebScrapingService, "playwrightQueueService", playwrightQueueService);
    }

    private Document createMockDocument() {
        Document mockDoc = mock(Document.class);
        Elements mockElements = mock(Elements.class);
        when(mockDoc.getAllElements()).thenReturn(mockElements);
        when(mockElements.size()).thenReturn(100);
        when(mockDoc.text()).thenReturn("Sample document text content");
        when(mockDoc.title()).thenReturn("Sample Document Title");
        return mockDoc;
    }

    @Test
    void testIsJavaScriptRenderingAvailable_WhenPlaywrightAvailable() {
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);

        boolean result = jsWebScrapingService.isJavaScriptRenderingAvailable();

        assertTrue(result, "JavaScript rendering should be available when Playwright is available");
    }

    @Test
    void testIsJavaScriptRenderingAvailable_WhenPlaywrightNotAvailable() {
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(false);

        boolean result = jsWebScrapingService.isJavaScriptRenderingAvailable();

        assertFalse(result, "JavaScript rendering should not be available when Playwright is not available");
    }

    @Test
    void testFetchDocumentWithJavaScript_Success() throws IOException {
        String testUrl = "https://example.com";
        int timeout = 5;
        Document mockDoc = createMockDocument();

        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, timeout)).thenReturn(mockDoc);

        Document result = jsWebScrapingService.fetchDocumentWithJavaScript(testUrl, timeout);

        assertSame(mockDoc, result, "Should return the document from PlaywrightQueueService");
        verify(playwrightQueueService).fetchDocumentWithQueue(testUrl, timeout);
    }

    @Test
    void testFetchDocumentWithJavaScript_DefaultTimeout() throws IOException {
        String testUrl = "https://example.com";
        Document mockDoc = createMockDocument();

        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, 5)).thenReturn(mockDoc);

        Document result = jsWebScrapingService.fetchDocumentWithJavaScript(testUrl);

        assertSame(mockDoc, result, "Should return the document using default timeout");
        verify(playwrightQueueService).fetchDocumentWithQueue(testUrl, 5);
    }

    @Test
    void testFetchDocumentWithJavaScript_PlaywrightNotAvailable() {
        String testUrl = "https://example.com";
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(false);

        IOException exception = assertThrows(IOException.class, () -> {
            jsWebScrapingService.fetchDocumentWithJavaScript(testUrl, 5);
        }, "Should throw IOException when Playwright is not available");

        assertTrue(exception.getMessage().contains("Playwright not available"), 
                  "Error message should indicate Playwright is not available");
    }

    @Test
    void testFetchDocumentWithJavaScript_IOException() throws IOException {
        String testUrl = "https://example.com";
        int timeout = 5;

        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, timeout))
            .thenThrow(new IOException("Network error"));

        assertThrows(IOException.class, () -> {
            jsWebScrapingService.fetchDocumentWithJavaScript(testUrl, timeout);
        }, "Should propagate IOException from PlaywrightQueueService");
    }

    @Test
    void testLikelyRequiresJavaScript() {
        // Test Microsoft URLs
        assertTrue(jsWebScrapingService.likelyRequiresJavaScript("https://careers.microsoft.com/job/123"));
        assertTrue(jsWebScrapingService.likelyRequiresJavaScript("https://jobs.careers.microsoft.com/job/456"));
        
        // Test other known JavaScript sites
        assertTrue(jsWebScrapingService.likelyRequiresJavaScript("https://metacareers.com/jobs/"));
        assertTrue(jsWebScrapingService.likelyRequiresJavaScript("https://careers.google.com/jobs/"));
        assertTrue(jsWebScrapingService.likelyRequiresJavaScript("https://amazon.jobs/en/jobs/"));
        
        // Test regular sites
        assertFalse(jsWebScrapingService.likelyRequiresJavaScript("https://github.com/jobs"));
        assertFalse(jsWebScrapingService.likelyRequiresJavaScript("https://stackoverflow.com/jobs"));
        
        // Test null/edge cases
        assertFalse(jsWebScrapingService.likelyRequiresJavaScript(null));
        assertFalse(jsWebScrapingService.likelyRequiresJavaScript(""));
    }

    @Test
    void testGetAvailableJavaScriptEngines() {
        PlaywrightQueueService.QueueStatus mockStatus = 
            new PlaywrightQueueService.QueueStatus(1, 0, 3, 2);
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(mockStatus);

        String result = jsWebScrapingService.getAvailableJavaScriptEngines();

        assertTrue(result.contains("Playwright"), "Should indicate Playwright is available");
        assertTrue(result.contains("Queue"), "Should include queue status information");
    }

    @Test
    void testGetAvailableJavaScriptEngines_NotAvailable() {
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(false);

        String result = jsWebScrapingService.getAvailableJavaScriptEngines();

        assertEquals("None available", result, "Should indicate no engines available");
    }

    @Test
    void testGetQueueStatus() {
        PlaywrightQueueService.QueueStatus mockStatus = 
            new PlaywrightQueueService.QueueStatus(1, 0, 3, 2);
        
        when(playwrightQueueService.getQueueStatus()).thenReturn(mockStatus);
        
        PlaywrightQueueService.QueueStatus result = jsWebScrapingService.getQueueStatus();
        
        assertSame(mockStatus, result, "Should return the queue status from queue service");
        verify(playwrightQueueService).getQueueStatus();
    }

    @Test
    void testTestJavaScriptFetch_Success() throws IOException {
        String testUrl = "https://example.com";
        Document mockDoc = createMockDocument();
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, 3)).thenReturn(mockDoc);

        boolean result = jsWebScrapingService.testJavaScriptFetch(testUrl);

        assertTrue(result, "Test should succeed when document has sufficient elements");
    }

    @Test
    void testTestJavaScriptFetch_InsufficientElements() throws IOException {
        String testUrl = "https://example.com";
        Document mockDoc = mock(Document.class);
        Elements mockElements = mock(Elements.class);
        
        when(mockDoc.getAllElements()).thenReturn(mockElements);
        when(mockElements.size()).thenReturn(30); // Less than 50 elements threshold
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, 3)).thenReturn(mockDoc);

        boolean result = jsWebScrapingService.testJavaScriptFetch(testUrl);

        assertFalse(result, "Test should fail when document has insufficient elements");
    }

    @Test
    void testTestJavaScriptFetch_Failure() throws IOException {
        String testUrl = "https://example.com";
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, 3))
            .thenThrow(new IOException("Network error"));

        boolean result = jsWebScrapingService.testJavaScriptFetch(testUrl);

        assertFalse(result, "Test should fail when exception occurs");
    }

    @Test
    void testIntegrationWithPlaywrightQueue() throws IOException {
        String testUrl = "https://microsoft.com/careers/job/123";
        int timeout = 10;
        Document mockDoc = createMockDocument();
        
        when(playwrightQueueService.isPlaywrightAvailable()).thenReturn(true);
        when(playwrightQueueService.getQueueStatus()).thenReturn(
            new PlaywrightQueueService.QueueStatus(0, 0, 3, 3));
        when(playwrightQueueService.fetchDocumentWithQueue(testUrl, timeout)).thenReturn(mockDoc);
        
        // Verify that the service properly delegates to the queue
        jsWebScrapingService.fetchDocumentWithJavaScript(testUrl, timeout);
        
        verify(playwrightQueueService, times(1)).fetchDocumentWithQueue(testUrl, timeout);
    }
} 