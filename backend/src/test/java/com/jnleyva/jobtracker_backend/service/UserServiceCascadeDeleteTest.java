package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.config.TestConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
class UserServiceCascadeDeleteTest {

    @Autowired
    private UserService userService;


    @Autowired
    private ApplicationRepository applicationRepository;

    @Test
    void whenUserIsDeleted_thenApplicationsAreDeleted() {
        // Create a test user
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("Password123!");
        user.setEmail("test@example.com");
        user.setRole("ROLE_USER");
        user = userService.createUser(user);

        // Create a test application linked to the user
        Application application = new Application();
        application.setCompany("Test Company");
        application.setJobTitle("Test Position");
        application.setStatus("Applied");
        application.setApplicationDate(LocalDate.now());
        application.setUser(user);
        
        // Add the application to the user's collection (bidirectional relationship)
        user.addApplication(application);
        
        // Save the application
        application = applicationRepository.save(application);

        // Verify that the application was created
        List<Application> applications = applicationRepository.findByUserId(user.getId());
        assertEquals(1, applications.size());

        // Delete the user
        userService.deleteUser(user.getId());

        // Verify that the application was also deleted
        applications = applicationRepository.findByUserId(user.getId());
        assertEquals(0, applications.size());
    }
} 