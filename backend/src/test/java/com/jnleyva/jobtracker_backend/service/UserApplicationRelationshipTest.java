package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.config.TestConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
class UserApplicationRelationshipTest {

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Test
    void testUserAndApplicationBidirectionalRelationship() {
        // Create a test user
        User user = new User();
        user.setUsername("relationshipuser");
        user.setPassword("Password123!");
        user.setEmail("relationship@example.com");
        user.setRole("ROLE_USER");
        user = userService.createUser(user);

        // Create a test application
        Application application = new Application();
        application.setCompany("Relationship Company");
        application.setJobTitle("Developer");
        application.setStatus("Applied");
        application.setApplicationDate(LocalDate.now());

        // Add application using service (which should handle the bidirectional relationship)
        Application savedApplication = applicationService.createApplication(application, user.getId());

        // Verify relationship from application to user
        assertNotNull(savedApplication.getUser());
        assertEquals(user.getId(), savedApplication.getUser().getId());

        // Verify relationship from user to application
        User retrievedUser = userService.getUserById(user.getId());
        assertFalse(retrievedUser.getApplications().isEmpty());
        
        // Store the application ID in a final variable for use in the lambda
        final Long applicationId = savedApplication.getId();
        assertTrue(retrievedUser.getApplications().stream()
                .anyMatch(app -> app.getId().equals(applicationId)));
    }

    @Test
    void testCascadeOnApplicationUpdate() {
        // Create a test user
        User user = new User();
        user.setUsername("cascadeuser");
        user.setPassword("Password123!");
        user.setEmail("cascade@example.com");
        user.setRole("ROLE_USER");
        user = userService.createUser(user);

        // Create applications
        Application app1 = new Application();
        app1.setCompany("Cascade Company 1");
        app1.setJobTitle("Developer");
        app1.setStatus("Applied");
        app1.setApplicationDate(LocalDate.now());
        app1 = applicationService.createApplication(app1, user.getId());

        Application app2 = new Application();
        app2.setCompany("Cascade Company 2");
        app2.setJobTitle("Senior Developer");
        app2.setStatus("Interview");
        app2.setApplicationDate(LocalDate.now());
        app2 = applicationService.createApplication(app2, user.getId());

        // Update an application
        Application updateDetails = new Application();
        updateDetails.setCompany("Updated Cascade Company");
        updateDetails.setJobTitle("Updated Job Title");
        updateDetails.setStatus("Offer");
        updateDetails.setApplicationDate(LocalDate.now().plusDays(7));
        
        applicationService.updateApplication(app1.getId(), updateDetails);

        // Verify the application was updated
        Application updatedApp = applicationService.getApplicationById(app1.getId());
        assertEquals("Updated Cascade Company", updatedApp.getCompany());
        assertEquals("Updated Job Title", updatedApp.getJobTitle());
        assertEquals("Offer", updatedApp.getStatus());

        // Verify relationship is still intact
        assertEquals(user.getId(), updatedApp.getUser().getId());
        
        // Verify user still has both applications
        User retrievedUser = userService.getUserById(user.getId());
        assertEquals(2, retrievedUser.getApplications().size());
    }

    @Test
    void testCascadeDeleteUserDeletingApplications() {
        // Create a test user
        User user = new User();
        user.setUsername("cascadedeleteuser");
        user.setPassword("Password123!");
        user.setEmail("cascadedelete@example.com");
        user.setRole("ROLE_USER");
        user = userService.createUser(user);
        Long userId = user.getId();

        // Create applications
        Application app1 = new Application();
        app1.setCompany("Delete Company 1");
        app1.setJobTitle("Developer");
        app1.setStatus("Applied");
        app1.setApplicationDate(LocalDate.now());
        app1 = applicationService.createApplication(app1, user.getId());
        Long app1Id = app1.getId();

        Application app2 = new Application();
        app2.setCompany("Delete Company 2");
        app2.setJobTitle("Senior Developer");
        app2.setStatus("Interview");
        app2.setApplicationDate(LocalDate.now());
        app2 = applicationService.createApplication(app2, user.getId());
        Long app2Id = app2.getId();

        // Verify applications exist
        assertEquals(2, applicationService.getApplicationsByUserId(userId).size());

        // Delete the user
        userService.deleteUser(userId);

        // Verify user is deleted
        Optional<User> deletedUser = userRepository.findById(userId);
        assertTrue(deletedUser.isEmpty());

        // Verify applications are also deleted
        List<Application> remainingApps = applicationRepository.findByUserId(userId);
        assertEquals(0, remainingApps.size());

        // Verify direct application retrieval also fails (or returns empty)
        Optional<Application> deletedApp1 = applicationRepository.findById(app1Id);
        Optional<Application> deletedApp2 = applicationRepository.findById(app2Id);
        assertTrue(deletedApp1.isEmpty());
        assertTrue(deletedApp2.isEmpty());
    }

    @Test
    void testAddAndRemoveApplicationFromUser() {
        // Create a test user
        User user = new User();
        user.setUsername("addremoveuser");
        user.setPassword("Password123!");
        user.setEmail("addremove@example.com");
        user.setRole("ROLE_USER");
        user = userService.createUser(user);

        // Create an application manually without using the service
        Application application = new Application();
        application.setCompany("Test Company");
        application.setJobTitle("Developer");
        application.setStatus("Applied");
        application.setApplicationDate(LocalDate.now());
        
        // Set up the bidirectional relationship manually
        user.addApplication(application);
        
        // Save via repository, not service
        application = applicationRepository.save(application);
        user = userRepository.save(user);
        
        // Verify relationship
        assertNotNull(application.getUser());
        assertEquals(user.getId(), application.getUser().getId());
        assertEquals(1, user.getApplications().size());
        
        // Now remove the application
        user.removeApplication(application);
        user = userRepository.save(user);
        
        // Verify application is no longer in the user's collection
        assertEquals(0, user.getApplications().size());
        
        // However, application still exists in database, but with null user reference
        Optional<Application> appOptional = applicationRepository.findById(application.getId());
        assertTrue(appOptional.isPresent());
        assertNull(appOptional.get().getUser());
    }
} 