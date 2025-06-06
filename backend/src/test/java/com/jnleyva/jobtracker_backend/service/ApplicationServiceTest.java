package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.config.TestConfig;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
class ApplicationServiceTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    private User testUser;
    private Application testApplication;
    private static int testCounter = 0;

    @BeforeEach
    void setUp() {
        // Create a unique username for each test method to avoid conflicts
        testCounter++;
        String uniqueUsername = "applicationtestuser" + testCounter + "_" + System.nanoTime();
        
        // Create a test user
        testUser = new User();
        testUser.setUsername(uniqueUsername);
        testUser.setPassword("Password123!");
        testUser.setEmail("apptest" + testCounter + "@example.com");
        testUser.setRole("ROLE_USER");
        testUser = userService.createUser(testUser);

        // Create a test application with complete required fields
        testApplication = new Application();
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Engineer");
        testApplication.setLocation("Remote");
        testApplication.setUrl("https://example.com/job");
        testApplication.setDescription("A great job opportunity");
        testApplication.setCompensation(100000.0);
        testApplication.setStatus("Applied");
        testApplication.setApplicationDate(LocalDate.now());
    }

    @AfterEach
    void tearDown() {
        // Clean up test data after each test
        try {
            if (testUser != null && testUser.getId() != null) {
                // First delete all applications for the user
                applicationService.deleteApplicationsByUserId(testUser.getId());
                // Then delete the user
                userService.deleteUser(testUser.getId());
            }
        } catch (Exception e) {
            // Ignore cleanup errors in tests
        }
    }

    // CREATE tests
    @Test
    void testCreateApplication_Success() {
        Application createdApplication = applicationService.createApplication(testApplication, testUser.getId());
        
        assertNotNull(createdApplication.getId());
        assertEquals(testApplication.getCompany(), createdApplication.getCompany());
        assertEquals(testApplication.getJobTitle(), createdApplication.getJobTitle());
        assertEquals(testApplication.getStatus(), createdApplication.getStatus());
        assertEquals(testUser.getId(), createdApplication.getUser().getId());
        
        // Verify timestamps were set
        assertNotNull(createdApplication.getCreatedAt());
        assertNotNull(createdApplication.getUpdatedAt());
        
        // Verify the bidirectional relationship
        User user = createdApplication.getUser();
        assertTrue(user.getApplications().contains(createdApplication));
    }

    @Test
    void testCreateApplication_UserNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.createApplication(testApplication, 999L);
        });
    }

    // READ tests
    @Test
    void testGetApplicationById_Success() {
        Application createdApplication = applicationService.createApplication(testApplication, testUser.getId());
        Application retrievedApplication = applicationService.getApplicationById(createdApplication.getId());
        
        assertEquals(createdApplication.getId(), retrievedApplication.getId());
        assertEquals(createdApplication.getCompany(), retrievedApplication.getCompany());
        assertEquals(createdApplication.getJobTitle(), retrievedApplication.getJobTitle());
    }

    @Test
    void testGetApplicationById_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.getApplicationById(999L);
        });
    }

    @Test
    void testGetAllApplications() {
        // Create a few applications
        applicationService.createApplication(testApplication, testUser.getId());
        
        Application secondApplication = new Application();
        secondApplication.setCompany("Second Company");
        secondApplication.setJobTitle("Senior Developer");
        secondApplication.setStatus("Interview");
        secondApplication.setApplicationDate(LocalDate.now());
        applicationService.createApplication(secondApplication, testUser.getId());
        
        // Get all applications
        List<Application> allApplications = applicationService.getAllApplications();
        
        // Should have at least 2 applications
        assertTrue(allApplications.size() >= 2);
        
        // Verify our test applications are in the list
        boolean foundFirstApp = false;
        boolean foundSecondApp = false;
        
        for (Application app : allApplications) {
            if (app.getCompany().equals(testApplication.getCompany()) && 
                app.getJobTitle().equals(testApplication.getJobTitle())) {
                foundFirstApp = true;
            }
            if (app.getCompany().equals("Second Company") && 
                app.getJobTitle().equals("Senior Developer")) {
                foundSecondApp = true;
            }
        }
        
        assertTrue(foundFirstApp);
        assertTrue(foundSecondApp);
    }

    @Test
    void testGetApplicationsByUserId() {
        // Create an application for our test user
        applicationService.createApplication(testApplication, testUser.getId());
        
        // Create a second user
        User secondUser = new User();
        secondUser.setUsername("seconduser" + testCounter + "_" + System.nanoTime());
        secondUser.setPassword("Password456!");
        secondUser.setEmail("second" + testCounter + "@example.com");
        secondUser.setRole("ROLE_USER");
        secondUser = userService.createUser(secondUser);
        
        // Create an application for the second user
        Application secondApp = new Application();
        secondApp.setCompany("Second User Company");
        secondApp.setJobTitle("Manager");
        secondApp.setStatus("Applied");
        secondApp.setApplicationDate(LocalDate.now());
        applicationService.createApplication(secondApp, secondUser.getId());
        
        // Get applications for first user
        List<Application> firstUserApps = applicationService.getApplicationsByUserId(testUser.getId());
        
        // Should have at least 1 application
        assertTrue(firstUserApps.size() >= 1);
        
        // Verify only the first user's applications are in the list
        for (Application app : firstUserApps) {
            assertEquals(testUser.getId(), app.getUser().getId());
        }
        
        // At least one app should match our test application
        boolean foundTestApp = false;
        for (Application app : firstUserApps) {
            if (app.getCompany().equals(testApplication.getCompany()) && 
                app.getJobTitle().equals(testApplication.getJobTitle())) {
                foundTestApp = true;
                break;
            }
        }
        assertTrue(foundTestApp);
    }

    @Test
    void testGetApplicationsByUserId_UserNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.getApplicationsByUserId(999L);
        });
    }

    // UPDATE tests
    @Test
    void testUpdateApplication_Success() {
        Application createdApplication = applicationService.createApplication(testApplication, testUser.getId());
        
        // Create update details with all required fields
        Application updateDetails = new Application();
        updateDetails.setCompany("Updated Company");
        updateDetails.setJobTitle("Updated Position");
        updateDetails.setLocation("New York");
        updateDetails.setUrl("https://updated.com/job");
        updateDetails.setDescription("Updated description");
        updateDetails.setCompensation(120000.0);
        updateDetails.setStatus("Offer");
        updateDetails.setApplicationDate(LocalDate.now().plusDays(1));
        
        // Update the application
        Application updatedApplication = applicationService.updateApplication(createdApplication.getId(), updateDetails);
        
        // Verify fields were updated
        assertEquals(updateDetails.getCompany(), updatedApplication.getCompany());
        assertEquals(updateDetails.getJobTitle(), updatedApplication.getJobTitle());
        assertEquals(updateDetails.getLocation(), updatedApplication.getLocation());
        assertEquals(updateDetails.getUrl(), updatedApplication.getUrl());
        assertEquals(updateDetails.getDescription(), updatedApplication.getDescription());
        assertEquals(updateDetails.getCompensation(), updatedApplication.getCompensation());
        assertEquals(updateDetails.getStatus(), updatedApplication.getStatus());
        assertEquals(updateDetails.getApplicationDate(), updatedApplication.getApplicationDate());
        
        // Verify user association didn't change
        assertEquals(testUser.getId(), updatedApplication.getUser().getId());
        
        // Verify timestamp was updated
        assertNotNull(updatedApplication.getUpdatedAt());
    }

    @Test
    void testUpdateApplication_NotFound() {
        Application updateDetails = new Application();
        updateDetails.setCompany("Updated Company");
        updateDetails.setJobTitle("Updated Position");
        updateDetails.setStatus("Interviewing");
        updateDetails.setApplicationDate(LocalDate.now());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.updateApplication(999L, updateDetails);
        });
    }

    // DELETE tests
    @Test
    void testDeleteApplication_Success() {
        Application createdApplication = applicationService.createApplication(testApplication, testUser.getId());
        Long appId = createdApplication.getId();
        
        // Delete the application
        applicationService.deleteApplication(appId);
        
        // Verify application was deleted
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.getApplicationById(appId);
        });
    }

    @Test
    void testDeleteApplication_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.deleteApplication(999L);
        });
    }

    @Test
    void testDeleteApplicationsByUserId() {
        // Create two applications for our test user
        Application firstApp = applicationService.createApplication(testApplication, testUser.getId());
        
        Application secondApp = new Application();
        secondApp.setCompany("Another Company");
        secondApp.setJobTitle("Developer");
        secondApp.setStatus("Applied");
        secondApp.setApplicationDate(LocalDate.now());
        Application secondAppCreated = applicationService.createApplication(secondApp, testUser.getId());
        
        // Force a flush to ensure entity state is synchronized with the database
        entityManager.flush();
        entityManager.clear();
        
        // Verify both applications were created
        List<Application> applicationsBefore = applicationService.getApplicationsByUserId(testUser.getId());
        assertEquals(2, applicationsBefore.size());
        
        // Delete all applications for the user
        applicationService.deleteApplicationsByUserId(testUser.getId());
        
        // Force a flush and clear the persistence context
        entityManager.flush();
        entityManager.clear();
        
        // Check if all applications are deleted
        Long count = applicationRepository.countByUserId(testUser.getId());
        assertEquals(0L, count, "Expected 0 applications after deletion, but found " + count);
        
        // Also verify using the service method
        List<Application> applicationsAfter = applicationService.getApplicationsByUserId(testUser.getId());
        assertEquals(0, applicationsAfter.size(), "Expected 0 applications after deletion via service, but found " + applicationsAfter.size());
    }

    @Test
    void testDeleteApplicationsByUserId_UserNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            applicationService.deleteApplicationsByUserId(999L);
        });
    }
} 