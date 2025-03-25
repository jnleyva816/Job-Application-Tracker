package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.config.TestConfig;
import com.jnleyva.jobtracker_backend.exception.ResourceAlreadyExistsException;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create a fresh test user for each test
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("test@example.com");
        testUser.setRole("ROLE_USER");
    }

    // CREATE tests
    @Test
    void testCreateUser_Success() {
        User createdUser = userService.createUser(testUser);
        
        assertNotNull(createdUser.getId());
        assertEquals(testUser.getUsername(), createdUser.getUsername());
        assertEquals(testUser.getEmail(), createdUser.getEmail());
        assertEquals(testUser.getRole(), createdUser.getRole());
        
        // Skip password assertions for now
        
        // Verify timestamps were set
        assertNotNull(createdUser.getCreatedAt());
        assertNotNull(createdUser.getUpdatedAt());
    }

    @Test
    void testCreateUser_DuplicateUsername() {
        // Save first user
        userService.createUser(testUser);
        
        // Create second user with same username but different email
        User duplicateUser = new User();
        duplicateUser.setUsername("testuser");
        duplicateUser.setPassword("differentpassword");
        duplicateUser.setEmail("different@example.com");
        duplicateUser.setRole("ROLE_USER");
        
        // Should throw exception
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            userService.createUser(duplicateUser);
        });
    }

    @Test
    void testCreateUser_DuplicateEmail() {
        // Save first user
        userService.createUser(testUser);
        
        // Create second user with same email but different username
        User duplicateUser = new User();
        duplicateUser.setUsername("differentuser");
        duplicateUser.setPassword("differentpassword");
        duplicateUser.setEmail("test@example.com");
        duplicateUser.setRole("ROLE_USER");
        
        // Should throw exception
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            userService.createUser(duplicateUser);
        });
    }

    @Test
    void testCreateUser_DefaultRole() {
        // Create user without role
        testUser.setRole(null);
        User createdUser = userService.createUser(testUser);
        
        // Default role should be applied
        assertEquals("ROLE_USER", createdUser.getRole());
    }

    // READ tests
    @Test
    void testGetUserById_Success() {
        User savedUser = userService.createUser(testUser);
        User retrievedUser = userService.getUserById(savedUser.getId());
        
        assertEquals(savedUser.getId(), retrievedUser.getId());
        assertEquals(savedUser.getUsername(), retrievedUser.getUsername());
        assertEquals(savedUser.getEmail(), retrievedUser.getEmail());
    }

    @Test
    void testGetUserById_NotFound() {
        // Try to get user with non-existent ID
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(999L);
        });
    }

    @Test
    void testGetUserByUsername_Success() {
        userService.createUser(testUser);
        User retrievedUser = userService.getUserByUsername(testUser.getUsername());
        
        assertEquals(testUser.getUsername(), retrievedUser.getUsername());
        assertEquals(testUser.getEmail(), retrievedUser.getEmail());
    }

    @Test
    void testGetUserByUsername_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserByUsername("nonexistentuser");
        });
    }

    @Test
    void testGetUserByEmail_Success() {
        userService.createUser(testUser);
        User retrievedUser = userService.getUserByEmail(testUser.getEmail());
        
        assertEquals(testUser.getUsername(), retrievedUser.getUsername());
        assertEquals(testUser.getEmail(), retrievedUser.getEmail());
    }

    @Test
    void testGetUserByEmail_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserByEmail("nonexistent@example.com");
        });
    }

    @Test
    void testGetAllUsers() {
        // Create a few users
        userService.createUser(testUser);
        
        User secondUser = new User();
        secondUser.setUsername("testuser2");
        secondUser.setPassword("password456");
        secondUser.setEmail("test2@example.com");
        secondUser.setRole("ROLE_USER");
        userService.createUser(secondUser);
        
        // Get all users
        List<User> allUsers = userService.getAllUsers();
        
        // Should have at least 2 users
        assertTrue(allUsers.size() >= 2);
        
        // Verify our test users are in the list
        boolean foundFirstUser = false;
        boolean foundSecondUser = false;
        
        for (User user : allUsers) {
            if (user.getUsername().equals(testUser.getUsername())) {
                foundFirstUser = true;
            }
            if (user.getUsername().equals(secondUser.getUsername())) {
                foundSecondUser = true;
            }
        }
        
        assertTrue(foundFirstUser);
        assertTrue(foundSecondUser);
    }

    // UPDATE tests
    @Test
    void testUpdateUser_Success() {
        User savedUser = userService.createUser(testUser);
        
        // Update user details
        User updateDetails = new User();
        updateDetails.setUsername("updatedusername");
        updateDetails.setEmail("updated@example.com");
        updateDetails.setPassword("newpassword");
        updateDetails.setRole("ROLE_ADMIN");
        
        User updatedUser = userService.updateUser(savedUser.getId(), updateDetails);
        
        assertEquals(updateDetails.getUsername(), updatedUser.getUsername());
        assertEquals(updateDetails.getEmail(), updatedUser.getEmail());
        assertEquals(updateDetails.getRole(), updatedUser.getRole());
        
        // Verify password was encoded
        assertNotEquals(updateDetails.getPassword(), updatedUser.getPassword());
        
        // Verify timestamps
        assertEquals(savedUser.getCreatedAt(), updatedUser.getCreatedAt());
        assertNotNull(updatedUser.getUpdatedAt());
    }

    @Test
    void testUpdateUser_NotFound() {
        User updateDetails = new User();
        updateDetails.setUsername("updatedusername");
        updateDetails.setEmail("updated@example.com");
        
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.updateUser(999L, updateDetails);
        });
    }

    @Test
    void testUpdateUser_DuplicateUsername() {
        // Create first user
        User savedUser = userService.createUser(testUser);
        
        // Create second user
        User secondUser = new User();
        secondUser.setUsername("testuser2");
        secondUser.setPassword("password456");
        secondUser.setEmail("test2@example.com");
        secondUser.setRole("ROLE_USER");
        userService.createUser(secondUser);
        
        // Try to update first user with second user's username
        User updateDetails = new User();
        updateDetails.setUsername("testuser2");
        updateDetails.setEmail(savedUser.getEmail());
        
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            userService.updateUser(savedUser.getId(), updateDetails);
        });
    }

    @Test
    void testUpdateUser_DuplicateEmail() {
        // Create first user
        User savedUser = userService.createUser(testUser);
        
        // Create second user
        User secondUser = new User();
        secondUser.setUsername("testuser2");
        secondUser.setPassword("password456");
        secondUser.setEmail("test2@example.com");
        secondUser.setRole("ROLE_USER");
        userService.createUser(secondUser);
        
        // Try to update first user with second user's email
        User updateDetails = new User();
        updateDetails.setUsername(savedUser.getUsername());
        updateDetails.setEmail("test2@example.com");
        
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            userService.updateUser(savedUser.getId(), updateDetails);
        });
    }

    // DELETE tests
    @Test
    void testDeleteUser_Success() {
        User savedUser = userService.createUser(testUser);
        Long userId = savedUser.getId();
        
        // Delete the user
        userService.deleteUser(userId);
        
        // Verify user was deleted
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(userId);
        });
    }

    @Test
    void testDeleteUser_NotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.deleteUser(999L);
        });
    }
} 