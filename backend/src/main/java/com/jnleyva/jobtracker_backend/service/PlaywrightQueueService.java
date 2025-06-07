package com.jnleyva.jobtracker_backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service that manages Playwright browser instances with a queue system
 * to prevent resource exhaustion and ensure stable performance.
 */
@Service
public class PlaywrightQueueService {
    
    private static final Logger logger = LoggerFactory.getLogger(PlaywrightQueueService.class);
    
    // Configuration
    @Value("${playwright.max.concurrent.instances:3}")
    private int maxConcurrentInstances;
    
    @Value("${playwright.queue.timeout.seconds:60}")
    private int queueTimeoutSeconds;
    
    @Value("${playwright.request.timeout.seconds:30}")
    private int requestTimeoutSeconds;
    
    @Value("${playwright.wait.seconds:5}")
    private int defaultWaitSeconds;
    
    // Queue management
    private Semaphore browserSemaphore;
    private ExecutorService executorService;
    private final AtomicInteger activeInstances = new AtomicInteger(0);
    private final AtomicInteger queuedRequests = new AtomicInteger(0);
    
    private boolean playwrightAvailable = false;
    
    @PostConstruct
    public void initialize() {
        // Initialize semaphore with injected value
        this.browserSemaphore = new Semaphore(maxConcurrentInstances, true); // fair queue
        this.executorService = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "playwright-queue-" + System.currentTimeMillis());
            t.setDaemon(true);
            return t;
        });
        
        // Check if Playwright is available
        try {
            Class.forName("com.microsoft.playwright.Playwright");
            playwrightAvailable = true;
            logger.info("Playwright Queue Service initialized - Max concurrent instances: {}, Queue timeout: {}s", 
                       maxConcurrentInstances, queueTimeoutSeconds);
        } catch (ClassNotFoundException e) {
            playwrightAvailable = false;
            logger.warn("Playwright not available - Queue service disabled");
        }
    }
    
    /**
     * Check if Playwright rendering is available
     */
    public boolean isPlaywrightAvailable() {
        return playwrightAvailable;
    }
    
    /**
     * Get queue status information
     */
    public QueueStatus getQueueStatus() {
        return new QueueStatus(
            activeInstances.get(),
            queuedRequests.get(),
            maxConcurrentInstances,
            browserSemaphore.availablePermits()
        );
    }
    
    /**
     * Fetch document with Playwright using the queue system
     */
    public Document fetchDocumentWithQueue(String url) throws IOException {
        return fetchDocumentWithQueue(url, defaultWaitSeconds);
    }
    
    /**
     * Fetch document with Playwright using the queue system with custom wait time
     */
    public Document fetchDocumentWithQueue(String url, int waitSeconds) throws IOException {
        if (!playwrightAvailable) {
            throw new IOException("Playwright not available");
        }
        
        queuedRequests.incrementAndGet();
        LocalDateTime requestTime = LocalDateTime.now();
        
        try {
            logger.debug("Queuing Playwright request for: {} (Queue status: active={}, queued={}, available={})", 
                        url, activeInstances.get(), queuedRequests.get(), browserSemaphore.availablePermits());
            
            // Submit to queue with timeout
            Future<Document> future = executorService.submit(() -> {
                try {
                    // Wait for available browser slot
                    boolean acquired = browserSemaphore.tryAcquire(queueTimeoutSeconds, TimeUnit.SECONDS);
                    if (!acquired) {
                        throw new RuntimeException("Timeout waiting for available browser slot after " + queueTimeoutSeconds + " seconds");
                    }
                    
                    activeInstances.incrementAndGet();
                    logger.debug("Acquired browser slot for: {} (Active instances: {})", url, activeInstances.get());
                    
                    try {
                        return fetchWithPlaywright(url, waitSeconds);
                    } finally {
                        activeInstances.decrementAndGet();
                        browserSemaphore.release();
                        logger.debug("Released browser slot for: {} (Active instances: {})", url, activeInstances.get());
                    }
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Request interrupted while waiting in queue", e);
                } catch (Exception e) {
                    throw new RuntimeException("Playwright fetch failed: " + e.getMessage(), e);
                }
            });
            
            // Wait for result with timeout
            Document result = future.get(queueTimeoutSeconds + requestTimeoutSeconds, TimeUnit.SECONDS);
            
            Duration totalTime = Duration.between(requestTime, LocalDateTime.now());
            logger.info("Playwright request completed for: {} in {}ms", url, totalTime.toMillis());
            
            return result;
            
        } catch (TimeoutException e) {
            logger.error("Playwright request timed out for: {} after {}s", url, queueTimeoutSeconds + requestTimeoutSeconds);
            throw new IOException("Playwright request timed out after " + (queueTimeoutSeconds + requestTimeoutSeconds) + " seconds");
            
        } catch (ExecutionException e) {
            Throwable cause = e.getCause();
            logger.error("Playwright request failed for: {} - {}", url, cause.getMessage());
            throw new IOException("Playwright request failed: " + cause.getMessage(), cause);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Playwright request interrupted for: {}", url);
            throw new IOException("Playwright request interrupted", e);
            
        } finally {
            queuedRequests.decrementAndGet();
        }
    }
    
    /**
     * Internal method to perform the actual Playwright fetch
     */
    private Document fetchWithPlaywright(String url, int waitSeconds) throws IOException {
        try {
            // Use reflection to avoid compile-time dependency on Playwright
            Class<?> playwrightClass = Class.forName("com.microsoft.playwright.Playwright");
            Class<?> browserTypeClass = Class.forName("com.microsoft.playwright.BrowserType");
            Class<?> browserClass = Class.forName("com.microsoft.playwright.Browser");
            Class<?> pageClass = Class.forName("com.microsoft.playwright.Page");
            Class<?> browserContextClass = Class.forName("com.microsoft.playwright.BrowserContext");
            
            // Create Playwright instance
            Object playwright = playwrightClass.getMethod("create").invoke(null);
            
            try {
                // Get Chromium browser
                Object browserType = playwrightClass.getMethod("chromium").invoke(playwright);
                
                // Configure browser launch options
                Object launchOptions = Class.forName("com.microsoft.playwright.BrowserType$LaunchOptions")
                    .getDeclaredConstructor().newInstance();
                
                // Find system Chromium path
                String chromiumPath = findSystemChromium();
                if (chromiumPath != null) {
                    launchOptions.getClass().getMethod("setExecutablePath", java.nio.file.Path.class)
                        .invoke(launchOptions, java.nio.file.Paths.get(chromiumPath));
                    logger.debug("Using system Chromium at: {}", chromiumPath);
                }
                
                // Set headless mode and other options
                launchOptions.getClass().getMethod("setHeadless", boolean.class).invoke(launchOptions, true);
                launchOptions.getClass().getMethod("setTimeout", double.class).invoke(launchOptions, requestTimeoutSeconds * 1000.0);
                
                // Set args for better compatibility and resource efficiency
                String[] args = {
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-web-security",
                    "--disable-features=VizDisplayCompositor",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-extensions",
                    "--disable-plugins",
                    "--disable-images",
                    "--no-first-run",
                    "--disable-background-timer-throttling",
                    "--disable-backgrounding-occluded-windows",
                    "--disable-renderer-backgrounding",
                    "--memory-pressure-off"
                };
                launchOptions.getClass().getMethod("setArgs", java.util.List.class)
                    .invoke(launchOptions, java.util.Arrays.asList(args));
                
                // Launch browser
                Object browser = browserTypeClass.getMethod("launch", launchOptions.getClass())
                    .invoke(browserType, launchOptions);
                
                try {
                    // Create browser context with options
                    Object contextOptions = Class.forName("com.microsoft.playwright.Browser$NewContextOptions")
                        .getDeclaredConstructor().newInstance();
                    
                    // Set user agent
                    contextOptions.getClass().getMethod("setUserAgent", String.class)
                        .invoke(contextOptions, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                    
                    // Set viewport
                    Object viewport = Class.forName("com.microsoft.playwright.options.ViewportSize")
                        .getDeclaredConstructor(int.class, int.class).newInstance(1920, 1080);
                    contextOptions.getClass().getMethod("setViewportSize", viewport.getClass())
                        .invoke(contextOptions, viewport);
                    
                    // Create context
                    Object context = browserClass.getMethod("newContext", contextOptions.getClass())
                        .invoke(browser, contextOptions);
                    
                    try {
                        // Create page
                        Object page = browserContextClass.getMethod("newPage").invoke(context);
                        
                        // Set page timeout
                        pageClass.getMethod("setDefaultTimeout", double.class)
                            .invoke(page, requestTimeoutSeconds * 1000.0);
                        
                        logger.debug("Playwright: Navigating to {} (Active instances: {})", url, activeInstances.get());
                        
                        // Navigate to URL with wait for network idle
                        Object waitUntilOption = Class.forName("com.microsoft.playwright.options.WaitUntilState")
                            .getField("NETWORKIDLE").get(null);
                        
                        Object navigateOptions = Class.forName("com.microsoft.playwright.Page$NavigateOptions")
                            .getDeclaredConstructor().newInstance();
                        navigateOptions.getClass().getMethod("setWaitUntil", waitUntilOption.getClass())
                            .invoke(navigateOptions, waitUntilOption);
                        navigateOptions.getClass().getMethod("setTimeout", double.class)
                            .invoke(navigateOptions, requestTimeoutSeconds * 1000.0);
                        
                        pageClass.getMethod("navigate", String.class, navigateOptions.getClass())
                            .invoke(page, url, navigateOptions);
                        
                        // Wait for content to load
                        waitForContent(page, pageClass, waitSeconds);
                        
                        // Get page content
                        String content = (String) pageClass.getMethod("content").invoke(page);
                        
                        // Parse with JSoup
                        Document doc = Jsoup.parse(content, url);
                        
                        logger.debug("Playwright: Successfully fetched content - {} elements, {} text chars", 
                                   doc.getAllElements().size(), doc.text().length());
                        
                        return doc;
                        
                    } finally {
                        // Close context
                        browserContextClass.getMethod("close").invoke(context);
                    }
                } finally {
                    // Close browser
                    browserClass.getMethod("close").invoke(browser);
                }
            } finally {
                // Close playwright
                playwrightClass.getMethod("close").invoke(playwright);
            }
            
        } catch (Exception e) {
            logger.error("Error fetching with Playwright: {}", e.getMessage(), e);
            throw new IOException("Playwright fetch failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Wait for content to load with multiple strategies
     */
    private void waitForContent(Object page, Class<?> pageClass, int waitSeconds) {
        try {
            // Wait for common selectors that indicate the page has loaded
            String[] selectors = {
                "h1", "main", "[role='main']", ".content", "#content"
            };
            
            for (String selector : selectors) {
                try {
                    Object waitForSelectorOptions = Class.forName("com.microsoft.playwright.Page$WaitForSelectorOptions")
                        .getDeclaredConstructor().newInstance();
                    waitForSelectorOptions.getClass().getMethod("setTimeout", double.class)
                        .invoke(waitForSelectorOptions, Math.max(waitSeconds, 3) * 1000.0);
                    
                    Object element = pageClass.getMethod("waitForSelector", String.class, waitForSelectorOptions.getClass())
                        .invoke(page, selector, waitForSelectorOptions);
                    
                    if (element != null) {
                        logger.debug("Found element with selector: {}", selector);
                        // Additional wait for content to stabilize
                        Thread.sleep(Math.max(waitSeconds * 1000L, 2000L));
                        return;
                    }
                } catch (Exception e) {
                    logger.debug("Selector {} not found or timed out: {}", selector, e.getMessage());
                }
            }
            
            // Default wait if no specific selectors found
            Thread.sleep(Math.max(waitSeconds * 1000L, 3000L));
            
        } catch (Exception e) {
            logger.debug("Error in content wait: {}", e.getMessage());
        }
    }
    
    /**
     * Find system Chromium executable
     */
    private String findSystemChromium() {
        // Try to find system Chromium - first check if we're in a nix environment
        String[] nixPaths = {
            "/nix/store/n4zgacfdffqjj34qnxsf3kd4fkfkcvx4-chromium-137.0.7151.68/bin/chromium"
        };
        
        // Try the known nix path first
        for (String path : nixPaths) {
            java.io.File file = new java.io.File(path);
            if (file.exists() && file.canExecute()) {
                return path;
            }
        }
        
        // Try finding chromium in PATH
        try {
            Process process = Runtime.getRuntime().exec("which chromium");
            process.waitFor();
            if (process.exitValue() == 0) {
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream()));
                String path = reader.readLine();
                if (path != null && !path.trim().isEmpty()) {
                    return path.trim();
                }
            }
        } catch (Exception e) {
            logger.debug("Could not find chromium in PATH: {}", e.getMessage());
        }
        
        // Standard paths as fallback
        String[] standardPaths = {
            "/usr/bin/chromium",
            "/usr/bin/chromium-browser",
            "/usr/bin/google-chrome",
            "/snap/bin/chromium"
        };
        
        for (String path : standardPaths) {
            java.io.File file = new java.io.File(path);
            if (file.exists() && file.canExecute()) {
                return path;
            }
        }
        
        logger.warn("No system Chromium found, will rely on Playwright's bundled browser");
        return null;
    }
    
    /**
     * Shutdown the queue service
     */
    @PreDestroy
    public void shutdown() {
        logger.info("Shutting down Playwright Queue Service");
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(30, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * Queue status information
     */
    public static class QueueStatus {
        private final int activeInstances;
        private final int queuedRequests;
        private final int maxConcurrentInstances;
        private final int availableSlots;
        
        public QueueStatus(int activeInstances, int queuedRequests, int maxConcurrentInstances, int availableSlots) {
            this.activeInstances = activeInstances;
            this.queuedRequests = queuedRequests;
            this.maxConcurrentInstances = maxConcurrentInstances;
            this.availableSlots = availableSlots;
        }
        
        public int getActiveInstances() { return activeInstances; }
        public int getQueuedRequests() { return queuedRequests; }
        public int getMaxConcurrentInstances() { return maxConcurrentInstances; }
        public int getAvailableSlots() { return availableSlots; }
        
        @Override
        public String toString() {
            return String.format("QueueStatus{active=%d, queued=%d, max=%d, available=%d}", 
                                activeInstances, queuedRequests, maxConcurrentInstances, availableSlots);
        }
    }
} 